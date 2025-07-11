import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Card, Badge, Button } from './ui/DesignSystem';
import ClinicManagement from './admin/ClinicManagement';
import SystemHealthMonitor from './admin/SystemHealthMonitor';
import { 
  SettingsIcon, 
  SaveIcon, 
  RefreshIcon, 
  DownloadIcon, 
  UploadIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  ActivityIcon,
  BellIcon
} from './icons';
import { 
  ConfigurationService, 
  ClinicConfiguration, 
  GeneralSettings, 
  SchedulingSettings, 
  ResourceSettings, 
  WellnessSettings,
  NotificationSettings,
  AnalyticsSettings
} from '../services/configurationService';

interface ConfigurationPanelProps {
  currentUserRole: UserRole;
  onConfigurationChange?: (config: ClinicConfiguration) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  currentUserRole,
  onConfigurationChange
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'scheduling' | 'resources' | 'wellness' | 'notifications' | 'analytics' | 'clinics' | 'health'>('general');
  const [configuration, setConfiguration] = useState<ClinicConfiguration>(ConfigurationService.getConfiguration());
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Check if user has admin access
  const hasAdminAccess = currentUserRole === UserRole.ClinicHead || currentUserRole === UserRole.Executive;

  useEffect(() => {
    const currentConfig = ConfigurationService.getConfiguration();
    setConfiguration(currentConfig);
  }, []);

  const handleConfigurationUpdate = (section: string, updates: any) => {
    const newConfig = { ...configuration };
    (newConfig as any)[section] = { ...newConfig[section as keyof ClinicConfiguration], ...updates };
    setConfiguration(newConfig);
    setHasChanges(true);
    
    // Validate configuration
    const validation = ConfigurationService.validateConfiguration(newConfig);
    setValidationErrors(validation.errors);
  };

