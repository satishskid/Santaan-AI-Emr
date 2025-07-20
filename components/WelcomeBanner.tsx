import React, { useState } from 'react';
import { UserRole } from '../types';
import { XIcon, InfoIcon, ShieldIcon } from './icons';
import { Card, Badge } from './ui/DesignSystem';

interface WelcomeBannerProps {
  currentRole: UserRole;
  onDismiss?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ currentRole, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false); // Collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) {
    // Show minimal collapsed banner
    return (
      <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getRoleFeatures(currentRole).emoji}</div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Welcome to Santaan AI EMR</h3>
              <p className="text-xs text-slate-600">Logged in as {currentRole}</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(true)}
            className="text-cyan-600 hover:text-cyan-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-cyan-100 transition-colors"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getRoleFeatures = (role: UserRole) => {
    switch (role) {
      case UserRole.Nurse:
        return {
          emoji: '👩‍⚕️',
          features: ['Patient care coordination', 'Task management', 'Schedule viewing'],
          accessLevel: 'Basic Access',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case UserRole.Embryologist:
        return {
          emoji: '🔬',
          features: ['Laboratory workflow', 'Embryo culture tracking', 'Quality monitoring'],
          accessLevel: 'Laboratory Access',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case UserRole.Doctor:
        return {
          emoji: '👨‍⚕️',
          features: ['Clinical procedures', 'Patient treatment', 'Quality Dashboard access'],
          accessLevel: 'Clinical Access',
          color: 'bg-purple-50 border-purple-200 text-purple-800'
        };
      case UserRole.ClinicHead:
        return {
          emoji: '👨‍💼',
          features: ['Clinic management', 'Quality oversight', 'Executive Dashboard access'],
          accessLevel: 'Management Access',
          color: 'bg-orange-50 border-orange-200 text-orange-800'
        };
      case UserRole.Executive:
        return {
          emoji: '👔',
          features: ['Strategic planning', 'Business operations', 'Full system access'],
          accessLevel: 'Executive Access',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      default:
        return {
          emoji: '👤',
          features: ['Basic functionality'],
          accessLevel: 'Limited Access',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  const roleInfo = getRoleFeatures(currentRole);

  return (
    <Card className={`${roleInfo.color} border-2 mb-6 relative`}>
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Dismiss welcome banner"
      >
        <XIcon className="h-4 w-4" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
            {roleInfo.emoji}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">
              Welcome to IVF-EMR Clinic Dashboard
            </h3>
            <Badge variant="info" size="sm">
              {roleInfo.accessLevel}
            </Badge>
          </div>

          <p className="text-sm mb-3 opacity-90">
            You are logged in as <span className="font-medium">{currentRole}</span>. 
            This is your primary workspace for managing daily clinic operations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <InfoIcon className="h-4 w-4 mr-1" />
                Available Features
              </h4>
              <ul className="text-xs space-y-1 opacity-80">
                {roleInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <ShieldIcon className="h-4 w-4 mr-1" />
                Access Levels
              </h4>
              <div className="text-xs space-y-1 opacity-80">
                <div className="flex justify-between">
                  <span>Clinic Dashboard</span>
                  <span className="text-green-600 font-medium">✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Dashboard</span>
                  <span className={currentRole === UserRole.Doctor || currentRole === UserRole.ClinicHead || currentRole === UserRole.Executive ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {currentRole === UserRole.Doctor || currentRole === UserRole.ClinicHead || currentRole === UserRole.Executive ? '✓ Available' : '⚠ Requires Doctor+'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Executive Dashboard</span>
                  <span className={currentRole === UserRole.ClinicHead || currentRole === UserRole.Executive ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {currentRole === UserRole.ClinicHead || currentRole === UserRole.Executive ? '✓ Available' : '⚠ Requires Clinic Head+'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-current/20">
            <p className="text-xs opacity-75">
              💡 <strong>Tip:</strong> Use the view mode toggle (Workflow/Timeline/Priority) to organize tasks based on your current needs. 
              The search and filter options help you quickly find specific patients or tasks.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeBanner;
