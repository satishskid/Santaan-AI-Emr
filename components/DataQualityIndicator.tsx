import React, { useMemo } from 'react';
import { Patient } from '../types';
import { DataQualityService } from '../services/dataValidationService';
import { Card, Badge, ProgressBar } from './ui/DesignSystem';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, DatabaseIcon } from './icons';

interface DataQualityIndicatorProps {
  patients: Patient[];
  showDetails?: boolean;
  className?: string;
}

interface QualityAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  patientId?: string;
  taskId?: string;
  action: string;
}

const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  patients,
  showDetails = false,
  className = ''
}) => {
  // Calculate overall data quality metrics
  const qualityMetrics = useMemo(() => {
    const patientQualities = patients.map(patient => 
      DataQualityService.calculateDataQuality(patient)
    );
    
    if (patientQualities.length === 0) {
      return {
        overall: 100,
        completeness: 100,
        accuracy: 100,
        consistency: 100,
        timeliness: 100,
        patientCount: 0
      };
    }
    
    const averages = {
      overall: patientQualities.reduce((sum, pq) => sum + pq.overall, 0) / patientQualities.length,
      completeness: patientQualities.reduce((sum, pq) => sum + pq.completeness, 0) / patientQualities.length,
      accuracy: patientQualities.reduce((sum, pq) => sum + pq.accuracy, 0) / patientQualities.length,
      consistency: patientQualities.reduce((sum, pq) => sum + pq.consistency, 0) / patientQualities.length,
      timeliness: patientQualities.reduce((sum, pq) => sum + pq.timeliness, 0) / patientQualities.length,
      patientCount: patients.length
    };
    
    return {
      overall: Math.round(averages.overall),
      completeness: Math.round(averages.completeness),
      accuracy: Math.round(averages.accuracy),
      consistency: Math.round(averages.consistency),
      timeliness: Math.round(averages.timeliness),
      patientCount: averages.patientCount
    };
  }, [patients]);
  
  // Get data quality alerts
  const alerts = useMemo(() => {
    return DataQualityService.getDataQualityAlerts(patients);
  }, [patients]);
  
  // Calculate validation statistics
  const validationStats = useMemo(() => {
    let totalTasks = 0;
    let validatedTasks = 0;
    let errorCount = 0;
    let warningCount = 0;
    
    patients.forEach(patient => {
      patient.pathway.forEach(step => {
        step.tasks.forEach(task => {
          totalTasks++;
          const validation = DataQualityService.validateTaskData(task.title, task.data, patient);
          
          if (validation.isValid) {
            validatedTasks++;
          }
          
          errorCount += validation.errors.length;
          warningCount += validation.warnings.length;
        });
      });
    });
    
    return {
      totalTasks,
      validatedTasks,
      validationRate: totalTasks > 0 ? (validatedTasks / totalTasks) * 100 : 100,
      errorCount,
      warningCount
    };
  }, [patients]);
  
  const getQualityColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'warning';
    return 'danger';
  };
  
  const getQualityIcon = (score: number) => {
    if (score >= 95) return CheckCircleIcon;
    if (score >= 85) return ClockIcon;
    return AlertTriangleIcon;
  };
  
  if (!showDetails) {
    // Compact view for dashboard headers
    const OverallIcon = getQualityIcon(qualityMetrics.overall);
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <OverallIcon className={`h-5 w-5 ${
          qualityMetrics.overall >= 95 ? 'text-green-500' : 
          qualityMetrics.overall >= 85 ? 'text-yellow-500' : 'text-red-500'
        }`} />
        <span className="text-sm font-medium">
          Data Quality: {qualityMetrics.overall}%
        </span>
        {alerts.length > 0 && (
          <Badge variant="warning" size="sm">
            {alerts.length} alerts
          </Badge>
        )}
      </div>
    );
  }
  
  // Detailed view
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DatabaseIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Quality Dashboard
          </h3>
        </div>
        <Badge variant={getQualityColor(qualityMetrics.overall)}>
          Overall: {qualityMetrics.overall}%
        </Badge>
      </div>
      
      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {qualityMetrics.completeness}%
          </div>
          <div className="text-sm text-gray-500">Completeness</div>
          <ProgressBar
            value={qualityMetrics.completeness}
            max={100}
            variant={getQualityColor(qualityMetrics.completeness)}
            size="sm"
            className="mt-1"
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {qualityMetrics.accuracy}%
          </div>
          <div className="text-sm text-gray-500">Accuracy</div>
          <ProgressBar
            value={qualityMetrics.accuracy}
            max={100}
            variant={getQualityColor(qualityMetrics.accuracy)}
            size="sm"
            className="mt-1"
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {qualityMetrics.consistency}%
          </div>
          <div className="text-sm text-gray-500">Consistency</div>
          <ProgressBar
            value={qualityMetrics.consistency}
            max={100}
            variant={getQualityColor(qualityMetrics.consistency)}
            size="sm"
            className="mt-1"
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {qualityMetrics.timeliness}%
          </div>
          <div className="text-sm text-gray-500">Timeliness</div>
          <ProgressBar
            value={qualityMetrics.timeliness}
            max={100}
            variant={getQualityColor(qualityMetrics.timeliness)}
            size="sm"
            className="mt-1"
          />
        </div>
      </div>
      
      {/* Validation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {validationStats.validatedTasks}/{validationStats.totalTasks}
              </div>
              <div className="text-sm text-gray-500">Tasks Validated</div>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <ProgressBar
            value={validationStats.validationRate}
            max={100}
            variant="success"
            size="sm"
            className="mt-2"
          />
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-red-600">
                {validationStats.errorCount}
              </div>
              <div className="text-sm text-gray-500">Validation Errors</div>
            </div>
            <AlertTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {validationStats.warningCount}
              </div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Active Data Quality Alerts ({alerts.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Action: {alert.action}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.type === 'error' ? 'danger' :
                      alert.type === 'warning' ? 'warning' : 'info'
                    }
                    size="sm"
                  >
                    {alert.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Monitoring {qualityMetrics.patientCount} patients across {validationStats.totalTasks} tasks
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DataQualityIndicator;
