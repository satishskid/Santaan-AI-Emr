import { UserRole, TaskWithPatientInfo } from '../types';
import { PROCEDURE_DEFINITIONS } from './processDurationService';
import { STAFF_RESOURCES, StaffResource } from './resourceOptimizationService';

// Wellness tracking interfaces
export interface WellnessMetrics {
  staffId: string;
  date: Date;
  totalHours: number;
  fatigueScore: number;
  breaksTaken: number;
  mandatoryBreaksRequired: number;
  stressLevel: number; // 1-10
  wellnessScore: number; // 0-100
  alerts: WellnessAlert[];
}

export interface WellnessAlert {
  type: 'workload' | 'fatigue' | 'break' | 'stress' | 'wellness';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
  timestamp: Date;
}

export interface WorkloadLimit {
  role: UserRole;
  maxDailyHours: number;
  maxWeeklyHours: number;
  maxConsecutiveDays: number;
  mandatoryBreakInterval: number; // minutes
  minBreakDuration: number; // minutes
  maxFatigueScore: number;
  maxConsecutiveHighFatigueTasks: number;
}

export interface BreakRequirement {
  staffId: string;
  requiredAt: Date;
  duration: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'mandatory';
}

// Workload limits by role
export const WORKLOAD_LIMITS: Record<UserRole, WorkloadLimit> = {
  [UserRole.Doctor]: {
    role: UserRole.Doctor,
    maxDailyHours: 10,
    maxWeeklyHours: 50,
    maxConsecutiveDays: 6,
    mandatoryBreakInterval: 120, // 2 hours
    minBreakDuration: 15,
    maxFatigueScore: 60,
    maxConsecutiveHighFatigueTasks: 3
  },
  [UserRole.Nurse]: {
    role: UserRole.Nurse,
    maxDailyHours: 8,
    maxWeeklyHours: 40,
    maxConsecutiveDays: 5,
    mandatoryBreakInterval: 180, // 3 hours
    minBreakDuration: 15,
    maxFatigueScore: 50,
    maxConsecutiveHighFatigueTasks: 4
  },
  [UserRole.Embryologist]: {
    role: UserRole.Embryologist,
    maxDailyHours: 9,
    maxWeeklyHours: 45,
    maxConsecutiveDays: 5,
    mandatoryBreakInterval: 150, // 2.5 hours
    minBreakDuration: 20,
    maxFatigueScore: 55,
    maxConsecutiveHighFatigueTasks: 2
  },
  [UserRole.ClinicHead]: {
    role: UserRole.ClinicHead,
    maxDailyHours: 10,
    maxWeeklyHours: 50,
    maxConsecutiveDays: 6,
    mandatoryBreakInterval: 120,
    minBreakDuration: 15,
    maxFatigueScore: 65,
    maxConsecutiveHighFatigueTasks: 4
  },
  [UserRole.Executive]: {
    role: UserRole.Executive,
    maxDailyHours: 8,
    maxWeeklyHours: 40,
    maxConsecutiveDays: 5,
    mandatoryBreakInterval: 180,
    minBreakDuration: 15,
    maxFatigueScore: 40,
    maxConsecutiveHighFatigueTasks: 2
  }
};

export class StaffWellnessService {
  
