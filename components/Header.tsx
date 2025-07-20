
import React from 'react';
import { DnaIcon, LayoutDashboardIcon, ClipboardListIcon, ChevronLeftIcon, BarChart3Icon, SettingsIcon, BookOpenIcon, ActivityIcon, HeartIcon } from './icons';
import { UserRole } from '../types';
import RoleSelector from './RoleSelector';
import HealthAlertBadge from './HealthAlertBadge';

interface HeaderProps {
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'clinic' | 'quality' | 'patient' | 'executive' | 'configuration' | 'training' | 'workflow' | 'counseling' | 'test-clinic';
  onNavigate: (view: 'clinic' | 'quality' | 'executive' | 'configuration' | 'training' | 'workflow' | 'counseling' | 'test-clinic') => void;
  selectedPatientName?: string;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm dark:bg-cyan-900/50 dark:text-cyan-200'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50'
        } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50`}
    >
        {children}
    </button>
);


// Define role-based access levels
const ROLE_ACCESS_LEVELS = {
  [UserRole.Nurse]: 1,
  [UserRole.Embryologist]: 2,
  [UserRole.Doctor]: 3,
  [UserRole.ClinicHead]: 4,
  [UserRole.Executive]: 5
};

// Check if user has access to privileged views
const hasPrivilegedAccess = (userRole: UserRole, requiredLevel: number): boolean => {
  return ROLE_ACCESS_LEVELS[userRole] >= requiredLevel;
};

const Header: React.FC<HeaderProps> = ({ currentUserRole, onRoleChange, activeView, onNavigate, selectedPatientName }) => {
  // Access control for different views
  const canAccessQuality = hasPrivilegedAccess(currentUserRole, 3); // Doctor level and above
  const canAccessExecutive = hasPrivilegedAccess(currentUserRole, 4); // Clinic Head level and above

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
                <DnaIcon className="h-8 w-8 text-cyan-600" />
                <span className="ml-3 text-xl font-bold text-slate-900 dark:text-white hidden sm:inline tracking-tight">
                Santaan AI EMR
                </span>
            </div>
             <div className="h-8 border-l border-slate-200 dark:border-slate-600" />

             {activeView === 'patient' ? (
                 <button
                    onClick={() => onNavigate('clinic')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 >
                     <ChevronLeftIcon className="h-5 w-5" />
                     <span>Back to Dashboard</span>
                 </button>
             ) : (
                <nav className="flex items-center space-x-2">
                    {/* Clinic Dashboard - Always accessible */}
                    <NavButton onClick={() => onNavigate('clinic')} isActive={activeView === 'clinic'}>
                        <LayoutDashboardIcon className="h-5 w-5"/>
                        <span>Clinic Dashboard</span>
                    </NavButton>

                    {/* Quality Dashboard - Doctor level and above */}
                    {canAccessQuality && (
                        <NavButton onClick={() => onNavigate('quality')} isActive={activeView === 'quality'}>
                            <ClipboardListIcon className="h-5 w-5"/>
                            <span>Quality</span>
                            {currentUserRole === UserRole.Doctor && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    Dr
                                </span>
                            )}
                        </NavButton>
                    )}

                    {/* Executive Dashboard - Clinic Head level and above */}
                    {canAccessExecutive && (
                        <NavButton onClick={() => onNavigate('executive')} isActive={activeView === 'executive'}>
                            <BarChart3Icon className="h-5 w-5"/>
                            <span>Executive</span>
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Admin
                            </span>
                        </NavButton>
                    )}

                    {/* Training - Always accessible */}
                    <NavButton onClick={() => onNavigate('training')} isActive={activeView === 'training'}>
                        <BookOpenIcon className="h-5 w-5"/>
                        <span>Training</span>
                    </NavButton>

                    {/* Workflow Demo - Always accessible */}
                    <NavButton onClick={() => onNavigate('workflow')} isActive={activeView === 'workflow'}>
                        <ActivityIcon className="h-5 w-5"/>
                        <span>Workflow</span>
                    </NavButton>

                    {/* Vibe Counseling - Always accessible */}
                    <NavButton onClick={() => onNavigate('counseling')} isActive={activeView === 'counseling'}>
                        <HeartIcon className="h-5 w-5"/>
                        <span>Vibe</span>
                    </NavButton>

                    {/* Test Clinic - Always accessible for demo */}
                    <NavButton onClick={() => onNavigate('test-clinic')} isActive={activeView === 'test-clinic'}>
                        <div className="h-5 w-5 flex items-center justify-center text-lg">🏥</div>
                        <span>Demo</span>
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                            Test
                        </span>
                    </NavButton>

                    {/* Configuration - Clinic Head level and above */}
                    {canAccessExecutive && (
                        <NavButton onClick={() => onNavigate('configuration')} isActive={activeView === 'configuration'}>
                            <SettingsIcon className="h-5 w-5"/>
                            <span>Config</span>
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                                Admin
                            </span>
                        </NavButton>
                    )}
                </nav>
             )}
          </div>
          <div className="flex items-center space-x-6">
            {activeView === 'patient' && selectedPatientName && (
                 <div className="text-sm font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Patient: </span>
                    <span className="text-blue-600 dark:text-blue-400">{selectedPatientName}</span>
                 </div>
            )}
            <HealthAlertBadge userRole={currentUserRole} />
             <RoleSelector
                currentUserRole={currentUserRole}
                onRoleChange={onRoleChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
