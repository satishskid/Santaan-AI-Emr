import { UserRole } from '../types';
import { ComplexityLevel, ProcedureCategory } from './processDurationService';

// Configuration interfaces
export interface ClinicConfiguration {
  general: GeneralSettings;
  scheduling: SchedulingSettings;
  resources: ResourceSettings;
  wellness: WellnessSettings;
  notifications: NotificationSettings;
  analytics: AnalyticsSettings;
  lastModified: Date;
  modifiedBy: string;
  version: string;
}

export interface GeneralSettings {
  clinicName: string;
  timezone: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  workingDays: string[]; // ['Monday', 'Tuesday', ...]
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface SchedulingSettings {
  defaultSlotDuration: number; // minutes
  bufferBetweenAppointments: number; // minutes
  maxAdvanceBooking: number; // days
  allowOverbooking: boolean;
  overbookingPercentage: number; // 0-100
  autoConfirmAppointments: boolean;
  reminderSettings: {
    enabled: boolean;
    daysBefore: number[];
    methods: ('email' | 'sms' | 'phone')[];
  };
  cancellationPolicy: {
    allowCancellation: boolean;
    minimumNotice: number; // hours
    penaltyFee: number;
  };
}

export interface ResourceSettings {
  staff: StaffConfiguration[];
  equipment: EquipmentConfiguration[];
  rooms: RoomConfiguration[];
  procedures: ProcedureConfiguration[];
}

export interface StaffConfiguration {
  role: UserRole;
  maxDailyHours: number;
  maxWeeklyHours: number;
  maxConsecutiveDays: number;
  mandatoryBreakInterval: number; // minutes
  minBreakDuration: number; // minutes
  maxFatigueScore: number;
  maxConsecutiveHighFatigueTasks: number;
  specializations: string[];
  availabilityPattern: WeeklyAvailability;
  costPerHour: number;
}

export interface EquipmentConfiguration {
  id: string;
  name: string;
  type: string;
  maintenanceInterval: number; // days
  maintenanceDuration: number; // hours
  operationalHours: {
    start: string;
    end: string;
  };
  maxConcurrentUse: number;
  setupTime: number; // minutes
  cleanupTime: number; // minutes
  isOperational: boolean;
}

export interface RoomConfiguration {
  id: string;
  name: string;
  type: string;
  capacity: number;
  cleaningTime: number; // minutes
  equipmentIds: string[];
  availabilityHours: {
    start: string;
    end: string;
  };
  bookingRules: {
    minBookingDuration: number;
    maxBookingDuration: number;
    allowBackToBack: boolean;
  };
}

export interface ProcedureConfiguration {
  id: string;
  name: string;
  category: ProcedureCategory;
  baseDuration: number; // minutes
  complexityModifiers: {
    [ComplexityLevel.Simple]: number;
    [ComplexityLevel.Standard]: number;
    [ComplexityLevel.Complex]: number;
  };
  bufferTime: {
    before: number;
    after: number;
  };
  fatigueScore: number; // 1-10
  requiredRole: UserRole;
  requiredEquipment: string[];
  requiredRoom: string;
  canRunConcurrently: boolean;
  maxConcurrentInstances: number;
  cost: number;
  revenueCode: string;
}

export interface WellnessSettings {
  enableWellnessMonitoring: boolean;
  wellnessThresholds: {
    excellent: number; // 90-100
    good: number;      // 70-89
    warning: number;   // 50-69
    critical: number;  // 0-49
  };
  fatigueThresholds: {
    low: number;       // 0-30
    moderate: number;  // 31-60
    high: number;      // 61-80
    critical: number;  // 81-100
  };
  autoBreakEnforcement: boolean;
  wellnessReportFrequency: 'daily' | 'weekly' | 'monthly';
  burnoutPrevention: {
    enabled: boolean;
    earlyWarningDays: number;
    interventionThreshold: number;
  };
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    smtpServer: string;
    fromAddress: string;
  };
  sms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
  };
  inApp: {
    enabled: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
  alertTypes: {
    schedulingConflicts: boolean;
    wellnessAlerts: boolean;
    equipmentMaintenance: boolean;
    appointmentReminders: boolean;
    systemUpdates: boolean;
  };
}

export interface AnalyticsSettings {
  dataRetentionPeriod: number; // days
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  enablePredictiveAnalytics: boolean;
  benchmarkingEnabled: boolean;
  exportFormats: ('pdf' | 'excel' | 'csv')[];
  dashboardRefreshInterval: number; // seconds
  performanceMetrics: {
    trackUtilization: boolean;
    trackEfficiency: boolean;
    trackWellness: boolean;
    trackPatientSatisfaction: boolean;
    trackFinancialMetrics: boolean;
  };
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  available: boolean;
  shifts: TimeSlot[];
  breaks: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
}

