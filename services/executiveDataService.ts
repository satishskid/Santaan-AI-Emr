import { Patient, TaskStatus, UserRole } from '../types';

export interface FinancialMetrics {
    monthlyRevenue: number;
    quarterlyRevenue: number;
    averageCycleValue: number;
    revenueGrowth: number;
    costPerCycle: number;
    profitMargin: number;
}

export interface OperationalMetrics {
    activeCycles: number;
    completedCycles: number;
    cancelledCycles: number;
    averageCycleDuration: number;
    resourceUtilization: {
        doctor: number;
        nurse: number;
        embryologist: number;
        operatingTheater: number;
        laboratory: number;
    };
    taskCompletionRate: number;
    onTimePerformance: number;
}

export interface ClinicalMetrics {
    pregnancyRate: number;
    fertilizationRate: number;
    blastocystRate: number;
    implantationRate: number;
    liveBirthRate: number;
    cycleCancellationRate: number;
    averagePatientAge: number;
    averageRetrievedOocytes: number;
}

export interface QualityIndicators {
    patientSatisfactionScore: number;
    timeToTreatment: number;
    complicationRate: number;
    protocolAdherence: number;
    dataCompleteness: number;
    staffEfficiency: number;
}

export interface ExecutiveMetrics {
    financial: FinancialMetrics;
    operational: OperationalMetrics;
    clinical: ClinicalMetrics;
    quality: QualityIndicators;
    trends: {
        period: 'week' | 'month' | 'quarter';
        patientVolume: number[];
        revenue: number[];
        successRates: number[];
    };
}

// Calculate comprehensive executive metrics from patient data
export const calculateExecutiveMetrics = (patients: Patient[], period: 'week' | 'month' | 'quarter' = 'month'): ExecutiveMetrics => {
    const today = new Date('2024-07-22');
    
    // Financial calculations
    const avgCycleValue = 12500; // USD
    const activeCycles = patients.filter(p => 
        p.pathway.some(step => step.stepStatus === 'active')
    ).length;
    const completedCycles = patients.filter(p => 
        p.pathway.every(step => step.stepStatus === 'completed')
    ).length;
    
    const monthlyRevenue = activeCycles * avgCycleValue;
    const quarterlyRevenue = monthlyRevenue * 3;
    const costPerCycle = 8500; // USD
    const profitMargin = ((avgCycleValue - costPerCycle) / avgCycleValue) * 100;
    
    // Operational calculations
    const allTasks = patients.flatMap(p => p.pathway.flatMap(step => step.tasks));
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.Completed).length;
    const taskCompletionRate = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;
    
    // Resource utilization (today's tasks)
    const todayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today.toDateString();
    });
    
    const resourceUtilization = {
        doctor: todayTasks.filter(t => t.assignedTo === UserRole.Doctor).length,
        nurse: todayTasks.filter(t => t.assignedTo === UserRole.Nurse).length,
        embryologist: todayTasks.filter(t => t.assignedTo === UserRole.Embryologist).length,
        operatingTheater: todayTasks.filter(t => t.resourceRequired === 'OT').length,
        laboratory: todayTasks.filter(t => t.resourceRequired === 'Lab').length
    };
    
    // Clinical calculations (simulated based on industry standards)
    const pregnancyRate = 65; // %
    const fertilizationRate = 78; // %
    const blastocystRate = 55; // %
    const implantationRate = 45; // %
    const liveBirthRate = 52; // %
    const cycleCancellationRate = 8.5; // %
    
    const averagePatientAge = patients.reduce((sum, p) => sum + p.age, 0) / patients.length;
    const averageRetrievedOocytes = 12.5; // Average
    
    // Quality indicators
    const patientSatisfactionScore = 4.7; // out of 5
    const timeToTreatment = 14; // days
    const complicationRate = 2.1; // %
    const protocolAdherence = 96.5; // %
    const dataCompleteness = 94.2; // %
    const staffEfficiency = 87.3; // %
    
    // Trend data (simulated)
    const generateTrendData = (baseValue: number, periods: number) => {
        return Array.from({ length: periods }, (_, i) => 
            baseValue + (Math.random() - 0.5) * baseValue * 0.2
        );
    };
    
    const periods = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    
    return {
        financial: {
            monthlyRevenue,
            quarterlyRevenue,
            averageCycleValue: avgCycleValue,
            revenueGrowth: 8.5, // %
            costPerCycle,
            profitMargin
        },
        operational: {
            activeCycles,
            completedCycles,
            cancelledCycles: Math.floor(patients.length * 0.085), // 8.5% cancellation rate
            averageCycleDuration: 28, // days
            resourceUtilization,
            taskCompletionRate,
            onTimePerformance: 92.3 // %
        },
        clinical: {
            pregnancyRate,
            fertilizationRate,
            blastocystRate,
            implantationRate,
            liveBirthRate,
            cycleCancellationRate,
            averagePatientAge,
            averageRetrievedOocytes
        },
        quality: {
            patientSatisfactionScore,
            timeToTreatment,
            complicationRate,
            protocolAdherence,
            dataCompleteness,
            staffEfficiency
        },
        trends: {
            period,
            patientVolume: generateTrendData(activeCycles, periods),
            revenue: generateTrendData(monthlyRevenue / 1000, periods), // in thousands
            successRates: generateTrendData(pregnancyRate, periods)
        }
    };
};

