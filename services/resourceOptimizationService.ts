import { UserRole, Patient, TaskWithPatientInfo } from '../types';
import { ProcessDurationService, ComplexityLevel, PROCEDURE_DEFINITIONS } from './processDurationService';

// Resource types
export interface StaffResource {
  id: string;
  name: string;
  role: UserRole;
  specializations: string[];
  availability: TimeSlot[];
  maxDailyHours: number;
  maxWeeklyHours: number;
  currentDailyHours: number;
  currentWeeklyHours: number;
  fatigueLevel: number; // 0-100
  lastBreakTime?: Date;
  mandatoryBreakInterval: number; // minutes
}

export interface EquipmentResource {
  id: string;
  name: string;
  type: string;
  room: string;
  availability: TimeSlot[];
  maintenanceSchedule: TimeSlot[];
  isOperational: boolean;
}

export interface RoomResource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
  availability: TimeSlot[];
  cleaningTime: number; // minutes between procedures
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  reservedBy?: string;
  bufferTime?: number;
}

export interface SchedulingConflict {
  type: 'staff' | 'equipment' | 'room' | 'workload' | 'fatigue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedResources: string[];
  suggestedAlternatives: AlternativeSlot[];
}

export interface AlternativeSlot {
  start: Date;
  end: Date;
  confidence: number; // 0-100
  reason: string;
  resourceChanges?: {
    staff?: string[];
    equipment?: string[];
    room?: string;
  };
}

export interface OptimizationResult {
  isOptimal: boolean;
  conflicts: SchedulingConflict[];
  alternatives: AlternativeSlot[];
  utilizationScore: number; // 0-100
  workloadBalance: number; // 0-100
  recommendations: string[];
}

// Sample resource data
export const STAFF_RESOURCES: StaffResource[] = [
  {
    id: 'dr-smith',
    name: 'Dr. Sarah Smith',
    role: UserRole.Doctor,
    specializations: ['IVF', 'Reproductive Surgery'],
    availability: [],
    maxDailyHours: 10,
    maxWeeklyHours: 50,
    currentDailyHours: 0,
    currentWeeklyHours: 0,
    fatigueLevel: 20,
    mandatoryBreakInterval: 120
  },
  {
    id: 'dr-johnson',
    name: 'Dr. Michael Johnson',
    role: UserRole.Doctor,
    specializations: ['IVF', 'Endocrinology'],
    availability: [],
    maxDailyHours: 8,
    maxWeeklyHours: 40,
    currentDailyHours: 0,
    currentWeeklyHours: 0,
    fatigueLevel: 15,
    mandatoryBreakInterval: 120
  },
  {
    id: 'nurse-williams',
    name: 'Nurse Jennifer Williams',
    role: UserRole.Nurse,
    specializations: ['Patient Care', 'Monitoring'],
    availability: [],
    maxDailyHours: 8,
    maxWeeklyHours: 40,
    currentDailyHours: 0,
    currentWeeklyHours: 0,
    fatigueLevel: 10,
    mandatoryBreakInterval: 180
  },
  {
    id: 'embryologist-chen',
    name: 'Dr. Lisa Chen',
    role: UserRole.Embryologist,
    specializations: ['Embryo Culture', 'ICSI', 'PGT'],
    availability: [],
    maxDailyHours: 9,
    maxWeeklyHours: 45,
    currentDailyHours: 0,
    currentWeeklyHours: 0,
    fatigueLevel: 25,
    mandatoryBreakInterval: 150
  }
];

export const EQUIPMENT_RESOURCES: EquipmentResource[] = [
  {
    id: 'ultrasound-1',
    name: 'Ultrasound Machine 1',
    type: 'Ultrasound Machine',
    room: 'Ultrasound Room 1',
    availability: [],
    maintenanceSchedule: [],
    isOperational: true
  },
  {
    id: 'ultrasound-2',
    name: 'Ultrasound Machine 2',
    type: 'Ultrasound Machine',
    room: 'Ultrasound Room 2',
    availability: [],
    maintenanceSchedule: [],
    isOperational: true
  },
  {
    id: 'microscope-1',
    name: 'Laboratory Microscope 1',
    type: 'Microscope',
    room: 'Laboratory',
    availability: [],
    maintenanceSchedule: [],
    isOperational: true
  }
];

