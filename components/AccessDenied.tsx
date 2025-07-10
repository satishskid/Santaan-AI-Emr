import React from 'react';
import { UserRole } from '../types';
import { ShieldIcon, LockIcon, UserIcon } from './icons';

interface AccessDeniedProps {
  requiredRole: string;
  currentRole: UserRole;
  dashboardName: string;
  onReturnToDashboard: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  currentRole,
  dashboardName,
  onReturnToDashboard
}) => {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.Nurse:
        return '👩‍⚕️';
      case UserRole.Embryologist:
        return '🔬';
      case UserRole.Doctor:
        return '👨‍⚕️';
      case UserRole.ClinicHead:
        return '👨‍💼';
      case UserRole.Executive:
        return '👔';
      default:
        return '👤';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case UserRole.Nurse:
        return 'Clinical support and patient care';
      case UserRole.Embryologist:
        return 'Laboratory operations and embryo culture';
      case UserRole.Doctor:
        return 'Clinical procedures and patient treatment';
      case UserRole.ClinicHead:
        return 'Clinic management and quality oversight';
      case UserRole.Executive:
        return 'Strategic planning and business operations';
      default:
        return 'General access';
    }
  };

  const getAccessLevelColor = (dashboardName: string) => {
    if (dashboardName.includes('Executive')) {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        accent: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700'
      };
    } else if (dashboardName.includes('Quality')) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      accent: 'text-gray-600',
      button: 'bg-gray-600 hover:bg-gray-700'
    };
  };

  const colors = getAccessLevelColor(dashboardName);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-8 max-w-lg mx-auto shadow-lg`}>
        <div className="text-center">
          {/* Access Denied Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <LockIcon className="h-8 w-8 text-red-600" />
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
            Access Restricted
          </h2>
          
          {/* Dashboard Name */}
          <p className={`text-lg ${colors.accent} mb-6`}>
            {dashboardName}
          </p>

          {/* Access Requirements */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-center mb-3">
              <ShieldIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Access Requirements</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              This dashboard requires <span className="font-semibold">{requiredRole}</span> level access or higher.
            </p>
            
            {/* Current Role Display */}
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center justify-center">
                <span className="text-lg mr-2">{getRoleIcon(currentRole)}</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Current Role: {currentRole}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleDescription(currentRole)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Hierarchy Information */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-center">
              <UserIcon className="h-4 w-4 mr-2" />
              Role Hierarchy
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="mr-2">👩‍⚕️</span>
                  Nurse
                </span>
                <span className="text-gray-400">Level 1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="mr-2">🔬</span>
                  Embryologist
                </span>
                <span className="text-gray-400">Level 2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="mr-2">👨‍⚕️</span>
                  Doctor
                </span>
                <span className="text-blue-600 font-medium">Level 3 - Quality Access</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="mr-2">👨‍💼</span>
                  Clinic Head
                </span>
                <span className="text-purple-600 font-medium">Level 4 - Executive Access</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="mr-2">👔</span>
                  Executive
                </span>
                <span className="text-purple-600 font-medium">Level 5 - Full Access</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onReturnToDashboard}
              className={`w-full px-6 py-3 ${colors.button} text-white rounded-lg font-medium transition-colors`}
            >
              Return to Clinic Dashboard
            </button>
            
            <p className="text-xs text-gray-500">
              Contact your administrator to request elevated access permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