// Default configuration
export const DEFAULT_CONFIGURATION: ClinicConfiguration = {
  general: {
    clinicName: 'Advanced Fertility Center',
    timezone: 'America/New_York',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    language: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },
  scheduling: {
    defaultSlotDuration: 30,
    bufferBetweenAppointments: 15,
    maxAdvanceBooking: 90,
    allowOverbooking: false,
    overbookingPercentage: 10,
    autoConfirmAppointments: true,
    reminderSettings: {
      enabled: true,
      daysBefore: [7, 3, 1],
      methods: ['email', 'sms']
    },
    cancellationPolicy: {
      allowCancellation: true,
      minimumNotice: 24,
      penaltyFee: 50
    }
  },
  resources: {
    staff: [
      {
        role: UserRole.Doctor,
        maxDailyHours: 10,
        maxWeeklyHours: 50,
        maxConsecutiveDays: 6,
        mandatoryBreakInterval: 120,
        minBreakDuration: 15,
        maxFatigueScore: 60,
        maxConsecutiveHighFatigueTasks: 3,
        specializations: ['IVF', 'Reproductive Surgery'],
        availabilityPattern: {
          monday: { available: true, shifts: [{ start: '08:00', end: '18:00' }], breaks: [{ start: '12:00', end: '13:00' }] },
          tuesday: { available: true, shifts: [{ start: '08:00', end: '18:00' }], breaks: [{ start: '12:00', end: '13:00' }] },
          wednesday: { available: true, shifts: [{ start: '08:00', end: '18:00' }], breaks: [{ start: '12:00', end: '13:00' }] },
          thursday: { available: true, shifts: [{ start: '08:00', end: '18:00' }], breaks: [{ start: '12:00', end: '13:00' }] },
          friday: { available: true, shifts: [{ start: '08:00', end: '18:00' }], breaks: [{ start: '12:00', end: '13:00' }] },
          saturday: { available: true, shifts: [{ start: '08:00', end: '14:00' }], breaks: [] },
          sunday: { available: false, shifts: [], breaks: [] }
        },
        costPerHour: 150
      },
      {
        role: UserRole.Nurse,
        maxDailyHours: 8,
        maxWeeklyHours: 40,
        maxConsecutiveDays: 5,
        mandatoryBreakInterval: 180,
        minBreakDuration: 15,
        maxFatigueScore: 50,
        maxConsecutiveHighFatigueTasks: 4,
        specializations: ['Patient Care', 'Monitoring'],
        availabilityPattern: {
          monday: { available: true, shifts: [{ start: '07:00', end: '15:00' }], breaks: [{ start: '11:00', end: '11:30' }] },
          tuesday: { available: true, shifts: [{ start: '07:00', end: '15:00' }], breaks: [{ start: '11:00', end: '11:30' }] },
          wednesday: { available: true, shifts: [{ start: '07:00', end: '15:00' }], breaks: [{ start: '11:00', end: '11:30' }] },
          thursday: { available: true, shifts: [{ start: '07:00', end: '15:00' }], breaks: [{ start: '11:00', end: '11:30' }] },
          friday: { available: true, shifts: [{ start: '07:00', end: '15:00' }], breaks: [{ start: '11:00', end: '11:30' }] },
          saturday: { available: false, shifts: [], breaks: [] },
          sunday: { available: false, shifts: [], breaks: [] }
        },
        costPerHour: 45
      }
    ],
    equipment: [
      {
        id: 'ultrasound-1',
        name: 'Ultrasound Machine 1',
        type: 'Ultrasound',
        maintenanceInterval: 30,
        maintenanceDuration: 4,
        operationalHours: { start: '08:00', end: '18:00' },
        maxConcurrentUse: 1,
        setupTime: 5,
        cleanupTime: 10,
        isOperational: true
      }
    ],
    rooms: [
      {
        id: 'ultrasound-room-1',
        name: 'Ultrasound Room 1',
        type: 'Ultrasound Room',
        capacity: 1,
        cleaningTime: 15,
        equipmentIds: ['ultrasound-1'],
        availabilityHours: { start: '08:00', end: '18:00' },
        bookingRules: {
          minBookingDuration: 15,
          maxBookingDuration: 120,
          allowBackToBack: true
        }
      }
    ],
    procedures: []
  },
  wellness: {
    enableWellnessMonitoring: true,
    wellnessThresholds: {
      excellent: 90,
      good: 70,
      warning: 50,
      critical: 30
    },
    fatigueThresholds: {
      low: 30,
      moderate: 60,
      high: 80,
      critical: 100
    },
    autoBreakEnforcement: true,
    wellnessReportFrequency: 'daily',
    burnoutPrevention: {
      enabled: true,
      earlyWarningDays: 3,
      interventionThreshold: 60
    }
  },
  notifications: {
    email: {
      enabled: true,
      smtpServer: 'smtp.clinic.com',
      fromAddress: 'noreply@clinic.com'
    },
    sms: {
      enabled: true,
      provider: 'twilio',
      apiKey: 'your-api-key'
    },
    inApp: {
      enabled: true,
      soundEnabled: true,
      desktopNotifications: true
    },
    alertTypes: {
      schedulingConflicts: true,
      wellnessAlerts: true,
      equipmentMaintenance: true,
      appointmentReminders: true,
      systemUpdates: true
    }
  },
  analytics: {
    dataRetentionPeriod: 365,
    reportingFrequency: 'weekly',
    enablePredictiveAnalytics: true,
    benchmarkingEnabled: true,
    exportFormats: ['pdf', 'excel'],
    dashboardRefreshInterval: 30,
    performanceMetrics: {
      trackUtilization: true,
      trackEfficiency: true,
      trackWellness: true,
      trackPatientSatisfaction: true,
      trackFinancialMetrics: true
    }
  },
  lastModified: new Date(),
  modifiedBy: 'system',
  version: '1.0.0'
};

