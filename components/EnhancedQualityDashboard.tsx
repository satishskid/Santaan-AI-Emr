import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { DataQualityService } from '../services/dataValidationService';
import { Card, MetricCard, Badge, ProgressBar } from './ui/DesignSystem';
import { LineChart, BarChart, DonutChart, GaugeChart } from './ui/Charts';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  HeartPulseIcon,
  TestTubeIcon,
  MicroscopeIcon,
  UsersIcon,
  ActivityIcon
} from './icons';

interface QualityDashboardProps {
  patients?: Patient[];
}

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  category: 'clinical' | 'operational' | 'safety' | 'patient' | 'laboratory';
  description: string;
  benchmark?: {
    industry: number;
    topQuartile: number;
  };
}

interface ComplianceMetric {
  standard: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  details: string;
}

const EnhancedQualityDashboard: React.FC<QualityDashboardProps> = ({ patients = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clinical' | 'operational' | 'safety' | 'patient' | 'laboratory'>('all');

  // Calculate comprehensive quality metrics
  const qualityMetrics = useMemo(() => {
    // Calculate data quality for all patients
    const dataQualityScores = patients.map(p => DataQualityService.calculateDataQuality(p));
    const avgDataQuality = dataQualityScores.length > 0 
      ? dataQualityScores.reduce((sum, dq) => sum + dq.overall, 0) / dataQualityScores.length 
      : 100;

    const metrics: QualityMetric[] = [
      // Clinical KPIs
      {
        name: 'Clinical Pregnancy Rate',
        value: 65,
        target: 60,
        unit: '%',
        trend: 'up',
        status: 'good',
        category: 'clinical',
        description: 'Percentage of cycles resulting in clinical pregnancy',
        benchmark: { industry: 55, topQuartile: 70 }
      },
      {
        name: 'Live Birth Rate',
        value: 52,
        target: 50,
        unit: '%',
        trend: 'up',
        status: 'good',
        category: 'clinical',
        description: 'Percentage of cycles resulting in live birth',
        benchmark: { industry: 45, topQuartile: 58 }
      },
      {
        name: 'Fertilization Rate',
        value: 78,
        target: 75,
        unit: '%',
        trend: 'stable',
        status: 'good',
        category: 'clinical',
        description: 'Percentage of mature oocytes that fertilize normally',
        benchmark: { industry: 75, topQuartile: 82 }
      },
      {
        name: 'Implantation Rate',
        value: 45,
        target: 40,
        unit: '%',
        trend: 'up',
        status: 'good',
        category: 'clinical',
        description: 'Percentage of transferred embryos that implant',
        benchmark: { industry: 35, topQuartile: 50 }
      },
      
      // Operational Metrics
      {
        name: 'Cycle Cancellation Rate',
        value: 8.5,
        target: 10,
        unit: '%',
        trend: 'down',
        status: 'good',
        category: 'operational',
        description: 'Percentage of started cycles that are cancelled',
        benchmark: { industry: 12, topQuartile: 8 }
      },
      {
        name: 'Protocol Adherence',
        value: 96.5,
        target: 95,
        unit: '%',
        trend: 'up',
        status: 'good',
        category: 'operational',
        description: 'Percentage of protocols followed correctly',
        benchmark: { industry: 92, topQuartile: 97 }
      },
      {
        name: 'Data Completeness',
        value: Math.round(avgDataQuality),
        target: 95,
        unit: '%',
        trend: avgDataQuality > 90 ? 'up' : 'down',
        status: avgDataQuality > 95 ? 'good' : avgDataQuality > 85 ? 'warning' : 'critical',
        category: 'operational',
        description: 'Percentage of required data fields completed',
        benchmark: { industry: 88, topQuartile: 96 }
      },
      
      // Safety Indicators
      {
        name: 'OHSS Incidence',
        value: 2.1,
        target: 3,
        unit: '%',
        trend: 'down',
        status: 'good',
        category: 'safety',
        description: 'Ovarian hyperstimulation syndrome occurrence rate',
        benchmark: { industry: 4, topQuartile: 2 }
      },
      {
        name: 'Adverse Events',
        value: 1.2,
        target: 2,
        unit: '%',
        trend: 'down',
        status: 'good',
        category: 'safety',
        description: 'Serious adverse events per cycle',
        benchmark: { industry: 2.5, topQuartile: 1.0 }
      },
      
      // Patient Experience
      {
        name: 'Patient Satisfaction',
        value: 4.7,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        status: 'good',
        category: 'patient',
        description: 'Overall patient satisfaction score',
        benchmark: { industry: 4.3, topQuartile: 4.8 }
      },
      {
        name: 'Communication Effectiveness',
        value: 4.6,
        target: 4.5,
        unit: '/5',
        trend: 'stable',
        status: 'good',
        category: 'patient',
        description: 'Patient rating of communication quality',
        benchmark: { industry: 4.2, topQuartile: 4.7 }
      },
      
      // Laboratory Quality
      {
        name: 'Embryo Grading Consistency',
        value: 94.2,
        target: 90,
        unit: '%',
        trend: 'up',
        status: 'good',
        category: 'laboratory',
        description: 'Inter-observer agreement in embryo grading',
        benchmark: { industry: 88, topQuartile: 95 }
      },
      {
        name: 'Equipment Calibration',
        value: 99.1,
        target: 98,
        unit: '%',
        trend: 'stable',
        status: 'good',
        category: 'laboratory',
        description: 'Percentage of equipment within calibration',
        benchmark: { industry: 96, topQuartile: 99 }
      }
    ];

    return metrics;
  }, [patients]);

  // Compliance metrics
  const complianceMetrics: ComplianceMetric[] = [
    {
      standard: 'SART',
      requirement: 'Data Reporting Completeness',
      status: 'compliant',
      score: 96,
      details: 'All required fields captured for outcome reporting'
    },
    {
      standard: 'ESHRE',
      requirement: 'Quality Indicators',
      status: 'compliant',
      score: 94,
      details: 'Meeting European quality benchmarks'
    },
    {
      standard: 'CAP',
      requirement: 'Laboratory Standards',
      status: 'compliant',
      score: 98,
      details: 'Laboratory accreditation requirements met'
    },
    {
      standard: 'FDA',
      requirement: 'Tissue Banking',
      status: 'partial',
      score: 87,
      details: 'Minor documentation gaps in tissue tracking'
    }
  ];

  // Filter metrics by category
  const filteredMetrics = selectedCategory === 'all' 
    ? qualityMetrics 
    : qualityMetrics.filter(m => m.category === selectedCategory);

  // Calculate category summaries
  const categorySummaries = useMemo(() => {
    const categories = ['clinical', 'operational', 'safety', 'patient', 'laboratory'] as const;
    return categories.map(category => {
      const categoryMetrics = qualityMetrics.filter(m => m.category === category);
      const avgScore = categoryMetrics.reduce((sum, m) => sum + (m.value / m.target) * 100, 0) / categoryMetrics.length;
      const goodCount = categoryMetrics.filter(m => m.status === 'good').length;
      
      return {
        category,
        score: Math.round(avgScore),
        status: avgScore >= 100 ? 'good' : avgScore >= 90 ? 'warning' : 'critical',
        metricsCount: categoryMetrics.length,
        goodCount
      };
    });
  }, [qualityMetrics]);

  // Data quality alerts
  const dataQualityAlerts = useMemo(() => {
    return DataQualityService.getDataQualityAlerts(patients);
  }, [patients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clinical': return HeartPulseIcon;
      case 'operational': return ActivityIcon;
      case 'safety': return AlertTriangleIcon;
      case 'patient': return UsersIcon;
      case 'laboratory': return MicroscopeIcon;
      default: return BarChart3Icon;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quality Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive quality metrics and compliance monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          {(['month', 'quarter', 'year'] as const).map((period) => (
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

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categorySummaries.map((summary) => {
          const Icon = getCategoryIcon(summary.category);
          return (
            <Card
              key={summary.category}
              variant="elevated"
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedCategory === summary.category ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-center" onClick={() => setSelectedCategory(summary.category)}>
                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {summary.category}
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.score}%
                  </div>
                  <Badge variant={summary.status === 'good' ? 'success' : summary.status === 'warning' ? 'warning' : 'danger'}>
                    {summary.goodCount}/{summary.metricsCount} Good
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Data Quality Alerts */}
      {dataQualityAlerts.length > 0 && (
        <Card variant="outlined" className="border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Data Quality Alerts ({dataQualityAlerts.length})
              </h3>
              <div className="mt-2 space-y-1">
                {dataQualityAlerts.slice(0, 3).map((alert, index) => (
                  <p key={index} className="text-sm text-yellow-700">
                    • {alert.message}
                  </p>
                ))}
                {dataQualityAlerts.length > 3 && (
                  <p className="text-sm text-yellow-600">
                    +{dataQualityAlerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMetrics.map((metric, index) => (
          <Card key={index} variant="elevated" className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {metric.name}
              </h3>
              <Badge variant={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'danger'}>
                {metric.status}
              </Badge>
            </div>

            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {metric.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {metric.target}{metric.unit}</span>
                <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
              </div>

              <ProgressBar
                value={metric.value}
                max={metric.target}
                variant={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'danger'}
                size="sm"
              />

              {metric.benchmark && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Industry avg:</span>
                    <span>{metric.benchmark.industry}{metric.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top quartile:</span>
                    <span>{metric.benchmark.topQuartile}{metric.unit}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedQualityDashboard;
