import { Patient, TaskStatus } from '../types';

// Statistical calculation utilities
export class StatisticalAnalysis {
  
  // Calculate confidence interval for proportion
  static calculateConfidenceInterval(
    successes: number, 
    total: number, 
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number; margin: number } {
    if (total === 0) return { lower: 0, upper: 0, margin: 0 };
    
    const proportion = successes / total;
    const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
    const standardError = Math.sqrt((proportion * (1 - proportion)) / total);
    const margin = zScore * standardError;
    
    return {
      lower: Math.max(0, proportion - margin),
      upper: Math.min(1, proportion + margin),
      margin
    };
  }
  
  // Calculate moving average
  static calculateMovingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }
    return result;
  }
  
  // Calculate trend analysis
  static calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    correlation: number;
  } {
    if (values.length < 2) return { direction: 'stable', slope: 0, correlation: 0 };
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = values.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    const direction = Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing';
    
    return { direction, slope, correlation };
  }
}

// Audit trail for derived metrics
export interface AuditTrail {
  metricName: string;
  calculatedAt: Date;
  sourceData: {
    patientIds: string[];
    taskIds: string[];
    dataPoints: number;
  };
  calculation: {
    formula: string;
    parameters: Record<string, any>;
    result: number;
    confidenceInterval?: { lower: number; upper: number };
  };
  version: string;
  calculatedBy: string;
}

// Derived metrics calculator
export class DerivedMetricsEngine {
  private static auditTrails: AuditTrail[] = [];
  
  // Calculate clinical pregnancy rate with confidence interval
  static calculateClinicalPregnancyRate(patients: Patient[]): {
    rate: number;
    confidenceInterval: { lower: number; upper: number };
    auditTrail: AuditTrail;
  } {
    const completedCycles = patients.filter(p => 
      p.pathway.some(step => 
        step.stepName === 'Pregnancy Test' && 
        step.tasks.some(task => task.status === TaskStatus.Completed)
      )
    );
    
    const pregnancies = completedCycles.filter(p => {
      const pregnancyTest = p.pathway
        .find(step => step.stepName === 'Pregnancy Test')
        ?.tasks.find(task => task.title === 'hCG Blood Test');
      
      return pregnancyTest?.data?.hcgValue > 25; // Clinical pregnancy threshold
    });
    
    const rate = completedCycles.length > 0 ? pregnancies.length / completedCycles.length : 0;
    const ci = StatisticalAnalysis.calculateConfidenceInterval(pregnancies.length, completedCycles.length);
    
    const auditTrail: AuditTrail = {
      metricName: 'Clinical Pregnancy Rate',
      calculatedAt: new Date(),
      sourceData: {
        patientIds: completedCycles.map(p => p.id),
        taskIds: completedCycles.flatMap(p => 
          p.pathway.flatMap(step => step.tasks.map(task => task.id))
        ),
        dataPoints: completedCycles.length
      },
      calculation: {
        formula: 'pregnancies / completed_cycles',
        parameters: {
          pregnancies: pregnancies.length,
          completed_cycles: completedCycles.length,
          hcg_threshold: 25
        },
        result: rate,
        confidenceInterval: { lower: ci.lower, upper: ci.upper }
      },
      version: '1.0',
      calculatedBy: 'system'
    };
    
    this.auditTrails.push(auditTrail);
    
    return {
      rate: rate * 100,
      confidenceInterval: { lower: ci.lower * 100, upper: ci.upper * 100 },
      auditTrail
    };
  }
  
