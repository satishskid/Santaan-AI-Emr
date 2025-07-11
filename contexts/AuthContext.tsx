// Authentication Context for IVF EMR
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthState } from '../services/authService';
import { UserProfile } from '../services/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
    clinicId: string;
  }) => Promise<{ user: User | null; error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  hasPermission: (resource: keyof UserProfile['permissions'], action: 'read' | 'write' | 'delete') => boolean;
  belongsToClinic: (clinicId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return authService.signIn({ email, password });
  };

  const signOut = async () => {
    return authService.signOut();
  };

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
    clinicId: string;
  }) => {
    return authService.signUp(data);
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return authService.updatePassword(newPassword);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    return authService.updateProfile(updates);
  };

  const hasPermission = (resource: keyof UserProfile['permissions'], action: 'read' | 'write' | 'delete') => {
    return authService.hasPermission(resource, action);
  };

  const belongsToClinic = (clinicId: string) => {
    return authService.belongsToClinic(clinicId);
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
    updateProfile,
    hasPermission,
    belongsToClinic
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: keyof UserProfile['permissions'];
    action: 'read' | 'write' | 'delete';
  };
  requiredRole?: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = <div className="p-4 text-center text-red-600">Access denied</div>
}) => {
  const { user, profile, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return fallback;
  }

  // Check role requirement
  if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
    return fallback;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return fallback;
  }

  return <>{children}</>;
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { user, profile, loading } = useAuth();
  
  return {
    isAuthenticated: !!user && !!profile,
    isLoading: loading,
    user,
    profile
  };
};

// Hook for permission checking
export const usePermissions = () => {
  const { hasPermission, profile } = useAuth();
  
  return {
    hasPermission,
    isAdmin: profile?.role === 'admin',
    isDoctor: profile?.role === 'doctor',
    isNurse: profile?.role === 'nurse',
    isEmbryologist: profile?.role === 'embryologist',
    isReceptionist: profile?.role === 'receptionist',
    canReadPatients: hasPermission('patients', 'read'),
    canWritePatients: hasPermission('patients', 'write'),
    canDeletePatients: hasPermission('patients', 'delete'),
    canReadTreatments: hasPermission('treatments', 'read'),
    canWriteTreatments: hasPermission('treatments', 'write'),
    canDeleteTreatments: hasPermission('treatments', 'delete'),
    canReadReports: hasPermission('reports', 'read'),
    canWriteReports: hasPermission('reports', 'write'),
    canReadConfiguration: hasPermission('configuration', 'read'),
    canWriteConfiguration: hasPermission('configuration', 'write')
  };
};

export default AuthContext;