  // Calculate wellness metrics for a staff member
  static calculateWellnessMetrics(
    staffId: string,
    tasks: TaskWithPatientInfo[],
    date: Date
  ): WellnessMetrics {
    const staff = STAFF_RESOURCES.find(s => s.id === staffId);
    if (!staff) {
      throw new Error(`Staff member not found: ${staffId}`);
    }

    const limits = WORKLOAD_LIMITS[staff.role];
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString() && 
             this.getStaffIdFromRole(task.assignedTo) === staffId;
    });

    // Calculate metrics
    const totalHours = dayTasks.reduce((sum, task) => sum + task.durationMinutes / 60, 0);
    const fatigueScore = this.calculateFatigueScore(dayTasks);
    const breaksTaken = this.calculateBreaksTaken(dayTasks);
    const mandatoryBreaksRequired = this.calculateRequiredBreaks(dayTasks, limits);
    const stressLevel = this.calculateStressLevel(totalHours, fatigueScore, limits);
    const wellnessScore = this.calculateWellnessScore(totalHours, fatigueScore, breaksTaken, mandatoryBreaksRequired, limits);
    const alerts = this.generateWellnessAlerts(staffId, totalHours, fatigueScore, breaksTaken, mandatoryBreaksRequired, limits);

    return {
      staffId,
      date,
      totalHours,
      fatigueScore,
      breaksTaken,
      mandatoryBreaksRequired,
      stressLevel,
      wellnessScore,
      alerts
    };
  }

  // Calculate fatigue score based on procedures
  private static calculateFatigueScore(tasks: TaskWithPatientInfo[]): number {
    return tasks.reduce((total, task) => {
      const procedure = PROCEDURE_DEFINITIONS[task.title];
      return total + (procedure?.fatigueScore || 0);
    }, 0);
  }

  // Calculate breaks taken (simplified - would integrate with actual break tracking)
  private static calculateBreaksTaken(tasks: TaskWithPatientInfo[]): number {
    // Simplified calculation - in real implementation, would track actual breaks
    const totalDuration = tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
    return Math.floor(totalDuration / 180); // Assume break every 3 hours
  }

  // Calculate required breaks based on workload
  private static calculateRequiredBreaks(tasks: TaskWithPatientInfo[], limits: WorkloadLimit): number {
    const totalDuration = tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
    return Math.ceil(totalDuration / limits.mandatoryBreakInterval);
  }

  // Calculate stress level
  private static calculateStressLevel(
    totalHours: number,
    fatigueScore: number,
    limits: WorkloadLimit
  ): number {
    const hourStress = (totalHours / limits.maxDailyHours) * 5;
    const fatigueStress = (fatigueScore / limits.maxFatigueScore) * 5;
    return Math.min(Math.round(hourStress + fatigueStress), 10);
  }

  // Calculate overall wellness score
  private static calculateWellnessScore(
    totalHours: number,
    fatigueScore: number,
    breaksTaken: number,
    mandatoryBreaksRequired: number,
    limits: WorkloadLimit
  ): number {
    let score = 100;

    // Deduct for excessive hours
    if (totalHours > limits.maxDailyHours) {
      score -= (totalHours - limits.maxDailyHours) * 10;
    }

    // Deduct for high fatigue
    if (fatigueScore > limits.maxFatigueScore) {
      score -= (fatigueScore - limits.maxFatigueScore) * 2;
    }

    // Deduct for insufficient breaks
    const breakDeficit = mandatoryBreaksRequired - breaksTaken;
    if (breakDeficit > 0) {
      score -= breakDeficit * 15;
    }

    return Math.max(0, Math.round(score));
  }

  // Generate wellness alerts
  private static generateWellnessAlerts(
    staffId: string,
    totalHours: number,
    fatigueScore: number,
    breaksTaken: number,
    mandatoryBreaksRequired: number,
    limits: WorkloadLimit
  ): WellnessAlert[] {
    const alerts: WellnessAlert[] = [];
    const now = new Date();

    // Workload alerts
    if (totalHours > limits.maxDailyHours) {
      alerts.push({
        type: 'workload',
        severity: 'critical',
        message: `Daily hour limit exceeded: ${totalHours.toFixed(1)}/${limits.maxDailyHours} hours`,
        recommendation: 'Redistribute tasks or extend shift end time',
        timestamp: now
      });
    } else if (totalHours > limits.maxDailyHours * 0.9) {
      alerts.push({
        type: 'workload',
        severity: 'warning',
        message: `Approaching daily hour limit: ${totalHours.toFixed(1)}/${limits.maxDailyHours} hours`,
        recommendation: 'Monitor remaining tasks and plan accordingly',
        timestamp: now
      });
    }

    // Fatigue alerts
    if (fatigueScore > limits.maxFatigueScore) {
      alerts.push({
        type: 'fatigue',
        severity: 'critical',
        message: `High fatigue score: ${fatigueScore}/${limits.maxFatigueScore}`,
        recommendation: 'Schedule immediate break and consider task redistribution',
        timestamp: now
      });
    } else if (fatigueScore > limits.maxFatigueScore * 0.8) {
      alerts.push({
        type: 'fatigue',
        severity: 'warning',
        message: `Elevated fatigue score: ${fatigueScore}/${limits.maxFatigueScore}`,
        recommendation: 'Plan break after current procedure',
        timestamp: now
      });
    }

    // Break alerts
    const breakDeficit = mandatoryBreaksRequired - breaksTaken;
    if (breakDeficit > 0) {
      alerts.push({
        type: 'break',
        severity: breakDeficit > 1 ? 'critical' : 'warning',
        message: `Missing ${breakDeficit} mandatory break(s)`,
        recommendation: 'Schedule break immediately',
        timestamp: now
      });
    }

    return alerts;
  }

  // Get break requirements for staff
  static getBreakRequirements(
    staffId: string,
    tasks: TaskWithPatientInfo[],
    currentTime: Date
  ): BreakRequirement[] {
    const staff = STAFF_RESOURCES.find(s => s.id === staffId);
    if (!staff) return [];

    const limits = WORKLOAD_LIMITS[staff.role];
    const requirements: BreakRequirement[] = [];

    // Find last break time (simplified)
    const lastBreakTime = staff.lastBreakTime || new Date(currentTime.getTime() - limits.mandatoryBreakInterval * 60000);
    const timeSinceBreak = (currentTime.getTime() - lastBreakTime.getTime()) / (1000 * 60);

    if (timeSinceBreak >= limits.mandatoryBreakInterval) {
      requirements.push({
        staffId,
        requiredAt: currentTime,
        duration: limits.minBreakDuration,
        reason: 'Mandatory break interval exceeded',
        priority: 'mandatory'
      });
    } else if (timeSinceBreak >= limits.mandatoryBreakInterval * 0.8) {
      const nextBreakTime = new Date(lastBreakTime.getTime() + limits.mandatoryBreakInterval * 60000);
      requirements.push({
        staffId,
        requiredAt: nextBreakTime,
        duration: limits.minBreakDuration,
        reason: 'Upcoming mandatory break',
        priority: 'high'
      });
    }

    return requirements;
  }

  // Check if staff can take on additional task
  static canAcceptTask(
    staffId: string,
    taskTitle: string,
    currentTasks: TaskWithPatientInfo[],
    proposedTime: Date
  ): { canAccept: boolean; reason?: string; alternatives?: Date[] } {
    const staff = STAFF_RESOURCES.find(s => s.id === staffId);
    if (!staff) {
      return { canAccept: false, reason: 'Staff member not found' };
    }

    const limits = WORKLOAD_LIMITS[staff.role];
    const procedure = PROCEDURE_DEFINITIONS[taskTitle];
    if (!procedure) {
      return { canAccept: false, reason: 'Procedure not found' };
    }

    // Check daily hour limits
    const dayTasks = currentTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === proposedTime.toDateString();
    });

    const currentDailyHours = dayTasks.reduce((sum, task) => sum + task.durationMinutes / 60, 0);
    const newTaskHours = procedure.baseDuration / 60;

    if (currentDailyHours + newTaskHours > limits.maxDailyHours) {
      return {
        canAccept: false,
        reason: `Would exceed daily hour limit (${(currentDailyHours + newTaskHours).toFixed(1)}/${limits.maxDailyHours})`,
        alternatives: this.suggestAlternativeTimes(proposedTime)
      };
    }

    // Check fatigue limits
    const currentFatigue = this.calculateFatigueScore(dayTasks);
    if (currentFatigue + procedure.fatigueScore > limits.maxFatigueScore) {
      return {
        canAccept: false,
        reason: `Would exceed fatigue limit (${currentFatigue + procedure.fatigueScore}/${limits.maxFatigueScore})`,
        alternatives: this.suggestAlternativeTimes(proposedTime)
      };
    }

    // Check break requirements
    const breakRequirements = this.getBreakRequirements(staffId, currentTasks, proposedTime);
    const hasMandatoryBreak = breakRequirements.some(req => req.priority === 'mandatory');
    if (hasMandatoryBreak) {
      return {
        canAccept: false,
        reason: 'Mandatory break required before accepting new tasks',
        alternatives: this.suggestAlternativeTimes(proposedTime, limits.minBreakDuration)
      };
    }

    return { canAccept: true };
  }

  // Suggest alternative times
  private static suggestAlternativeTimes(originalTime: Date, delayMinutes: number = 60): Date[] {
    const alternatives: Date[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const altTime = new Date(originalTime.getTime() + (delayMinutes * i * 60000));
      alternatives.push(altTime);
    }

    return alternatives;
  }

  // Get staff wellness summary
  static getWellnessSummary(
    tasks: TaskWithPatientInfo[],
    date: Date
  ): { staffId: string; name: string; metrics: WellnessMetrics }[] {
    return STAFF_RESOURCES.map(staff => ({
      staffId: staff.id,
      name: staff.name,
      metrics: this.calculateWellnessMetrics(staff.id, tasks, date)
    }));
  }

  // Helper function to get staff ID from role
  private static getStaffIdFromRole(role: UserRole): string {
    const staff = STAFF_RESOURCES.find(s => s.role === role);
    return staff?.id || 'unknown';
  }

  // Generate workload balance recommendations
  static generateWorkloadRecommendations(
    tasks: TaskWithPatientInfo[],
    date: Date
  ): string[] {
    const recommendations: string[] = [];
    const wellnessSummary = this.getWellnessSummary(tasks, date);

    // Check for overloaded staff
    const overloadedStaff = wellnessSummary.filter(s => s.metrics.wellnessScore < 70);
    if (overloadedStaff.length > 0) {
      recommendations.push(`${overloadedStaff.length} staff member(s) showing signs of overload - consider redistributing tasks`);
    }

    // Check for unbalanced workload
    const workloadVariance = this.calculateWorkloadVariance(wellnessSummary);
    if (workloadVariance > 2) {
      recommendations.push('Significant workload imbalance detected - redistribute tasks for better balance');
    }

    // Check for fatigue patterns
    const highFatigueStaff = wellnessSummary.filter(s => s.metrics.fatigueScore > 50);
    if (highFatigueStaff.length > wellnessSummary.length * 0.5) {
      recommendations.push('High fatigue levels across team - consider reducing procedure complexity or adding breaks');
    }

    return recommendations;
  }

  // Calculate workload variance
  private static calculateWorkloadVariance(wellnessSummary: { metrics: WellnessMetrics }[]): number {
    const hours = wellnessSummary.map(s => s.metrics.totalHours);
    const average = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - average, 2), 0) / hours.length;
    return Math.sqrt(variance);
  }
}
