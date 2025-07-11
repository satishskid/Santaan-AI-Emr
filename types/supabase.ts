// Supabase Database Types for IVF EMR
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string
          resource_id: string | null
          clinic_id: string | null
          ip_address: string | null
          user_agent: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource: string
          resource_id?: string | null
          clinic_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          clinic_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json
          created_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          license_number: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          license_number?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          license_number?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      file_attachments: {
        Row: {
          id: string
          patient_id: string
          treatment_record_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number | null
          uploaded_by: string
          is_encrypted: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          treatment_record_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size?: number | null
          uploaded_by: string
          is_encrypted?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          treatment_record_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number | null
          uploaded_by?: string
          is_encrypted?: boolean | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean | null
          related_resource_type: string | null
          related_resource_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean | null
          related_resource_type?: string | null
          related_resource_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean | null
          related_resource_type?: string | null
          related_resource_id?: string | null
          created_at?: string
        }
      }
      patient_pathways: {
        Row: {
          id: string
          patient_id: string
          step_name: string
          step_status: string
          step_order: number
          tasks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          step_name: string
          step_status?: string
          step_order: number
          tasks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          step_name?: string
          step_status?: string
          step_order?: number
          tasks?: Json
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          clinic_id: string
          personal_info: Json
          medical_history: Json
          current_treatment: Json
          permissions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          personal_info: Json
          medical_history?: Json
          current_treatment?: Json
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          personal_info?: Json
          medical_history?: Json
          current_treatment?: Json
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      treatment_records: {
        Row: {
          id: string
          patient_id: string
          clinic_id: string
          treatment_type: string
          step_name: string
          task_title: string
          task_data: Json
          status: Database["public"]["Enums"]["treatment_status"]
          assigned_to: string | null
          recorded_by: string
          notes: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          clinic_id: string
          treatment_type: string
          step_name: string
          task_title: string
          task_data?: Json
          status?: Database["public"]["Enums"]["treatment_status"]
          assigned_to?: string | null
          recorded_by: string
          notes?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          clinic_id?: string
          treatment_type?: string
          step_name?: string
          task_title?: string
          task_data?: Json
          status?: Database["public"]["Enums"]["treatment_status"]
          assigned_to?: string | null
          recorded_by?: string
          notes?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          clinic_id: string
          permissions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: Database["public"]["Enums"]["user_role"]
          clinic_id: string
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          clinic_id?: string
          permissions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      data_access_level: "full" | "limited" | "view-only"
      patient_status: "active" | "completed" | "cancelled"
      treatment_status: "pending" | "in_progress" | "completed" | "cancelled"
      user_role: "doctor" | "nurse" | "embryologist" | "admin" | "receptionist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
