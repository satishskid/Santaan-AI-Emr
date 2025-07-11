// Simple Authentication Context for Production
import React, { createContext, useContext, useState } from 'react';

interface SimpleAuthState {
  isAuthenticated: boolean;
  user: any;
  profile: any;
  loading: boolean;
}

interface SimpleAuthContextType extends SimpleAuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: React.ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<SimpleAuthState>({
    isAuthenticated: false,
    user: null,
    profile: null,
    loading: false
  });

  const signIn = async (email: string, password: string) => {
    // Simple mock authentication for demo
    if (email === 'admin@democlinic.com' && password === 'demo123456') {
      setAuthState({
        isAuthenticated: true,
        user: { id: '1', email },
        profile: { 
          role: 'admin', 
          full_name: 'Admin User',
          clinic_id: '00000000-0000-0000-0000-000000000001',
          permissions: {
            patients: { read: true, write: true, delete: true },
            treatments: { read: true, write: true, delete: true },
            reports: { read: true, write: true },
            configuration: { read: true, write: true }
          }
        },
        loading: false
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signOut = async () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      profile: null,
      loading: false
    });
  };

  const contextValue: SimpleAuthContextType = {
    ...authState,
    signIn,
    signOut
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Hook for checking authentication status
export const useSimpleAuthStatus = () => {
  const { isAuthenticated, loading, user, profile } = useSimpleAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    user,
    profile
  };
};

export default SimpleAuthContext;
