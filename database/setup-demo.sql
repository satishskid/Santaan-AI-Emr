-- Quick Demo Setup for Supabase IVF EMR
-- Run this in your Supabase SQL Editor after running the main schema.sql

-- 1. Create a demo clinic
INSERT INTO clinics (id, name, address, phone, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo IVF Clinic', '123 Medical Center Dr, Mumbai', '+91-98765-43210', 'admin@democlinic.com')
ON CONFLICT (id) DO NOTHING;

-- 2. After creating your first user through Supabase Auth, run this:
-- (Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users table)

/*
-- First, check what users exist:
SELECT id, email FROM auth.users;

-- Then create the admin profile (replace the UUID):
INSERT INTO user_profiles (id, email, full_name, role, clinic_id, permissions) VALUES 
('YOUR_USER_ID_HERE', 'admin@democlinic.com', 'Admin User', 'admin', '00000000-0000-0000-0000-000000000001', 
'{
    "patients": {"read": true, "write": true, "delete": true},
    "treatments": {"read": true, "write": true, "delete": true},
    "reports": {"read": true, "write": true},
    "configuration": {"read": true, "write": true}
}');
*/

-- 3. Create some demo users (optional)
-- You can create these users through Supabase Auth UI, then add their profiles:

/*
-- Doctor profile example:
INSERT INTO user_profiles (id, email, full_name, role, clinic_id, permissions) VALUES 
('DOCTOR_USER_ID', 'doctor@democlinic.com', 'Dr. Priya Sharma', 'doctor', '00000000-0000-0000-0000-000000000001', 
'{
    "patients": {"read": true, "write": true, "delete": false},
    "treatments": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": true},
    "configuration": {"read": true, "write": false}
}');

-- Nurse profile example:
INSERT INTO user_profiles (id, email, full_name, role, clinic_id, permissions) VALUES 
('NURSE_USER_ID', 'nurse@democlinic.com', 'Nurse Meera Patel', 'nurse', '00000000-0000-0000-0000-000000000001', 
'{
    "patients": {"read": true, "write": true, "delete": false},
    "treatments": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": false},
    "configuration": {"read": false, "write": false}
}');
*/

-- 4. Verify setup
SELECT 'Clinics' as table_name, count(*) as count FROM clinics
UNION ALL
SELECT 'User Profiles' as table_name, count(*) as count FROM user_profiles
UNION ALL
SELECT 'Patients' as table_name, count(*) as count FROM patients;

-- 5. Test RLS policies
-- This should return data only for your clinic:
SELECT p.*, c.name as clinic_name 
FROM patients p 
JOIN clinics c ON p.clinic_id = c.id 
WHERE p.clinic_id = '00000000-0000-0000-0000-000000000001';

-- 6. Check audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