  // Calculate fertilization rate
  static calculateFertilizationRate(patients: Patient[]): {
    rate: number;
    confidenceInterval: { lower: number; upper: number };
    auditTrail: AuditTrail;
  } {
    const fertilizationData = patients.flatMap(p => 
      p.pathway.flatMap(step => 
        step.tasks.filter(task => 
          task.title === 'Post-Fertilization Check (Day 1)' && 
          task.status === TaskStatus.Completed
        )
      )
    );
    
    const totalOocytes = fertilizationData.reduce((sum, task) => 
      sum + (task.data?.oocytesInseminated || 0), 0
    );
    
    const normalFertilization = fertilizationData.reduce((sum, task) => 
      sum + (task.data?.normalFertilization || 0), 0
    );
    
    const rate = totalOocytes > 0 ? normalFertilization / totalOocytes : 0;
    const ci = StatisticalAnalysis.calculateConfidenceInterval(normalFertilization, totalOocytes);
    
    const auditTrail: AuditTrail = {
      metricName: 'Fertilization Rate',
      calculatedAt: new Date(),
      sourceData: {
        patientIds: patients.map(p => p.id),
        taskIds: fertilizationData.map(task => task.id),
        dataPoints: fertilizationData.length
      },
      calculation: {
        formula: 'normal_fertilization / total_oocytes',
        parameters: {
          normal_fertilization: normalFertilization,
          total_oocytes: totalOocytes
        },
        result: rate,
        confidenceInterval: { lower: ci.lower, upper: ci.upper }
      },
      version: '1.0',
      calculatedBy: 'system'
    };
    
    this.auditTrails.push(auditTrail);
    
    return {
      rate: rate * 100,
      confidenceInterval: { lower: ci.lower * 100, upper: ci.upper * 100 },
      auditTrail
    };
  }
  
  // Calculate cycle cancellation rate
  static calculateCancellationRate(patients: Patient[]): {
    rate: number;
    confidenceInterval: { lower: number; upper: number };
    auditTrail: AuditTrail;
  } {
    const startedCycles = patients.filter(p => 
      p.pathway.some(step => step.stepStatus !== 'upcoming')
    );
    
    const cancelledCycles = startedCycles.filter(p => 
      p.pathway.some(step => 
        step.tasks.some(task => task.status === TaskStatus.OnHold)
      )
    );
    
    const rate = startedCycles.length > 0 ? cancelledCycles.length / startedCycles.length : 0;
    const ci = StatisticalAnalysis.calculateConfidenceInterval(cancelledCycles.length, startedCycles.length);
    
    const auditTrail: AuditTrail = {
      metricName: 'Cycle Cancellation Rate',
      calculatedAt: new Date(),
      sourceData: {
        patientIds: startedCycles.map(p => p.id),
        taskIds: [],
        dataPoints: startedCycles.length
      },
      calculation: {
        formula: 'cancelled_cycles / started_cycles',
        parameters: {
          cancelled_cycles: cancelledCycles.length,
          started_cycles: startedCycles.length
        },
        result: rate,
        confidenceInterval: { lower: ci.lower, upper: ci.upper }
      },
      version: '1.0',
      calculatedBy: 'system'
    };
    
    this.auditTrails.push(auditTrail);
    
    return {
      rate: rate * 100,
      confidenceInterval: { lower: ci.lower * 100, upper: ci.upper * 100 },
      auditTrail
    };
  }
  
  // Calculate average patient age with statistics
  static calculateAveragePatientAge(patients: Patient[]): {
    average: number;
    median: number;
    standardDeviation: number;
    auditTrail: AuditTrail;
  } {
    if (patients.length === 0) {
      return { average: 0, median: 0, standardDeviation: 0, auditTrail: {} as AuditTrail };
    }
    
    const ages = patients.map(p => p.age);
    const average = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    
    const sortedAges = [...ages].sort((a, b) => a - b);
    const median = sortedAges.length % 2 === 0
      ? (sortedAges[sortedAges.length / 2 - 1] + sortedAges[sortedAges.length / 2]) / 2
      : sortedAges[Math.floor(sortedAges.length / 2)];
    
    const variance = ages.reduce((sum, age) => sum + Math.pow(age - average, 2), 0) / ages.length;
    const standardDeviation = Math.sqrt(variance);
    
    const auditTrail: AuditTrail = {
      metricName: 'Average Patient Age',
      calculatedAt: new Date(),
      sourceData: {
        patientIds: patients.map(p => p.id),
        taskIds: [],
        dataPoints: patients.length
      },
      calculation: {
        formula: 'sum(ages) / count(patients)',
        parameters: {
          total_patients: patients.length,
          age_sum: ages.reduce((sum, age) => sum + age, 0),
          min_age: Math.min(...ages),
          max_age: Math.max(...ages)
        },
        result: average
      },
      version: '1.0',
      calculatedBy: 'system'
    };
    
    this.auditTrails.push(auditTrail);
    
    return { average, median, standardDeviation, auditTrail };
  }
  
  // Get all audit trails
  static getAuditTrails(): AuditTrail[] {
    return [...this.auditTrails];
  }
  
  // Clear audit trails (for testing)
  static clearAuditTrails(): void {
    this.auditTrails = [];
  }
}
