import { TaskWithPatientInfo, Patient } from '../types';
import { ProcessDurationService, PROCEDURE_DEFINITIONS } from './processDurationService';
import { StaffWellnessService } from './staffWellnessService';

// Analytics interfaces
export interface ProcedureDurationAnalysis {
  procedureId: string;
  procedureName: string;
  totalInstances: number;
  averageActualDuration: number;
  averageEstimatedDuration: number;
  variancePercentage: number;
  accuracyScore: number; // 0-100
  recommendations: string[];
}

export interface StaffEfficiencyMetrics {
  staffId: string;
  staffName: string;
  totalProcedures: number;
  averageDuration: number;
  efficiencyScore: number; // 0-100
  specialtyAreas: string[];
  performanceTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface ResourceUtilizationReport {
  date: Date;
  totalCapacityHours: number;
  actualUtilizedHours: number;
  utilizationPercentage: number;
  peakHours: { start: number; end: number; utilization: number }[];
  bottlenecks: string[];
  optimizationOpportunities: string[];
}

export interface SchedulingEfficiencyReport {
  date: Date;
  totalTasks: number;
  onTimeCompletions: number;
  delayedTasks: number;
  averageDelay: number; // minutes
  conflictResolutions: number;
  reschedulingRate: number; // percentage
  patientSatisfactionImpact: number; // 0-100
}

export interface WellnessImpactAnalysis {
  date: Date;
  staffWellnessAverage: number;
  productivityCorrelation: number;
  burnoutRiskFactors: string[];
  wellnessInterventions: string[];
  recommendedActions: string[];
}

export class SchedulingAnalyticsService {
  
  // Analyze procedure duration accuracy
  static analyzeProcedureDurations(
    tasks: TaskWithPatientInfo[],
    actualDurations?: Map<string, number>
  ): ProcedureDurationAnalysis[] {
    const procedureGroups = new Map<string, TaskWithPatientInfo[]>();
    
    // Group tasks by procedure
    tasks.forEach(task => {
      if (!procedureGroups.has(task.title)) {
        procedureGroups.set(task.title, []);
      }
      procedureGroups.get(task.title)!.push(task);
    });

    const analyses: ProcedureDurationAnalysis[] = [];

    procedureGroups.forEach((procedureTasks, procedureTitle) => {
      const procedure = PROCEDURE_DEFINITIONS[procedureTitle];
      if (!procedure) return;

      const totalInstances = procedureTasks.length;
      const estimatedDurations = procedureTasks.map(task => task.durationMinutes);
      const averageEstimatedDuration = estimatedDurations.reduce((sum, d) => sum + d, 0) / totalInstances;

      // Use actual durations if provided, otherwise simulate based on complexity
      let averageActualDuration: number;
      if (actualDurations && actualDurations.has(procedureTitle)) {
        averageActualDuration = actualDurations.get(procedureTitle)!;
      } else {
        // Simulate actual duration with some variance
        averageActualDuration = averageEstimatedDuration * (0.9 + Math.random() * 0.3);
      }

      const variancePercentage = Math.abs(averageActualDuration - averageEstimatedDuration) / averageEstimatedDuration * 100;
      const accuracyScore = Math.max(0, 100 - variancePercentage);

      const recommendations: string[] = [];
      if (variancePercentage > 20) {
        recommendations.push('Review duration estimates - significant variance detected');
      }
      if (averageActualDuration > averageEstimatedDuration * 1.2) {
        recommendations.push('Consider increasing buffer time for this procedure');
      }
      if (variancePercentage > 30) {
        recommendations.push('Investigate factors causing duration inconsistency');
      }

      analyses.push({
        procedureId: procedure.id,
        procedureName: procedureTitle,
        totalInstances,
        averageActualDuration,
        averageEstimatedDuration,
        variancePercentage,
        accuracyScore,
        recommendations
      });
    });

    return analyses.sort((a, b) => b.totalInstances - a.totalInstances);
  }

