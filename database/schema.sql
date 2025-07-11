-- IVF EMR Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'embryologist', 'admin', 'receptionist');
CREATE TYPE treatment_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE patient_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE data_access_level AS ENUM ('full', 'limited', 'view-only');

-- 1. User Profiles Table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'nurse',
    clinic_id UUID NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{
        "patients": {"read": true, "write": false, "delete": false},
        "treatments": {"read": true, "write": false, "delete": false},
        "reports": {"read": true, "write": false},
        "configuration": {"read": false, "write": false}
    }',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clinics Table
CREATE TABLE clinics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Patients Table
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    personal_info JSONB NOT NULL,
    medical_history JSONB NOT NULL DEFAULT '{}',
    current_treatment JSONB NOT NULL DEFAULT '{}',
    permissions JSONB NOT NULL DEFAULT '{
        "assigned_doctors": [],
        "assigned_nurses": [],
        "data_access_level": "full"
    }',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Treatment Records Table
CREATE TABLE treatment_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    treatment_type TEXT NOT NULL,
    step_name TEXT NOT NULL,
    task_title TEXT NOT NULL,
    task_data JSONB NOT NULL DEFAULT '{}',
    status treatment_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id),
    recorded_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Patient Pathways Table (for tracking treatment progress)
CREATE TABLE patient_pathways (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    step_status TEXT NOT NULL DEFAULT 'upcoming',
    step_order INTEGER NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id UUID,
    clinic_id UUID REFERENCES clinics(id),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. File Attachments Table
CREATE TABLE file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_record_id UUID REFERENCES treatment_records(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_resource_type TEXT,
    related_resource_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_is_active ON patients(is_active);
CREATE INDEX idx_treatment_records_patient_id ON treatment_records(patient_id);
CREATE INDEX idx_treatment_records_clinic_id ON treatment_records(clinic_id);
CREATE INDEX idx_treatment_records_status ON treatment_records(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_records_updated_at BEFORE UPDATE ON treatment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_pathways_updated_at BEFORE UPDATE ON patient_pathways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Clinics Policies
CREATE POLICY "Users can view own clinic" ON clinics FOR SELECT USING (
    id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid())
);

-- Patients Policies
CREATE POLICY "Users can view patients from own clinic" ON patients FOR SELECT USING (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can insert patients in own clinic" ON patients FOR INSERT WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can update patients in own clinic" ON patients FOR UPDATE USING (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Treatment Records Policies
CREATE POLICY "Users can view treatment records from own clinic" ON treatment_records FOR SELECT USING (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can insert treatment records in own clinic" ON treatment_records FOR INSERT WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can update treatment records in own clinic" ON treatment_records FOR UPDATE USING (
    clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Patient Pathways Policies
CREATE POLICY "Users can view pathways for accessible patients" ON patient_pathways FOR SELECT USING (
    patient_id IN (
        SELECT id FROM patients 
        WHERE clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
    )
);

CREATE POLICY "Users can manage pathways for accessible patients" ON patient_pathways FOR ALL USING (
    patient_id IN (
        SELECT id FROM patients 
        WHERE clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
    )
);

-- Audit Logs Policies (read-only for admins)
CREATE POLICY "Admins can view audit logs from own clinic" ON audit_logs FOR SELECT USING (
    clinic_id IN (
        SELECT clinic_id FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- File Attachments Policies
CREATE POLICY "Users can view files for accessible patients" ON file_attachments FOR SELECT USING (
    patient_id IN (
        SELECT id FROM patients 
        WHERE clinic_id IN (SELECT clinic_id FROM user_profiles WHERE id = auth.uid() AND is_active = true)
    )
);

-- Insert default clinic and admin user (run after creating your first user)
-- You'll need to replace the UUID with your actual user ID from auth.users
/*
INSERT INTO clinics (id, name, address, phone, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo IVF Clinic', '123 Medical Center Dr', '+1-555-0123', 'admin@democlinic.com');

-- Replace 'your-user-id-here' with actual user ID from auth.users table
INSERT INTO user_profiles (id, email, full_name, role, clinic_id, permissions) VALUES 
('your-user-id-here', 'admin@democlinic.com', 'Admin User', 'admin', '00000000-0000-0000-0000-000000000001', 
'{
    "patients": {"read": true, "write": true, "delete": true},
    "treatments": {"read": true, "write": true, "delete": true},
    "reports": {"read": true, "write": true},
    "configuration": {"read": true, "write": true}
}');
*/
