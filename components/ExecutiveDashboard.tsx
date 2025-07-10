import React, { useState, useMemo } from 'react';
import { Patient, TaskStatus, UserRole } from '../types';
import DataQualityIndicator from './DataQualityIndicator';
import {
    TrendingUpIcon,
    UsersIcon,
    CalendarDaysIcon,
    DollarSignIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    BarChart3Icon,
    HeartPulseIcon,
    TestTubeIcon,
    MicroscopeIcon,
    ActivityIcon
} from './icons';

interface ExecutiveDashboardProps {
    patients: Patient[];
}

interface KPICard {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'stable';
    icon: React.ComponentType<any>;
    color: string;
}

interface QualityMetric {
    metric: string;
    current: number;
    target: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ patients }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

    // Calculate comprehensive metrics
    const metrics = useMemo(() => {
        const today = new Date('2024-07-22');
        const totalPatients = patients.length;
        const activeCycles = patients.filter(p => 
            p.pathway.some(step => step.stepStatus === 'active')
        ).length;
        
        // Cycle stage distribution
        const stageDistribution = patients.reduce((acc, patient) => {
            const activeStep = patient.pathway.find(step => step.stepStatus === 'active');
            const stepName = activeStep?.stepName || 'Completed';
            acc[stepName] = (acc[stepName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Task completion rates
        const allTasks = patients.flatMap(p => p.pathway.flatMap(step => step.tasks));
        const completedTasks = allTasks.filter(t => t.status === TaskStatus.Completed).length;
        const taskCompletionRate = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;

        // Resource utilization
        const todayTasks = allTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
        });

        const resourceUtilization = {
            doctor: todayTasks.filter(t => t.assignedTo === UserRole.Doctor).length,
            nurse: todayTasks.filter(t => t.assignedTo === UserRole.Nurse).length,
            embryologist: todayTasks.filter(t => t.assignedTo === UserRole.Embryologist).length,
            ot: todayTasks.filter(t => t.resourceRequired === 'OT').length,
            lab: todayTasks.filter(t => t.resourceRequired === 'Lab').length
        };

        // Financial metrics (simulated)
        const avgCycleValue = 12500; // USD
        const monthlyRevenue = activeCycles * avgCycleValue;
        
        // Success rates (simulated based on patient data)
        const completedCycles = patients.filter(p => 
            p.pathway.every(step => step.stepStatus === 'completed')
        ).length;
        const pregnancyRate = completedCycles > 0 ? 85 : 0; // Simulated

        return {
            totalPatients,
            activeCycles,
            stageDistribution,
            taskCompletionRate,
            resourceUtilization,
            monthlyRevenue,
            pregnancyRate,
            completedCycles
        };
    }, [patients]);

    const kpiCards: KPICard[] = [
        {
            title: 'Active Cycles',
            value: metrics.activeCycles,
            change: '+12%',
            trend: 'up',
            icon: HeartPulseIcon,
            color: 'bg-blue-500'
        },
        {
            title: 'Monthly Revenue',
            value: `$${(metrics.monthlyRevenue / 1000).toFixed(0)}K`,
            change: '+8.5%',
            trend: 'up',
            icon: DollarSignIcon,
            color: 'bg-green-500'
        },
        {
            title: 'Pregnancy Rate',
            value: `${metrics.pregnancyRate}%`,
            change: '+2.1%',
            trend: 'up',
            icon: TestTubeIcon,
            color: 'bg-purple-500'
        },
        {
            title: 'Task Completion',
            value: `${metrics.taskCompletionRate.toFixed(1)}%`,
            change: '-1.2%',
            trend: 'down',
            icon: CheckCircleIcon,
            color: 'bg-orange-500'
        }
    ];

    const qualityMetrics: QualityMetric[] = [
        {
            metric: 'Clinical Pregnancy Rate',
            current: 85,
            target: 80,
            unit: '%',
            status: 'good'
        },
        {
            metric: 'Fertilization Rate',
            current: 78,
            target: 75,
            unit: '%',
            status: 'good'
        },
        {
            metric: 'Cycle Cancellation Rate',
            current: 8.5,
            target: 10,
            unit: '%',
            status: 'good'
        },
        {
            metric: 'Average Patient Age',
            current: 34.2,
            target: 35,
            unit: 'years',
            status: 'good'
        },
        {
            metric: 'Time to Treatment',
            current: 14,
            target: 21,
            unit: 'days',
            status: 'good'
        },
        {
            metric: 'Patient Satisfaction',
            current: 4.7,
            target: 4.5,
            unit: '/5',
            status: 'good'
        }
    ];

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
        if (trend === 'down') return <TrendingUpIcon className="h-4 w-4 text-red-500 rotate-180" />;
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    };

    const getQualityStatus = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'critical': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Executive Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Comprehensive clinic overview and performance metrics
                    </p>
                </div>
                <div className="flex space-x-2">
                    {(['week', 'month', 'quarter'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedPeriod === period
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${kpi.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex items-center space-x-1">
                                    {getTrendIcon(kpi.trend)}
                                    <span className={`text-sm font-medium ${
                                        kpi.trend === 'up' ? 'text-green-600' : 
                                        kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {kpi.change}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {kpi.value}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {kpi.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Patient Flow Overview */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Patient Flow Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(metrics.stageDistribution).map(([stage, count]) => (
                            <div key={stage} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {count}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stage.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Utilization */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Today's Resource Utilization
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Doctor</span>
                            <span className="font-semibold">{metrics.resourceUtilization.doctor} tasks</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Nurse</span>
                            <span className="font-semibold">{metrics.resourceUtilization.nurse} tasks</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Embryologist</span>
                            <span className="font-semibold">{metrics.resourceUtilization.embryologist} tasks</span>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Operating Theater</span>
                                <span className="font-semibold">{metrics.resourceUtilization.ot} procedures</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Laboratory</span>
                                <span className="font-semibold">{metrics.resourceUtilization.lab} analyses</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Quality Metrics & KPIs
                    </h2>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Detailed Report →
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qualityMetrics.map((metric, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {metric.metric}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityStatus(metric.status)}`}>
                                    {metric.status}
                                </span>
                            </div>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metric.current}
                                </span>
                                <span className="text-sm text-gray-500">{metric.unit}</span>
                            </div>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Target: {metric.target}{metric.unit}</span>
                                    <span>{((metric.current / metric.target) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            metric.current >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}
                                        style={{
                                            width: `${Math.min((metric.current / metric.target) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Quality Overview */}
            <DataQualityIndicator patients={patients} showDetails={true} />

            {/* Patient Details Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Active Patient Overview
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Age
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Protocol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cycle Day
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Current Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Progress
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {patients.map((patient) => {
                                const cycleDay = Math.floor((new Date('2024-07-22').getTime() - new Date(patient.cycleStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                const activeStep = patient.pathway.find(step => step.stepStatus === 'active');
                                const completedSteps = patient.pathway.filter(step => step.stepStatus === 'completed').length;
                                const totalSteps = patient.pathway.length;
                                const progressPercentage = (completedSteps / totalSteps) * 100;

                                return (
                                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {patient.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {patient.age}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {patient.protocol}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            Day {cycleDay}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {activeStep?.stepName || 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${progressPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {completedSteps}/{totalSteps}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