  // Analyze staff efficiency metrics
  static analyzeStaffEfficiency(
    tasks: TaskWithPatientInfo[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): StaffEfficiencyMetrics[] {
    const staffGroups = new Map<string, TaskWithPatientInfo[]>();
    
    // Group tasks by assigned staff
    tasks.forEach(task => {
      const staffKey = task.assignedTo;
      if (!staffGroups.has(staffKey)) {
        staffGroups.set(staffKey, []);
      }
      staffGroups.get(staffKey)!.push(task);
    });

    const metrics: StaffEfficiencyMetrics[] = [];

    staffGroups.forEach((staffTasks, staffRole) => {
      const totalProcedures = staffTasks.length;
      const totalDuration = staffTasks.reduce((sum, task) => sum + task.durationMinutes, 0);
      const averageDuration = totalDuration / totalProcedures;

      // Calculate efficiency score based on task completion rate and duration accuracy
      const expectedDuration = staffTasks.reduce((sum, task) => {
        const procedure = PROCEDURE_DEFINITIONS[task.title];
        return sum + (procedure?.baseDuration || 30);
      }, 0);
      
      const efficiencyScore = Math.min(100, (expectedDuration / totalDuration) * 100);

      // Determine specialty areas
      const procedureTypes = [...new Set(staffTasks.map(task => task.title))];
      const specialtyAreas = procedureTypes.slice(0, 3); // Top 3 procedures

      // Simulate performance trend
      const performanceTrend: 'improving' | 'stable' | 'declining' = 
        efficiencyScore > 90 ? 'improving' :
        efficiencyScore > 70 ? 'stable' : 'declining';

      const recommendations: string[] = [];
      if (efficiencyScore < 70) {
        recommendations.push('Consider additional training or workflow optimization');
      }
      if (averageDuration > 45) {
        recommendations.push('Review procedure techniques for time optimization');
      }
      if (totalProcedures > 20) {
        recommendations.push('High workload - monitor for burnout signs');
      }

      metrics.push({
        staffId: staffRole.toLowerCase().replace(' ', '-'),
        staffName: staffRole,
        totalProcedures,
        averageDuration,
        efficiencyScore,
        specialtyAreas,
        performanceTrend,
        recommendations
      });
    });

    return metrics.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }

  // Generate resource utilization report
  static generateUtilizationReport(
    tasks: TaskWithPatientInfo[],
    date: Date
  ): ResourceUtilizationReport {
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });

    // Calculate total capacity (8 hours per staff member, 4 staff members)
    const totalCapacityHours = 8 * 4; // 32 hours total capacity
    const actualUtilizedHours = dayTasks.reduce((sum, task) => sum + task.durationMinutes / 60, 0);
    const utilizationPercentage = (actualUtilizedHours / totalCapacityHours) * 100;

    // Analyze peak hours
    const hourlyUtilization = new Array(12).fill(0); // 8 AM to 8 PM
    dayTasks.forEach(task => {
      const taskStart = new Date(task.dueDate);
      const hour = taskStart.getHours() - 8; // Convert to 0-11 range
      if (hour >= 0 && hour < 12) {
        hourlyUtilization[hour] += task.durationMinutes / 60;
      }
    });

    const peakHours = hourlyUtilization
      .map((utilization, index) => ({
        start: index + 8,
        end: index + 9,
        utilization: (utilization / 4) * 100 // 4 staff members
      }))
      .filter(hour => hour.utilization > 80)
      .sort((a, b) => b.utilization - a.utilization);

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    if (utilizationPercentage > 95) {
      bottlenecks.push('Overall capacity near maximum');
    }
    if (peakHours.length > 3) {
      bottlenecks.push('Multiple peak hour periods creating scheduling pressure');
    }

    // Optimization opportunities
    const optimizationOpportunities: string[] = [];
    if (utilizationPercentage < 60) {
      optimizationOpportunities.push('Opportunity to schedule additional procedures');
    }
    if (peakHours.length === 0) {
      optimizationOpportunities.push('Even distribution - consider extending hours for more capacity');
    }

    return {
      date,
      totalCapacityHours,
      actualUtilizedHours,
      utilizationPercentage,
      peakHours,
      bottlenecks,
      optimizationOpportunities
    };
  }

