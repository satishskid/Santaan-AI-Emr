// Supabase Data Service for IVF EMR - Real-time Multi-user Support
import { supabase, SupabasePatient, TreatmentRecord, logAuditEvent } from './supabaseClient';
import { authService } from './authService';
import { Patient, Task, PathwayStep } from '../types';

// Real-time subscriptions management
const subscriptions = new Map<string, any>();

export class SupabaseDataService {
  private static instance: SupabaseDataService;
  private patients: SupabasePatient[] = [];
  private listeners: ((patients: SupabasePatient[]) => void)[] = [];

  private constructor() {
    this.initializeRealtimeSubscriptions();
  }

  static getInstance(): SupabaseDataService {
    if (!SupabaseDataService.instance) {
      SupabaseDataService.instance = new SupabaseDataService();
    }
    return SupabaseDataService.instance;
  }

  // Initialize real-time subscriptions
  private initializeRealtimeSubscriptions() {
    const authState = authService.getAuthState();
    
    if (authState.profile?.clinic_id) {
      this.subscribeToPatients(authState.profile.clinic_id);
    }

    // Listen for auth changes to update subscriptions
    authService.subscribe((state) => {
      if (state.profile?.clinic_id) {
        this.subscribeToPatients(state.profile.clinic_id);
      } else {
        this.unsubscribeFromAll();
      }
    });
  }