export const ROOM_RESOURCES: RoomResource[] = [
  {
    id: 'ultrasound-room-1',
    name: 'Ultrasound Room 1',
    type: 'Ultrasound Room',
    capacity: 1,
    equipment: ['ultrasound-1'],
    availability: [],
    cleaningTime: 15
  },
  {
    id: 'operating-theater',
    name: 'Operating Theater',
    type: 'Operating Theater',
    capacity: 1,
    equipment: ['ultrasound-2', 'anesthesia-1'],
    availability: [],
    cleaningTime: 30
  },
  {
    id: 'laboratory',
    name: 'IVF Laboratory',
    type: 'Laboratory',
    capacity: 3,
    equipment: ['microscope-1', 'incubator-1', 'micromanipulator-1'],
    availability: [],
    cleaningTime: 10
  }
];

export class ResourceOptimizationService {
  
  // Main optimization function
  static optimizeSchedule(
    tasks: TaskWithPatientInfo[],
    targetDate: Date,
    patients: Patient[]
  ): OptimizationResult {
    const conflicts: SchedulingConflict[] = [];
    const alternatives: AlternativeSlot[] = [];
    const recommendations: string[] = [];

    // Analyze current schedule
    const utilizationScore = this.calculateUtilizationScore(tasks);
    const workloadBalance = this.calculateWorkloadBalance(tasks);

    // Check for conflicts
    conflicts.push(...this.detectStaffConflicts(tasks));
    conflicts.push(...this.detectResourceConflicts(tasks));
    conflicts.push(...this.detectWorkloadConflicts(tasks));

    // Generate alternatives for conflicts
    conflicts.forEach(conflict => {
      alternatives.push(...this.generateAlternatives(conflict, tasks, targetDate));
    });

    // Generate optimization recommendations
    recommendations.push(...this.generateRecommendations(tasks, utilizationScore, workloadBalance));

    return {
      isOptimal: conflicts.filter(c => c.severity === 'high' || c.severity === 'critical').length === 0,
      conflicts,
      alternatives,
      utilizationScore,
      workloadBalance,
      recommendations
    };
  }

