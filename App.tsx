
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, PatientPathwayStep, UserRole, Task, NewPatientOnboardingInfo } from './types';
import { getAllPatients, createNewPatient } from './services/ivfDataService';
// import { AuthProvider, useAuth, useAuthStatus } from './contexts/AuthContext';
import { SimpleAuthProvider, useSimpleAuthStatus } from './contexts/SimpleAuthContext';
import LoginForm from './components/auth/LoginForm';
import Header from './components/Header';
import PatientPathway from './components/PatientPathway';
import ClinicDashboard from './components/ClinicDashboard';
import QualityDashboard from './components/QualityDashboard';
import EnhancedQualityDashboard from './components/EnhancedQualityDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AccessDenied from './components/AccessDenied';
import ConfigurationPanel from './components/ConfigurationPanel';
import TrainingDashboard from './components/TrainingDashboard';
import WorkflowDemo from './components/WorkflowDemo';
import VibeCounselingDashboard from './components/VibeCounselingDashboard';
import { LoadingIcon } from './components/icons';

type AppView = 'clinic' | 'quality' | 'patient' | 'executive' | 'configuration' | 'training' | 'workflow' | 'counseling';

// Main App Component with Authentication
const AppContent: React.FC = () => {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Doctor);
  const [activeView, setActiveView] = useState<AppView>('clinic');

  // Get authentication state
  const { isAuthenticated, isLoading: authLoading, profile } = useSimpleAuthStatus();

  // Debug logging
  console.log('App render - Auth state:', { isAuthenticated, authLoading, profile });

  // Update user role based on profile - ALWAYS call this hook
  useEffect(() => {
    if (profile?.role) {
      const roleMapping = {
        'doctor': UserRole.Doctor,
        'nurse': UserRole.Nurse,
        'embryologist': UserRole.Embryologist,
        'admin': UserRole.Admin,
        'receptionist': UserRole.Receptionist
      };
      setCurrentUserRole(roleMapping[profile.role] || UserRole.Doctor);
    }
  }, [profile]);

  // ALWAYS call this useEffect hook to maintain hook order
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const data = await getAllPatients();
        setAllPatients(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patient data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [isAuthenticated]);

  const handleUpdatePatientData = (updatedTask: Task, stepId: string, patientId: string) => {
      setAllPatients(prevPatients => 
          prevPatients.map(p => {
              if (p.id !== patientId) return p;
              
              const updatedPathway = p.pathway.map(step => {
                  if (step.stepId !== stepId) return step;
                  return {
                      ...step,
                      tasks: step.tasks.map(task => 
                          task.id === updatedTask.id ? updatedTask : task
                      )
                  };
              });

              return { ...p, pathway: updatedPathway };
          })
      );
  };
  
  const handleAddNewPatient = (patientInfo: NewPatientOnboardingInfo) => {
    const newPatient = createNewPatient(patientInfo);
    setAllPatients(prevPatients => [...prevPatients, newPatient]);
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveView('patient');
  };

  // Role-based access control
  const ROLE_ACCESS_LEVELS = {
    [UserRole.Nurse]: 1,
    [UserRole.Embryologist]: 2,
    [UserRole.Doctor]: 3,
    [UserRole.ClinicHead]: 4,
    [UserRole.Executive]: 5
  };

  const hasPrivilegedAccess = (userRole: UserRole, requiredLevel: number): boolean => {
    return ROLE_ACCESS_LEVELS[userRole] >= requiredLevel;
  };

  const handleNavigate = (view: AppView) => {
    // Access control validation
    if (view === 'quality' && !hasPrivilegedAccess(currentUserRole, 3)) {
      alert('Access Denied: Quality Dashboard requires Doctor level access or higher.');
      return;
    }

    if (view === 'executive' && !hasPrivilegedAccess(currentUserRole, 4)) {
      alert('Access Denied: Executive Dashboard requires Clinic Head level access or higher.');
      return;
    }

    if (view !== 'patient') {
      setSelectedPatientId(null);
    }
    setActiveView(view);
  };
  
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return allPatients.find(p => p.id === selectedPatientId) || null;
  }, [selectedPatientId, allPatients]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <LoadingIcon className="h-12 w-12 animate-spin" />
          <p className="ml-4 text-lg">Loading Clinic Data...</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    switch (activeView) {
      case 'executive':
        // Check access for Executive Dashboard
        if (!hasPrivilegedAccess(currentUserRole, 4)) {
          return (
            <AccessDenied
              requiredRole="Clinic Head"
              currentRole={currentUserRole}
              dashboardName="Executive Dashboard"
              onReturnToDashboard={() => setActiveView('clinic')}
            />
          );
        }
        return <ExecutiveDashboard patients={allPatients} />;

      case 'clinic':
        return (
          <ClinicDashboard
            patients={allPatients}
            onSelectPatient={handleSelectPatient}
            currentUserRole={currentUserRole}
            onAddNewPatient={handleAddNewPatient}
          />
        );

      case 'quality':
        // Check access for Quality Dashboard
        if (!hasPrivilegedAccess(currentUserRole, 3)) {
          return (
            <AccessDenied
              requiredRole="Doctor"
              currentRole={currentUserRole}
              dashboardName="Quality Dashboard"
              onReturnToDashboard={() => setActiveView('clinic')}
            />
          );
        }
        return <EnhancedQualityDashboard patients={allPatients} />;

      case 'configuration':
        // Check access for Configuration Panel
        if (!hasPrivilegedAccess(currentUserRole, 4)) {
          return (
            <AccessDenied
              requiredRole="Clinic Head"
              currentRole={currentUserRole}
              dashboardName="System Configuration"
              onReturnToDashboard={() => setActiveView('clinic')}
            />
          );
        }
        return (
          <ConfigurationPanel
            currentUserRole={currentUserRole}
            onConfigurationChange={(config) => {
              console.log('Configuration updated:', config);
            }}
          />
        );

      case 'training':
        return (
          <TrainingDashboard
            userId={`user-${currentUserRole.toLowerCase()}`}
            userRole={currentUserRole}
            userName={`${currentUserRole} User`}
          />
        );

      case 'workflow':
        return <WorkflowDemo currentUserRole={currentUserRole} />;

      case 'counseling':
        return <VibeCounselingDashboard currentUserRole={currentUserRole} />;

      case 'patient':
        return selectedPatient ? (
           <PatientPathway
              patient={selectedPatient}
              onUpdate={handleUpdatePatientData}
              currentUserRole={currentUserRole}
            />
        ) : (
          <div className="text-center text-slate-500">No patient selected. Please return to the dashboard.</div>
        );

      default:
        return null;
    }
  };

  // Handle authentication states AFTER all hooks are called
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => {
      // No need to reload - React will re-render when auth state changes
      console.log('Login successful!');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans">
      <Header 
        activeView={activeView}
        onNavigate={handleNavigate}
        currentUserRole={currentUserRole}
        onRoleChange={setCurrentUserRole}
        selectedPatientName={selectedPatient?.name}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-screen-2xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Main App Component with Authentication Provider
const App: React.FC = () => {
  return (
    <SimpleAuthProvider>
      <AppContent />
    </SimpleAuthProvider>
  );
};

export default App;