export class ConfigurationService {
  private static configuration: ClinicConfiguration = DEFAULT_CONFIGURATION;

  // Get current configuration
  static getConfiguration(): ClinicConfiguration {
    return { ...this.configuration };
  }

  // Update configuration
  static updateConfiguration(updates: Partial<ClinicConfiguration>, modifiedBy: string): void {
    this.configuration = {
      ...this.configuration,
      ...updates,
      lastModified: new Date(),
      modifiedBy,
      version: this.incrementVersion(this.configuration.version)
    };
  }

  // Get specific configuration section
  static getGeneralSettings(): GeneralSettings {
    return { ...this.configuration.general };
  }

  static getSchedulingSettings(): SchedulingSettings {
    return { ...this.configuration.scheduling };
  }

  static getResourceSettings(): ResourceSettings {
    return { ...this.configuration.resources };
  }

  static getWellnessSettings(): WellnessSettings {
    return { ...this.configuration.wellness };
  }

  // Update specific sections
  static updateGeneralSettings(settings: Partial<GeneralSettings>, modifiedBy: string): void {
    this.updateConfiguration({
      general: { ...this.configuration.general, ...settings }
    }, modifiedBy);
  }

  static updateSchedulingSettings(settings: Partial<SchedulingSettings>, modifiedBy: string): void {
    this.updateConfiguration({
      scheduling: { ...this.configuration.scheduling, ...settings }
    }, modifiedBy);
  }

  static updateResourceSettings(settings: Partial<ResourceSettings>, modifiedBy: string): void {
    this.updateConfiguration({
      resources: { ...this.configuration.resources, ...settings }
    }, modifiedBy);
  }

  static updateWellnessSettings(settings: Partial<WellnessSettings>, modifiedBy: string): void {
    this.updateConfiguration({
      wellness: { ...this.configuration.wellness, ...settings }
    }, modifiedBy);
  }

  // Validation methods
  static validateConfiguration(config: ClinicConfiguration): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate working hours
    if (config.general.workingHours.start >= config.general.workingHours.end) {
      errors.push('Working hours: Start time must be before end time');
    }

    // Validate staff configuration
    config.resources.staff.forEach((staff, index) => {
      if (staff.maxDailyHours <= 0 || staff.maxDailyHours > 24) {
        errors.push(`Staff ${index + 1}: Daily hours must be between 1 and 24`);
      }
      if (staff.maxWeeklyHours <= 0 || staff.maxWeeklyHours > 168) {
        errors.push(`Staff ${index + 1}: Weekly hours must be between 1 and 168`);
      }
    });

    // Validate wellness thresholds
    const wellness = config.wellness.wellnessThresholds;
    if (wellness.excellent <= wellness.good || wellness.good <= wellness.warning || wellness.warning <= wellness.critical) {
      errors.push('Wellness thresholds must be in descending order (excellent > good > warning > critical)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export configuration
  static exportConfiguration(): string {
    return JSON.stringify(this.configuration, null, 2);
  }

  // Import configuration
  static importConfiguration(configJson: string, modifiedBy: string): { success: boolean; errors: string[] } {
    try {
      const importedConfig = JSON.parse(configJson) as ClinicConfiguration;
      const validation = this.validateConfiguration(importedConfig);
      
      if (validation.isValid) {
        this.configuration = {
          ...importedConfig,
          lastModified: new Date(),
          modifiedBy,
          version: this.incrementVersion(this.configuration.version)
        };
        return { success: true, errors: [] };
      } else {
        return { success: false, errors: validation.errors };
      }
    } catch (error) {
      return { success: false, errors: ['Invalid JSON format'] };
    }
  }

  // Reset to defaults
  static resetToDefaults(modifiedBy: string): void {
    this.configuration = {
      ...DEFAULT_CONFIGURATION,
      lastModified: new Date(),
      modifiedBy,
      version: this.incrementVersion(this.configuration.version)
    };
  }

  // Get configuration summary for display
  static getConfigurationSummary(): {
    totalStaff: number;
    totalEquipment: number;
    totalRooms: number;
    totalProcedures: number;
    wellnessEnabled: boolean;
    lastModified: string;
    version: string;
  } {
    return {
      totalStaff: this.configuration.resources.staff.length,
      totalEquipment: this.configuration.resources.equipment.length,
      totalRooms: this.configuration.resources.rooms.length,
      totalProcedures: this.configuration.resources.procedures.length,
      wellnessEnabled: this.configuration.wellness.enableWellnessMonitoring,
      lastModified: this.configuration.lastModified.toISOString(),
      version: this.configuration.version
    };
  }

  // Helper methods
  private static incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}