  // Subscribe to real-time patient updates
  private subscribeToPatients(clinicId: string) {
    // Unsubscribe from existing subscription
    if (subscriptions.has('patients')) {
      subscriptions.get('patients').unsubscribe();
    }

    // Create new subscription
    const subscription = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `clinic_id=eq.${clinicId}`
        },
        (payload) => {
          console.log('Patient change detected:', payload);
          this.handlePatientChange(payload);
        }
      )
      .subscribe();

    subscriptions.set('patients', subscription);
    
    // Load initial data
    this.loadPatients();
  }

  // Handle real-time patient changes
  private handlePatientChange(payload: any) {
    switch (payload.eventType) {
      case 'INSERT':
        this.patients.push(payload.new as SupabasePatient);
        break;
      case 'UPDATE':
        const updateIndex = this.patients.findIndex(p => p.id === payload.new.id);
        if (updateIndex !== -1) {
          this.patients[updateIndex] = payload.new as SupabasePatient;
        }
        break;
      case 'DELETE':
        this.patients = this.patients.filter(p => p.id !== payload.old.id);
        break;
    }
    
    this.notifyListeners();
  }

  // Load patients from database
  private async loadPatients() {
    try {
      const authState = authService.getAuthState();
      if (!authState.profile?.clinic_id) return;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', authState.profile.clinic_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading patients:', error);
        return;
      }

      this.patients = data as SupabasePatient[];
      this.notifyListeners();

      // Log data access
      await logAuditEvent('patients_loaded', 'patients', undefined, {
        count: this.patients.length
      });

    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  }

  // Subscribe to patient updates
  subscribe(listener: (patients: SupabasePatient[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current data
    listener(this.patients);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.patients]));
  }

  // Get all patients
  async getPatients(): Promise<SupabasePatient[]> {
    if (this.patients.length === 0) {
      await this.loadPatients();
    }
    return [...this.patients];
  }

  // Get patient by ID
  async getPatient(patientId: string): Promise<SupabasePatient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        return null;
      }

      // Log patient access
      await logAuditEvent('patient_accessed', 'patients', patientId);

      return data as SupabasePatient;
    } catch (error) {
      console.error('Failed to get patient:', error);
      return null;
    }
  }

  // Create new patient
  async createPatient(patientData: Omit<SupabasePatient, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const authState = authService.getAuthState();
      if (!authState.profile?.clinic_id) {
        throw new Error('User not authenticated or no clinic assigned');
      }

      const newPatient = {
        ...patientData,
        clinic_id: authState.profile.clinic_id,
        is_active: true
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(newPatient)
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return null;
      }

      // Log patient creation
      await logAuditEvent('patient_created', 'patients', data.id, {
        patient_name: patientData.personal_info.name
      });

      return data.id;
    } catch (error) {
      console.error('Failed to create patient:', error);
      return null;
    }
  }

  // Update patient
  async updatePatient(patientId: string, updates: Partial<SupabasePatient>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId);

      if (error) {
        console.error('Error updating patient:', error);
        return false;
      }

      // Log patient update
      await logAuditEvent('patient_updated', 'patients', patientId, {
        updated_fields: Object.keys(updates)
      });

      return true;
    } catch (error) {
      console.error('Failed to update patient:', error);
      return false;
    }
  }

  // Delete patient (soft delete)
  async deletePatient(patientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', patientId);

      if (error) {
        console.error('Error deleting patient:', error);
        return false;
      }

      // Log patient deletion
      await logAuditEvent('patient_deleted', 'patients', patientId);

      return true;
    } catch (error) {
      console.error('Failed to delete patient:', error);
      return false;
    }
  }

  // Treatment Records Management
  async getTreatmentRecords(patientId: string): Promise<TreatmentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('treatment_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching treatment records:', error);
        return [];
      }

      return data as TreatmentRecord[];
    } catch (error) {
      console.error('Failed to get treatment records:', error);
      return [];
    }
  }

  async addTreatmentRecord(record: Omit<TreatmentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const authState = authService.getAuthState();
      if (!authState.user?.id || !authState.profile?.clinic_id) {
        throw new Error('User not authenticated');
      }

      const newRecord = {
        ...record,
        clinic_id: authState.profile.clinic_id,
        recorded_by: authState.user.id
      };

      const { data, error } = await supabase
        .from('treatment_records')
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        console.error('Error adding treatment record:', error);
        return null;
      }

      // Log treatment record creation
      await logAuditEvent('treatment_record_created', 'treatments', data.id, {
        patient_id: record.patient_id,
        treatment_type: record.treatment_type
      });

      return data.id;
    } catch (error) {
      console.error('Failed to add treatment record:', error);
      return null;
    }
  }

  async updateTreatmentRecord(recordId: string, updates: Partial<TreatmentRecord>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('treatment_records')
        .update(updates)
        .eq('id', recordId);

      if (error) {
        console.error('Error updating treatment record:', error);
        return false;
      }

      // Log treatment record update
      await logAuditEvent('treatment_record_updated', 'treatments', recordId, {
        updated_fields: Object.keys(updates)
      });

      return true;
    } catch (error) {
      console.error('Failed to update treatment record:', error);
      return false;
    }
  }

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const localData = localStorage.getItem('ivf_patients');
      if (!localData) return true;

      const localPatients = JSON.parse(localData);
      let migratedCount = 0;

      for (const localPatient of localPatients) {
        const supabasePatient = this.transformLocalToSupabase(localPatient);
        const patientId = await this.createPatient(supabasePatient);
        
        if (patientId) {
          migratedCount++;
          // Migrate treatment records if any
          await this.migrateTreatmentRecords(localPatient, patientId);
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('ivf_patients');
      
      // Log migration
      await logAuditEvent('data_migration', 'system', undefined, {
        migrated_patients: migratedCount,
        total_patients: localPatients.length
      });

      console.log(`Successfully migrated ${migratedCount} patients to Supabase`);
      return true;

    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }

  // Transform local patient data to Supabase format
  private transformLocalToSupabase(localPatient: any): Omit<SupabasePatient, 'id' | 'created_at' | 'updated_at'> {
    return {
      clinic_id: '', // Will be set in createPatient
      personal_info: {
        name: localPatient.name || '',
        age: localPatient.age || 0,
        partner_name: localPatient.partnerName || '',
        contact_info: {
          phone: '',
          email: '',
          address: ''
        }
      },
      medical_history: {
        conditions: [],
        allergies: [],
        previous_cycles: 0
      },
      current_treatment: {
        protocol: localPatient.protocol || '',
        cycle_start_date: localPatient.cycleStartDate || new Date().toISOString(),
        status: 'active',
        assigned_staff: []
      },
      permissions: {
        assigned_doctors: [],
        assigned_nurses: [],
        data_access_level: 'full'
      },
      is_active: true
    };
  }

  // Migrate treatment records for a patient
  private async migrateTreatmentRecords(localPatient: any, patientId: string) {
    if (!localPatient.pathway) return;

    for (const step of localPatient.pathway) {
      for (const task of step.tasks || []) {
        if (task.status === 'completed' && task.data) {
          await this.addTreatmentRecord({
            patient_id: patientId,
            clinic_id: '', // Will be set in addTreatmentRecord
            treatment_type: step.name,
            step_name: step.name,
            task_title: task.title,
            task_data: task.data,
            status: 'completed',
            assigned_to: '',
            recorded_by: '',
            notes: task.notes || ''
          });
        }
      }
    }
  }

  // Unsubscribe from all subscriptions
  private unsubscribeFromAll() {
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    subscriptions.clear();
  }

  // Cleanup method
  destroy() {
    this.unsubscribeFromAll();
    this.listeners = [];
    this.patients = [];
  }
}

// Export singleton instance
export const supabaseDataService = SupabaseDataService.getInstance();
export default supabaseDataService;