  // Detect staff scheduling conflicts
  private static detectStaffConflicts(tasks: TaskWithPatientInfo[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    const staffSchedule = new Map<string, TimeSlot[]>();

    tasks.forEach(task => {
      const procedure = PROCEDURE_DEFINITIONS[task.title];
      if (!procedure) return;

      const staffId = this.getAssignedStaffId(task.assignedTo);
      if (!staffSchedule.has(staffId)) {
        staffSchedule.set(staffId, []);
      }

      const taskStart = new Date(task.dueDate);
      const taskEnd = new Date(taskStart.getTime() + task.durationMinutes * 60000);
      const existingSlots = staffSchedule.get(staffId)!;

      // Check for overlaps
      const hasOverlap = existingSlots.some(slot => 
        (taskStart >= slot.start && taskStart < slot.end) ||
        (taskEnd > slot.start && taskEnd <= slot.end) ||
        (taskStart <= slot.start && taskEnd >= slot.end)
      );

      if (hasOverlap) {
        conflicts.push({
          type: 'staff',
          severity: 'high',
          message: `Staff member ${task.assignedTo} has overlapping appointments`,
          affectedResources: [staffId],
          suggestedAlternatives: []
        });
      }

      existingSlots.push({ start: taskStart, end: taskEnd, isAvailable: false });
    });

    return conflicts;
  }

  // Detect equipment and room conflicts
  private static detectResourceConflicts(tasks: TaskWithPatientInfo[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    const equipmentSchedule = new Map<string, TimeSlot[]>();
    const roomSchedule = new Map<string, TimeSlot[]>();

    tasks.forEach(task => {
      const procedure = PROCEDURE_DEFINITIONS[task.title];
      if (!procedure) return;

      const taskStart = new Date(task.dueDate);
      const taskEnd = new Date(taskStart.getTime() + task.durationMinutes * 60000);

      // Check equipment conflicts
      if (procedure.requiredEquipment) {
        procedure.requiredEquipment.forEach(equipmentType => {
          const equipment = EQUIPMENT_RESOURCES.find(e => e.type === equipmentType);
          if (equipment) {
            if (!equipmentSchedule.has(equipment.id)) {
              equipmentSchedule.set(equipment.id, []);
            }

            const existingSlots = equipmentSchedule.get(equipment.id)!;
            const hasOverlap = existingSlots.some(slot => 
              (taskStart >= slot.start && taskStart < slot.end) ||
              (taskEnd > slot.start && taskEnd <= slot.end)
            );

            if (hasOverlap) {
              conflicts.push({
                type: 'equipment',
                severity: 'medium',
                message: `Equipment ${equipment.name} is double-booked`,
                affectedResources: [equipment.id],
                suggestedAlternatives: []
              });
            }

            existingSlots.push({ start: taskStart, end: taskEnd, isAvailable: false });
          }
        });
      }

      // Check room conflicts
      if (procedure.requiredRoom) {
        const room = ROOM_RESOURCES.find(r => r.type === procedure.requiredRoom);
        if (room) {
          if (!roomSchedule.has(room.id)) {
            roomSchedule.set(room.id, []);
          }

          const existingSlots = roomSchedule.get(room.id)!;
          const hasOverlap = existingSlots.some(slot => 
            (taskStart >= slot.start && taskStart < slot.end) ||
            (taskEnd > slot.start && taskEnd <= slot.end)
          );

          if (hasOverlap) {
            conflicts.push({
              type: 'room',
              severity: 'high',
              message: `Room ${room.name} is double-booked`,
              affectedResources: [room.id],
              suggestedAlternatives: []
            });
          }

          existingSlots.push({ start: taskStart, end: taskEnd, isAvailable: false });
        }
      }
    });

    return conflicts;
  }

  // Detect workload and fatigue conflicts
  private static detectWorkloadConflicts(tasks: TaskWithPatientInfo[]): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];
    const staffWorkload = new Map<string, { hours: number; fatigueScore: number; lastBreak?: Date }>();

    tasks.forEach(task => {
      const procedure = PROCEDURE_DEFINITIONS[task.title];
      if (!procedure) return;

      const staffId = this.getAssignedStaffId(task.assignedTo);
      const staff = STAFF_RESOURCES.find(s => s.id === staffId);
      if (!staff) return;

      if (!staffWorkload.has(staffId)) {
        staffWorkload.set(staffId, { hours: 0, fatigueScore: 0 });
      }

      const workload = staffWorkload.get(staffId)!;
      workload.hours += task.durationMinutes / 60;
      workload.fatigueScore += procedure.fatigueScore;

      // Check daily hour limits
      if (workload.hours > staff.maxDailyHours) {
        conflicts.push({
          type: 'workload',
          severity: 'critical',
          message: `${staff.name} exceeds daily hour limit (${workload.hours.toFixed(1)}/${staff.maxDailyHours})`,
          affectedResources: [staffId],
          suggestedAlternatives: []
        });
      }

      // Check fatigue levels
      if (workload.fatigueScore > 50) {
        conflicts.push({
          type: 'fatigue',
          severity: 'medium',
          message: `${staff.name} has high fatigue score (${workload.fatigueScore})`,
          affectedResources: [staffId],
          suggestedAlternatives: []
        });
      }
    });

    return conflicts;
  }