  // Generate scheduling efficiency report
  static generateSchedulingEfficiencyReport(
    tasks: TaskWithPatientInfo[],
    date: Date
  ): SchedulingEfficiencyReport {
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });

    const totalTasks = dayTasks.length;
    
    // Simulate on-time completions (would be tracked in real system)
    const onTimeCompletions = Math.floor(totalTasks * (0.8 + Math.random() * 0.15));
    const delayedTasks = totalTasks - onTimeCompletions;
    const averageDelay = delayedTasks > 0 ? 15 + Math.random() * 20 : 0; // 15-35 minutes average delay

    // Simulate conflict resolutions
    const conflictResolutions = Math.floor(totalTasks * 0.1); // 10% of tasks had conflicts
    const reschedulingRate = (conflictResolutions / totalTasks) * 100;

    // Calculate patient satisfaction impact
    const patientSatisfactionImpact = Math.max(0, 100 - (delayedTasks * 5) - (averageDelay * 0.5));

    return {
      date,
      totalTasks,
      onTimeCompletions,
      delayedTasks,
      averageDelay,
      conflictResolutions,
      reschedulingRate,
      patientSatisfactionImpact
    };
  }

  // Analyze wellness impact on productivity
  static analyzeWellnessImpact(
    tasks: TaskWithPatientInfo[],
    date: Date
  ): WellnessImpactAnalysis {
    const wellnessMetrics = StaffWellnessService.getWellnessSummary(tasks, date);
    const staffWellnessAverage = wellnessMetrics.reduce((sum, staff) => 
      sum + staff.metrics.wellnessScore, 0) / wellnessMetrics.length;

    // Calculate productivity correlation (simplified)
    const productivityCorrelation = staffWellnessAverage / 100; // 0-1 correlation

    // Identify burnout risk factors
    const burnoutRiskFactors: string[] = [];
    const highFatigueStaff = wellnessMetrics.filter(s => s.metrics.fatigueScore > 50);
    const overworkedStaff = wellnessMetrics.filter(s => s.metrics.totalHours > 8);
    
    if (highFatigueStaff.length > 0) {
      burnoutRiskFactors.push(`${highFatigueStaff.length} staff member(s) with high fatigue levels`);
    }
    if (overworkedStaff.length > 0) {
      burnoutRiskFactors.push(`${overworkedStaff.length} staff member(s) working overtime`);
    }
    if (staffWellnessAverage < 70) {
      burnoutRiskFactors.push('Overall team wellness below optimal levels');
    }

    // Wellness interventions
    const wellnessInterventions: string[] = [];
    if (staffWellnessAverage < 80) {
      wellnessInterventions.push('Implement mandatory break periods');
      wellnessInterventions.push('Consider workload redistribution');
    }
    if (highFatigueStaff.length > 1) {
      wellnessInterventions.push('Review procedure complexity and scheduling');
    }

    // Recommended actions
    const recommendedActions: string[] = [];
    if (productivityCorrelation < 0.8) {
      recommendedActions.push('Prioritize staff wellness initiatives to improve productivity');
    }
    if (burnoutRiskFactors.length > 2) {
      recommendedActions.push('Implement immediate burnout prevention measures');
    }
    recommendedActions.push('Monitor wellness metrics daily for early intervention');

    return {
      date,
      staffWellnessAverage,
      productivityCorrelation,
      burnoutRiskFactors,
      wellnessInterventions,
      recommendedActions
    };
  }

  // Generate comprehensive optimization recommendations
  static generateOptimizationRecommendations(
    tasks: TaskWithPatientInfo[],
    patients: Patient[],
    date: Date
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze current state
    const utilizationReport = this.generateUtilizationReport(tasks, date);
    const efficiencyReport = this.generateSchedulingEfficiencyReport(tasks, date);
    const wellnessAnalysis = this.analyzeWellnessImpact(tasks, date);
    const durationAnalysis = this.analyzeProcedureDurations(tasks);

    // Utilization recommendations
    if (utilizationReport.utilizationPercentage > 95) {
      recommendations.push('Consider adding additional staff or extending clinic hours');
    } else if (utilizationReport.utilizationPercentage < 60) {
      recommendations.push('Opportunity to schedule more procedures or optimize staff allocation');
    }

    // Efficiency recommendations
    if (efficiencyReport.reschedulingRate > 15) {
      recommendations.push('High rescheduling rate - review scheduling algorithms and conflict detection');
    }
    if (efficiencyReport.averageDelay > 20) {
      recommendations.push('Significant delays detected - consider increasing buffer times');
    }

    // Wellness recommendations
    if (wellnessAnalysis.staffWellnessAverage < 75) {
      recommendations.push('Staff wellness below optimal - implement wellness support programs');
    }
    if (wellnessAnalysis.burnoutRiskFactors.length > 1) {
      recommendations.push('Multiple burnout risk factors - prioritize workload balancing');
    }

    // Duration accuracy recommendations
    const inaccurateProcedures = durationAnalysis.filter(p => p.accuracyScore < 80);
    if (inaccurateProcedures.length > 0) {
      recommendations.push(`Review duration estimates for ${inaccurateProcedures.length} procedure(s) with low accuracy`);
    }

    return recommendations;
  }

  // Calculate overall system performance score
  static calculateSystemPerformanceScore(
    tasks: TaskWithPatientInfo[],
    patients: Patient[],
    date: Date
  ): {
    overallScore: number;
    categoryScores: {
      utilization: number;
      efficiency: number;
      wellness: number;
      accuracy: number;
    };
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const utilizationReport = this.generateUtilizationReport(tasks, date);
    const efficiencyReport = this.generateSchedulingEfficiencyReport(tasks, date);
    const wellnessAnalysis = this.analyzeWellnessImpact(tasks, date);
    const durationAnalysis = this.analyzeProcedureDurations(tasks);

    // Calculate category scores
    const utilizationScore = Math.min(100, utilizationReport.utilizationPercentage * 1.2); // Optimal around 80-85%
    const efficiencyScore = efficiencyReport.patientSatisfactionImpact;
    const wellnessScore = wellnessAnalysis.staffWellnessAverage;
    const accuracyScore = durationAnalysis.length > 0 
      ? durationAnalysis.reduce((sum, p) => sum + p.accuracyScore, 0) / durationAnalysis.length 
      : 100;

    const categoryScores = {
      utilization: Math.round(utilizationScore),
      efficiency: Math.round(efficiencyScore),
      wellness: Math.round(wellnessScore),
      accuracy: Math.round(accuracyScore)
    };

    // Calculate overall score
    const overallScore = Math.round(
      (utilizationScore * 0.25) + 
      (efficiencyScore * 0.3) + 
      (wellnessScore * 0.25) + 
      (accuracyScore * 0.2)
    );

    // Assign grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      overallScore,
      categoryScores,
      grade
    };
  }
}