  const handleSave = async () => {
    if (!hasAdminAccess) return;
    
    setSaveStatus('saving');
    try {
      const validation = ConfigurationService.validateConfiguration(configuration);
      if (validation.isValid) {
        ConfigurationService.updateConfiguration(configuration, currentUserRole);
        setHasChanges(false);
        setSaveStatus('saved');
        onConfigurationChange?.(configuration);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setValidationErrors(validation.errors);
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleReset = () => {
    if (!hasAdminAccess) return;
    
    ConfigurationService.resetToDefaults(currentUserRole);
    const defaultConfig = ConfigurationService.getConfiguration();
    setConfiguration(defaultConfig);
    setHasChanges(false);
    setValidationErrors([]);
  };

  const handleExport = () => {
    const configJson = ConfigurationService.exportConfiguration();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic-configuration-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !hasAdminAccess) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = ConfigurationService.importConfiguration(content, currentUserRole);
      if (result.success) {
        const importedConfig = ConfigurationService.getConfiguration();
        setConfiguration(importedConfig);
        setHasChanges(false);
        setValidationErrors([]);
        onConfigurationChange?.(importedConfig);
      } else {
        setValidationErrors(result.errors);
      }
    };
    reader.readAsText(file);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clinic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Clinic Name
            </label>
            <input
              type="text"
              value={configuration.general.clinicName}
              onChange={(e) => handleConfigurationUpdate('general', { clinicName: e.target.value })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={configuration.general.timezone}
              onChange={(e) => handleConfigurationUpdate('general', { timezone: e.target.value })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">GMT</option>
            </select>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Working Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={configuration.general.workingHours.start}
              onChange={(e) => handleConfigurationUpdate('general', { 
                workingHours: { ...configuration.general.workingHours, start: e.target.value }
              })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={configuration.general.workingHours.end}
              onChange={(e) => handleConfigurationUpdate('general', { 
                workingHours: { ...configuration.general.workingHours, end: e.target.value }
              })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Working Days</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={configuration.general.workingDays.includes(day)}
                onChange={(e) => {
                  const workingDays = e.target.checked
                    ? [...configuration.general.workingDays, day]
                    : configuration.general.workingDays.filter(d => d !== day);
                  handleConfigurationUpdate('general', { workingDays });
                }}
                disabled={!hasAdminAccess}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Slot Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              value={configuration.scheduling.defaultSlotDuration}
              onChange={(e) => handleConfigurationUpdate('scheduling', { defaultSlotDuration: parseInt(e.target.value) })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buffer Between Appointments (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={configuration.scheduling.bufferBetweenAppointments}
              onChange={(e) => handleConfigurationUpdate('scheduling', { bufferBetweenAppointments: parseInt(e.target.value) })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Rules</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Advance Booking (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={configuration.scheduling.maxAdvanceBooking}
              onChange={(e) => handleConfigurationUpdate('scheduling', { maxAdvanceBooking: parseInt(e.target.value) })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuration.scheduling.allowOverbooking}
              onChange={(e) => handleConfigurationUpdate('scheduling', { allowOverbooking: e.target.checked })}
              disabled={!hasAdminAccess}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Allow Overbooking
            </label>
          </div>
          {configuration.scheduling.allowOverbooking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overbooking Percentage
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={configuration.scheduling.overbookingPercentage}
                onChange={(e) => handleConfigurationUpdate('scheduling', { overbookingPercentage: parseInt(e.target.value) })}
                disabled={!hasAdminAccess}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Staff Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Staff Configuration</h3>
        <div className="space-y-4">
          {configuration.resources.staff.map((staff, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{staff.role}</h4>
                <Badge variant="info">${staff.costPerHour}/hr</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Daily Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={staff.maxDailyHours}
                    onChange={(e) => {
                      const updatedStaff = [...configuration.resources.staff];
                      updatedStaff[index] = { ...staff, maxDailyHours: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { staff: updatedStaff });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Weekly Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={staff.maxWeeklyHours}
                    onChange={(e) => {
                      const updatedStaff = [...configuration.resources.staff];
                      updatedStaff[index] = { ...staff, maxWeeklyHours: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { staff: updatedStaff });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Break Interval (min)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="480"
                    value={staff.mandatoryBreakInterval}
                    onChange={(e) => {
                      const updatedStaff = [...configuration.resources.staff];
                      updatedStaff[index] = { ...staff, mandatoryBreakInterval: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { staff: updatedStaff });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {staff.specializations.map((spec, specIndex) => (
                    <Badge key={specIndex} variant="secondary" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Equipment Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Equipment Management</h3>
        <div className="space-y-4">
          {configuration.resources.equipment.map((equipment, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{equipment.name}</h4>
                <Badge variant={equipment.isOperational ? 'success' : 'danger'}>
                  {equipment.isOperational ? 'Operational' : 'Maintenance'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maintenance Interval (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={equipment.maintenanceInterval}
                    onChange={(e) => {
                      const updatedEquipment = [...configuration.resources.equipment];
                      updatedEquipment[index] = { ...equipment, maintenanceInterval: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { equipment: updatedEquipment });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Setup Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={equipment.setupTime}
                    onChange={(e) => {
                      const updatedEquipment = [...configuration.resources.equipment];
                      updatedEquipment[index] = { ...equipment, setupTime: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { equipment: updatedEquipment });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Room Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Management</h3>
        <div className="space-y-4">
          {configuration.resources.rooms.map((room, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{room.name}</h4>
                <Badge variant="info">Capacity: {room.capacity}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cleaning Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={room.cleaningTime}
                    onChange={(e) => {
                      const updatedRooms = [...configuration.resources.rooms];
                      updatedRooms[index] = { ...room, cleaningTime: parseInt(e.target.value) };
                      handleConfigurationUpdate('resources', { rooms: updatedRooms });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Booking Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    value={room.bookingRules.minBookingDuration}
                    onChange={(e) => {
                      const updatedRooms = [...configuration.resources.rooms];
                      updatedRooms[index] = {
                        ...room,
                        bookingRules: {
                          ...room.bookingRules,
                          minBookingDuration: parseInt(e.target.value)
                        }
                      };
                      handleConfigurationUpdate('resources', { rooms: updatedRooms });
                    }}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderWellnessTab = () => (
    <div className="space-y-6">
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wellness Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuration.wellness.enableWellnessMonitoring}
              onChange={(e) => handleConfigurationUpdate('wellness', { enableWellnessMonitoring: e.target.checked })}
              disabled={!hasAdminAccess}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Enable Wellness Monitoring
            </label>
          </div>
          
          {configuration.wellness.enableWellnessMonitoring && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excellent (90-100)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="100"
                    value={configuration.wellness.wellnessThresholds.excellent}
                    onChange={(e) => handleConfigurationUpdate('wellness', { 
                      wellnessThresholds: { ...configuration.wellness.wellnessThresholds, excellent: parseInt(e.target.value) }
                    })}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Good (70-89)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="89"
                    value={configuration.wellness.wellnessThresholds.good}
                    onChange={(e) => handleConfigurationUpdate('wellness', { 
                      wellnessThresholds: { ...configuration.wellness.wellnessThresholds, good: parseInt(e.target.value) }
                    })}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Warning (50-69)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="69"
                    value={configuration.wellness.wellnessThresholds.warning}
                    onChange={(e) => handleConfigurationUpdate('wellness', { 
                      wellnessThresholds: { ...configuration.wellness.wellnessThresholds, warning: parseInt(e.target.value) }
                    })}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Critical (0-49)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="49"
                    value={configuration.wellness.wellnessThresholds.critical}
                    onChange={(e) => handleConfigurationUpdate('wellness', { 
                      wellnessThresholds: { ...configuration.wellness.wellnessThresholds, critical: parseInt(e.target.value) }
                    })}
                    disabled={!hasAdminAccess}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configuration.wellness.autoBreakEnforcement}
                  onChange={(e) => handleConfigurationUpdate('wellness', { autoBreakEnforcement: e.target.checked })}
                  disabled={!hasAdminAccess}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Automatic Break Enforcement
                </label>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Email Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuration.notifications.email.enabled}
              onChange={(e) => handleConfigurationUpdate('notifications', {
                email: { ...configuration.notifications.email, enabled: e.target.checked }
              })}
              disabled={!hasAdminAccess}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Enable Email Notifications
            </label>
          </div>

          {configuration.notifications.email.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Server
                </label>
                <input
                  type="text"
                  value={configuration.notifications.email.smtpServer}
                  onChange={(e) => handleConfigurationUpdate('notifications', {
                    email: { ...configuration.notifications.email, smtpServer: e.target.value }
                  })}
                  disabled={!hasAdminAccess}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Address
                </label>
                <input
                  type="email"
                  value={configuration.notifications.email.fromAddress}
                  onChange={(e) => handleConfigurationUpdate('notifications', {
                    email: { ...configuration.notifications.email, fromAddress: e.target.value }
                  })}
                  disabled={!hasAdminAccess}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SMS Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SMS Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuration.notifications.sms.enabled}
              onChange={(e) => handleConfigurationUpdate('notifications', {
                sms: { ...configuration.notifications.sms, enabled: e.target.checked }
              })}
              disabled={!hasAdminAccess}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Enable SMS Notifications
            </label>
          </div>

          {configuration.notifications.sms.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMS Provider
                </label>
                <select
                  value={configuration.notifications.sms.provider}
                  onChange={(e) => handleConfigurationUpdate('notifications', {
                    sms: { ...configuration.notifications.sms, provider: e.target.value }
                  })}
                  disabled={!hasAdminAccess}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws-sns">AWS SNS</option>
                  <option value="nexmo">Nexmo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={configuration.notifications.sms.apiKey}
                  onChange={(e) => handleConfigurationUpdate('notifications', {
                    sms: { ...configuration.notifications.sms, apiKey: e.target.value }
                  })}
                  disabled={!hasAdminAccess}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Alert Types */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(configuration.notifications.alertTypes).map(([alertType, enabled]) => (
            <div key={alertType} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleConfigurationUpdate('notifications', {
                  alertTypes: { ...configuration.notifications.alertTypes, [alertType]: e.target.checked }
                })}
                disabled={!hasAdminAccess}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                {alertType.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Data Retention */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              min="30"
              max="3650"
              value={configuration.analytics.dataRetentionPeriod}
              onChange={(e) => handleConfigurationUpdate('analytics', { dataRetentionPeriod: parseInt(e.target.value) })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dashboard Refresh (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={configuration.analytics.dashboardRefreshInterval}
              onChange={(e) => handleConfigurationUpdate('analytics', { dashboardRefreshInterval: parseInt(e.target.value) })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(configuration.analytics.performanceMetrics).map(([metric, enabled]) => (
            <div key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleConfigurationUpdate('analytics', {
                  performanceMetrics: { ...configuration.analytics.performanceMetrics, [metric]: e.target.checked }
                })}
                disabled={!hasAdminAccess}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Settings */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reporting Frequency
            </label>
            <select
              value={configuration.analytics.reportingFrequency}
              onChange={(e) => handleConfigurationUpdate('analytics', { reportingFrequency: e.target.value as any })}
              disabled={!hasAdminAccess}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Formats
            </label>
            <div className="flex flex-wrap gap-2">
              {['pdf', 'excel', 'csv'].map(format => (
                <div key={format} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={configuration.analytics.exportFormats.includes(format as any)}
                    onChange={(e) => {
                      const formats = e.target.checked
                        ? [...configuration.analytics.exportFormats, format as any]
                        : configuration.analytics.exportFormats.filter(f => f !== format);
                      handleConfigurationUpdate('analytics', { exportFormats: formats });
                    }}
                    disabled={!hasAdminAccess}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    {format.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage clinic settings and resource optimization parameters
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={hasAdminAccess ? 'success' : 'warning'}>
            {hasAdminAccess ? 'Admin Access' : 'Read Only'}
          </Badge>
          <Badge variant="info">
            v{configuration.version}
          </Badge>
        </div>
      </div>

      {/* Access Control Warning */}
      {!hasAdminAccess && (
        <Card variant="elevated" className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You have read-only access to configuration settings. Contact an administrator to make changes.
            </p>
          </div>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card variant="elevated" className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Configuration Errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-300">{error}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Buttons */}
      {hasAdminAccess && (
        <Card variant="elevated" className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || validationErrors.length > 0 || saveStatus === 'saving'}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <SaveIcon className="h-4 w-4" />
              <span>
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
              </span>
            </Button>
            
            <Button
              onClick={handleReset}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <RefreshIcon className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </Button>
            
            <Button
              onClick={handleExport}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Export Config</span>
            </Button>
            
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
              <UploadIcon className="h-4 w-4" />
              <span>Import Config</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'scheduling', label: 'Scheduling', icon: ClockIcon },
          { id: 'resources', label: 'Resources', icon: UsersIcon },
          { id: 'wellness', label: 'Wellness', icon: ActivityIcon },
          { id: 'notifications', label: 'Notifications', icon: BellIcon },
          { id: 'analytics', label: 'Analytics', icon: ActivityIcon },
          { id: 'clinics', label: 'Clinics', icon: UsersIcon },
          { id: 'health', label: 'System Health', icon: ActivityIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && renderGeneralTab()}
      {activeTab === 'scheduling' && renderSchedulingTab()}
      {activeTab === 'resources' && renderResourcesTab()}
      {activeTab === 'wellness' && renderWellnessTab()}
      {activeTab === 'notifications' && renderNotificationsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'clinics' && <ClinicManagement />}
      {activeTab === 'health' && <SystemHealthMonitor />}

      {/* Configuration Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Last Modified:</span>
            <p className="font-medium">{new Date(configuration.lastModified).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Modified By:</span>
            <p className="font-medium">{configuration.modifiedBy}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Version:</span>
            <p className="font-medium">{configuration.version}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <Badge variant={validationErrors.length === 0 ? 'success' : 'danger'}>
              {validationErrors.length === 0 ? 'Valid' : 'Invalid'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;