  // Generate alternative time slots
  private static generateAlternatives(
    conflict: SchedulingConflict,
    tasks: TaskWithPatientInfo[],
    targetDate: Date
  ): AlternativeSlot[] {
    const alternatives: AlternativeSlot[] = [];

    // Generate time slots throughout the day
    const dayStart = new Date(targetDate);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(18, 0, 0, 0);

    for (let time = new Date(dayStart); time < dayEnd; time.setMinutes(time.getMinutes() + 30)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time.getTime() + 60 * 60000); // 1 hour slot

      // Check if this slot is available
      const hasConflict = tasks.some(task => {
        const taskStart = new Date(task.dueDate);
        const taskEnd = new Date(taskStart.getTime() + task.durationMinutes * 60000);
        return (slotStart >= taskStart && slotStart < taskEnd) ||
               (slotEnd > taskStart && slotEnd <= taskEnd);
      });

      if (!hasConflict) {
        alternatives.push({
          start: slotStart,
          end: slotEnd,
          confidence: 85,
          reason: 'Available time slot with no conflicts'
        });
      }
    }

    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  // Calculate resource utilization score
  private static calculateUtilizationScore(tasks: TaskWithPatientInfo[]): number {
    const totalAvailableHours = 10 * STAFF_RESOURCES.length; // 10 hours per staff member
    const totalScheduledHours = tasks.reduce((sum, task) => sum + task.durationMinutes / 60, 0);
    const utilizationPercentage = (totalScheduledHours / totalAvailableHours) * 100;
    return Math.min(Math.ceil(utilizationPercentage), 100); // Round up to remove decimals
  }

  // Calculate workload balance score
  private static calculateWorkloadBalance(tasks: TaskWithPatientInfo[]): number {
    const staffWorkloads = new Map<string, number>();
    
    tasks.forEach(task => {
      const staffId = this.getAssignedStaffId(task.assignedTo);
      staffWorkloads.set(staffId, (staffWorkloads.get(staffId) || 0) + task.durationMinutes);
    });

    const workloads = Array.from(staffWorkloads.values());
    if (workloads.length === 0) return 100;

    const average = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / workloads.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = better balance
    const balanceScore = 100 - (standardDeviation / average) * 100;
    return Math.max(0, Math.round(balanceScore)); // Round to remove decimals
  }

  // Generate optimization recommendations
  private static generateRecommendations(
    tasks: TaskWithPatientInfo[],
    utilizationScore: number,
    workloadBalance: number
  ): string[] {
    const recommendations: string[] = [];

    if (utilizationScore > 90) {
      recommendations.push('Consider adding additional staff or extending clinic hours');
    } else if (utilizationScore < 60) {
      recommendations.push('Opportunity to schedule more procedures or reduce staff hours');
    }

    if (workloadBalance < 70) {
      recommendations.push('Redistribute tasks to balance workload across staff members');
    }

    if (tasks.some(task => PROCEDURE_DEFINITIONS[task.title]?.fatigueScore > 7)) {
      recommendations.push('Schedule mandatory breaks after high-fatigue procedures');
    }

    return recommendations;
  }

  // Helper function to get staff ID from role
  private static getAssignedStaffId(role: UserRole): string {
    const staff = STAFF_RESOURCES.find(s => s.role === role);
    return staff?.id || 'unknown';
  }

  // Auto-suggest optimal appointment time
  static suggestOptimalTime(
    procedureId: string,
    complexity: ComplexityLevel,
    targetDate: Date,
    existingTasks: TaskWithPatientInfo[]
  ): AlternativeSlot[] {
    const procedure = PROCEDURE_DEFINITIONS[procedureId];
    if (!procedure) return [];

    const duration = ProcessDurationService.calculateTotalDuration(procedureId, complexity);
    const suggestions: AlternativeSlot[] = [];

    // Find available slots
    const dayStart = new Date(targetDate);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(18, 0, 0, 0);

    for (let time = new Date(dayStart); time < dayEnd; time.setMinutes(time.getMinutes() + 15)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time.getTime() + duration * 60000);

      if (slotEnd > dayEnd) break;

      // Check availability
      const hasConflict = existingTasks.some(task => {
        const taskStart = new Date(task.dueDate);
        const taskEnd = new Date(taskStart.getTime() + task.durationMinutes * 60000);
        return (slotStart >= taskStart && slotStart < taskEnd) ||
               (slotEnd > taskStart && slotEnd <= taskEnd) ||
               (slotStart <= taskStart && slotEnd >= taskEnd);
      });

      if (!hasConflict) {
        suggestions.push({
          start: slotStart,
          end: slotEnd,
          confidence: 90,
          reason: 'Optimal time slot with no conflicts'
        });

        if (suggestions.length >= 5) break;
      }
    }

    return suggestions;
  }
}