// Get benchmark comparisons
export const getBenchmarkComparisons = () => {
    return {
        pregnancyRate: { clinic: 65, industry: 55, target: 70 },
        fertilizationRate: { clinic: 78, industry: 75, target: 80 },
        cycleCancellationRate: { clinic: 8.5, industry: 12, target: 8 },
        patientSatisfaction: { clinic: 4.7, industry: 4.3, target: 4.8 },
        timeToTreatment: { clinic: 14, industry: 21, target: 10 },
        costEfficiency: { clinic: 68, industry: 60, target: 75 }
    };
};

// Get alerts and recommendations
export const getExecutiveAlerts = (metrics: ExecutiveMetrics) => {
    const alerts = [];
    
    if (metrics.clinical.cycleCancellationRate > 10) {
        alerts.push({
            type: 'warning',
            title: 'High Cancellation Rate',
            message: `Cycle cancellation rate is ${metrics.clinical.cycleCancellationRate}%, above target of 8%`,
            action: 'Review stimulation protocols and patient selection criteria'
        });
    }
    
    if (metrics.operational.taskCompletionRate < 90) {
        alerts.push({
            type: 'critical',
            title: 'Low Task Completion',
            message: `Task completion rate is ${metrics.operational.taskCompletionRate.toFixed(1)}%`,
            action: 'Review workflow efficiency and staff allocation'
        });
    }
    
    if (metrics.quality.patientSatisfactionScore < 4.5) {
        alerts.push({
            type: 'warning',
            title: 'Patient Satisfaction Below Target',
            message: `Current score: ${metrics.quality.patientSatisfactionScore}/5`,
            action: 'Conduct patient feedback analysis and improve communication'
        });
    }
    
    if (metrics.financial.profitMargin < 25) {
        alerts.push({
            type: 'critical',
            title: 'Low Profit Margin',
            message: `Current margin: ${metrics.financial.profitMargin.toFixed(1)}%`,
            action: 'Review cost structure and pricing strategy'
        });
    }
    
    return alerts;
};

// Export functions for use in components
export const getExecutiveData = (patients: Patient[], period: 'week' | 'month' | 'quarter' = 'month') => {
    const metrics = calculateExecutiveMetrics(patients, period);
    const benchmarks = getBenchmarkComparisons();
    const alerts = getExecutiveAlerts(metrics);
    
    return {
        metrics,
        benchmarks,
        alerts
    };
};
