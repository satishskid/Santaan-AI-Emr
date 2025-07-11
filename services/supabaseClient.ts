// Supabase Client Configuration for IVF EMR
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase configuration
const supabaseUrl = 'https://uzjoolaejhitcwyoarxx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6am9vbGFlamhpdGN3eW9hcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjUyMTUsImV4cCI6MjA2NzgwMTIxNX0.tnHXzqDbJ9xB0WajNyzKGzbRodMh50wGMgnuUCSahPc';

// Create Supabase client
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Types for our application
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
  clinic_id: string;
  permissions: {
    patients: { read: boolean; write: boolean; delete: boolean };
    treatments: { read: boolean; write: boolean; delete: boolean };
    reports: { read: boolean; write: boolean };
    configuration: { read: boolean; write: boolean };
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabasePatient {
  id: string;
  clinic_id: string;
  personal_info: {
    name: string;
    age: number;
    partner_name?: string;
    contact_info: {
      phone: string;
      email: string;
      address: string;
    };
  };
  medical_history: {
    conditions: string[];
    allergies: string[];
    previous_cycles: number;
    amh?: number;
    bmi?: number;
  };
  current_treatment: {
    protocol: string;
    cycle_start_date: string;
    status: 'active' | 'completed' | 'cancelled';
    assigned_staff: string[];
  };
  permissions: {
    assigned_doctors: string[];
    assigned_nurses: string[];
    data_access_level: 'full' | 'limited' | 'view-only';
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TreatmentRecord {
  id: string;
  patient_id: string;
  clinic_id: string;
  treatment_type: string;
  step_name: string;
  task_title: string;
  task_data: any;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  clinic_id: string;
  ip_address?: string;
  user_agent?: string;
  details: any;
  created_at: string;
}

// Authentication helper functions
export const getCurrentUser = (): User | null => {
  return supabase.auth.getUser().then(({ data }) => data.user);
};

export const getCurrentSession = (): Promise<Session | null> => {
  return supabase.auth.getSession().then(({ data }) => data.session);
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Helper function to get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
};

// Helper function to check permissions
export const hasPermission = (
  userProfile: UserProfile,
  resource: keyof UserProfile['permissions'],
  action: 'read' | 'write' | 'delete'
): boolean => {
  return userProfile.permissions[resource][action] || false;
};

// Helper function to check clinic access
export const hasClinicAccess = (userProfile: UserProfile, clinicId: string): boolean => {
  return userProfile.clinic_id === clinicId || userProfile.role === 'admin';
};

// Real-time subscription helpers
export const subscribeToPatients = (
  clinicId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('patients_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patients',
        filter: `clinic_id=eq.${clinicId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToTreatments = (
  patientId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('treatments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'treatment_records',
        filter: `patient_id=eq.${patientId}`
      },
      callback
    )
    .subscribe();
};

// Error handling helper
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  
  // Log error for audit purposes
  if (error.code) {
    logAuditEvent('error', 'system', undefined, {
      context,
      error_code: error.code,
      error_message: error.message
    });
  }
  
  throw new Error(`${context}: ${error.message || 'Unknown error'}`);
};

// Audit logging helper
export const logAuditEvent = async (
  action: string,
  resource: string,
  resourceId?: string,
  details?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userProfile = await getUserProfile(user.id);
    if (!userProfile) return;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      resource,
      resource_id: resourceId,
      clinic_id: userProfile.clinic_id,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      details: details || {}
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

// Get client IP address
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

// Database health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Export the configured client
export default supabase;
