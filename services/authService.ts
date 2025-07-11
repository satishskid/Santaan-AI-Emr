// Authentication Service for IVF EMR with Supabase
import { supabase, UserProfile, logAuditEvent, getUserProfile } from './supabaseClient';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
  clinicId: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  // Initialize authentication state
  private async initializeAuth() {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        this.updateAuthState({ error: error.message, loading: false });
        return;
      }

      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        this.updateAuthState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null
        });
      } else {
        this.updateAuthState({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          this.updateAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null
          });

          // Log authentication events
          if (event === 'SIGNED_IN') {
            await logAuditEvent('user_login', 'authentication', session.user.id);
          }
        } else {
          if (event === 'SIGNED_OUT' && this.authState.user) {
            await logAuditEvent('user_logout', 'authentication', this.authState.user.id);
          }
          
          this.updateAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          });
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateAuthState({ 
        error: 'Failed to initialize authentication', 
        loading: false 
      });
    }
  }

  // Update auth state and notify listeners
  private updateAuthState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.authState);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.authState;
  }

  // Sign up new user
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      this.updateAuthState({ loading: true, error: null });

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
            clinic_id: data.clinicId
          }
        }
      });

      if (authError) {
        this.updateAuthState({ error: authError.message, loading: false });
        return { user: null, error: authError };
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: data.role,
            clinic_id: data.clinicId,
            permissions: this.getDefaultPermissions(data.role)
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          this.updateAuthState({ error: 'Failed to create user profile', loading: false });
          return { user: null, error: profileError as AuthError };
        }

        // Log user creation
        await logAuditEvent('user_created', 'authentication', authData.user.id, {
          role: data.role,
          clinic_id: data.clinicId
        });
      }

      this.updateAuthState({ loading: false });
      return { user: authData.user, error: null };

    } catch (error) {
      console.error('Sign up error:', error);
      this.updateAuthState({ 
        error: 'An unexpected error occurred during sign up', 
        loading: false 
      });
      return { user: null, error: error as AuthError };
    }
  }

  // Sign in user
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      this.updateAuthState({ loading: true, error: null });

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        this.updateAuthState({ error: error.message, loading: false });
        
        // Log failed login attempt
        await logAuditEvent('failed_login', 'authentication', undefined, {
          email: data.email,
          error: error.message
        });
        
        return { user: null, error };
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { user: authData.user, error: null };

    } catch (error) {
      console.error('Sign in error:', error);
      this.updateAuthState({ 
        error: 'An unexpected error occurred during sign in', 
        loading: false 
      });
      return { user: null, error: error as AuthError };
    }
  }

  // Sign out user
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      this.updateAuthState({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        this.updateAuthState({ error: error.message, loading: false });
        return { error };
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { error: null };

    } catch (error) {
      console.error('Sign out error:', error);
      this.updateAuthState({ 
        error: 'An unexpected error occurred during sign out', 
        loading: false 
      });
      return { error: error as AuthError };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { error };
      }

      // Log password reset request
      await logAuditEvent('password_reset_requested', 'authentication', undefined, {
        email
      });

      return { error: null };

    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as AuthError };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error };
      }

      // Log password change
      if (this.authState.user) {
        await logAuditEvent('password_changed', 'authentication', this.authState.user.id);
      }

      return { error: null };

    } catch (error) {
      console.error('Password update error:', error);
      return { error: error as AuthError };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
    try {
      if (!this.authState.user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.authState.user.id);

      if (error) {
        return { error };
      }

      // Refresh profile data
      const updatedProfile = await getUserProfile(this.authState.user.id);
      this.updateAuthState({ profile: updatedProfile });

      // Log profile update
      await logAuditEvent('profile_updated', 'user_profile', this.authState.user.id, {
        updated_fields: Object.keys(updates)
      });

      return { error: null };

    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  }

  // Check if user has permission
  hasPermission(resource: keyof UserProfile['permissions'], action: 'read' | 'write' | 'delete'): boolean {
    if (!this.authState.profile) return false;
    
    // Admins have all permissions
    if (this.authState.profile.role === 'admin') return true;
    
    return this.authState.profile.permissions[resource]?.[action] || false;
  }

  // Check if user belongs to clinic
  belongsToClinic(clinicId: string): boolean {
    if (!this.authState.profile) return false;
    return this.authState.profile.clinic_id === clinicId;
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: string) {
    const permissions = {
      patients: { read: false, write: false, delete: false },
      treatments: { read: false, write: false, delete: false },
      reports: { read: false, write: false },
      configuration: { read: false, write: false }
    };

    switch (role) {
      case 'admin':
        return {
          patients: { read: true, write: true, delete: true },
          treatments: { read: true, write: true, delete: true },
          reports: { read: true, write: true },
          configuration: { read: true, write: true }
        };
      
      case 'doctor':
        return {
          patients: { read: true, write: true, delete: false },
          treatments: { read: true, write: true, delete: false },
          reports: { read: true, write: true },
          configuration: { read: true, write: false }
        };
      
      case 'nurse':
        return {
          patients: { read: true, write: true, delete: false },
          treatments: { read: true, write: true, delete: false },
          reports: { read: true, write: false },
          configuration: { read: false, write: false }
        };
      
      case 'embryologist':
        return {
          patients: { read: true, write: false, delete: false },
          treatments: { read: true, write: true, delete: false },
          reports: { read: true, write: true },
          configuration: { read: false, write: false }
        };
      
      case 'receptionist':
        return {
          patients: { read: true, write: false, delete: false },
          treatments: { read: true, write: false, delete: false },
          reports: { read: false, write: false },
          configuration: { read: false, write: false }
        };
      
      default:
        return permissions;
    }
  }

  // Refresh user session
  async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return { session: null, error };
    }

    return { session: data.session, error: null };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
