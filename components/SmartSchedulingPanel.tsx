import React, { useState, useMemo } from 'react';
import { Patient, TaskWithPatientInfo, UserRole } from '../types';
import { Card, Badge, Button } from './ui/DesignSystem';
import { LineChart, BarChart, GaugeChart } from './ui/Charts';
import { 
  CalendarIcon, 
  ClockIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  ActivityIcon,
  ZapIcon
} from './icons';
import { ResourceOptimizationService, OptimizationResult, AlternativeSlot } from '../services/resourceOptimizationService';
import { StaffWellnessService, WellnessMetrics } from '../services/staffWellnessService';
import { ProcessDurationService, ComplexityLevel } from '../services/processDurationService';

interface SmartSchedulingPanelProps {
  tasks: TaskWithPatientInfo[];
  patients: Patient[];
  selectedDate: Date;
  onScheduleTask?: (task: Partial<TaskWithPatientInfo>) => void;
  onOptimizeSchedule?: () => void;
  currentUserRole: UserRole;
}

const SmartSchedulingPanel: React.FC<SmartSchedulingPanelProps> = ({
  tasks,
  patients,
  selectedDate,
  onScheduleTask,
  onOptimizeSchedule,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'optimization' | 'wellness' | 'scheduling' | 'analytics'>('optimization');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel>(ComplexityLevel.Standard);

  // Calculate optimization results
  const optimizationResult = useMemo(() => {
    return ResourceOptimizationService.optimizeSchedule(tasks, selectedDate, patients);
  }, [tasks, selectedDate, patients]);

  // Calculate wellness metrics
  const wellnessMetrics = useMemo(() => {
    return StaffWellnessService.getWellnessSummary(tasks, selectedDate);
  }, [tasks, selectedDate]);

  // Get suggested time slots
  const suggestedSlots = useMemo(() => {
    if (!selectedProcedure) return [];
    return ResourceOptimizationService.suggestOptimalTime(
      selectedProcedure,
      selectedComplexity,
      selectedDate,
      tasks
    );
  }, [selectedProcedure, selectedComplexity, selectedDate, tasks]);

  const getOptimizationStatusColor = (result: OptimizationResult) => {
    if (result.isOptimal) return 'success';
    const criticalConflicts = result.conflicts.filter(c => c.severity === 'critical').length;
    if (criticalConflicts > 0) return 'danger';
    return 'warning';
  };

  const getWellnessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  };

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Schedule Status</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {optimizationResult.isOptimal ? 'Optimal' : 'Needs Attention'}
              </p>
            </div>
            <Badge variant={getOptimizationStatusColor(optimizationResult)}>
              {optimizationResult.conflicts.length} conflicts
            </Badge>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilization</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {optimizationResult.utilizationScore}%
              </p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${optimizationResult.utilizationScore}%` }}
              />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Workload Balance</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {optimizationResult.workloadBalance}%
              </p>
            </div>
            <UsersIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${optimizationResult.workloadBalance}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Conflicts and Recommendations */}
      {optimizationResult.conflicts.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangleIcon className="h-5 w-5 mr-2 text-amber-500" />
            Schedule Conflicts ({optimizationResult.conflicts.length})
          </h3>
          <div className="space-y-3">
            {optimizationResult.conflicts.map((conflict, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                conflict.severity === 'critical' ? 'border-red-500 bg-red-50' :
                conflict.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                conflict.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{conflict.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {conflict.type} | Severity: {conflict.severity}
                    </p>
                  </div>
                  <Badge variant={
                    conflict.severity === 'critical' ? 'danger' :
                    conflict.severity === 'high' ? 'warning' : 'info'
                  }>
                    {conflict.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {optimizationResult.recommendations.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ZapIcon className="h-5 w-5 mr-2 text-blue-500" />
            Optimization Recommendations
          </h3>
          <ul className="space-y-2">
            {optimizationResult.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );

  const renderWellnessTab = () => (
    <div className="space-y-6">
      {/* Wellness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wellnessMetrics.map((staff) => (
          <Card key={staff.staffId} variant="elevated" className="p-4">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {staff.name}
              </h4>
              <GaugeChart
                value={staff.metrics.wellnessScore}
                max={100}
                label="Wellness"
                size={120}
                color={
                  staff.metrics.wellnessScore >= 80 ? '#22c55e' :
                  staff.metrics.wellnessScore >= 60 ? '#f59e0b' : '#ef4444'
                }
              />
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Hours:</span>
                  <span>{staff.metrics.totalHours.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fatigue:</span>
                  <span>{staff.metrics.fatigueScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stress:</span>
                  <span>{staff.metrics.stressLevel}/10</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wellness Alerts */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertTriangleIcon className="h-5 w-5 mr-2 text-amber-500" />
          Wellness Alerts
        </h3>
        <div className="space-y-3">
          {wellnessMetrics.flatMap(staff => 
            staff.metrics.alerts.map((alert, index) => (
              <div key={`${staff.staffId}-${index}`} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {staff.name}: {alert.message}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Recommendation: {alert.recommendation}
                    </p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'}>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))
          )}
          {wellnessMetrics.every(staff => staff.metrics.alerts.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No wellness alerts - all staff members are within healthy limits</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      {/* Procedure Selection */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Scheduling Assistant
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Procedure
            </label>
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a procedure...</option>
              <option value="Review Patient History">Review Patient History</option>
              <option value="Follicle Scan">Follicle Scan</option>
              <option value="Perform OPU">Oocyte Pickup (OPU)</option>
              <option value="Embryo Transfer Procedure">Embryo Transfer</option>
              <option value="hCG Blood Test">hCG Blood Test</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Complexity Level
            </label>
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value as ComplexityLevel)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={ComplexityLevel.Simple}>Simple</option>
              <option value={ComplexityLevel.Standard}>Standard</option>
              <option value={ComplexityLevel.Complex}>Complex</option>
            </select>
          </div>
        </div>

        {/* Duration Information */}
        {selectedProcedure && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Duration Breakdown</h4>
            {(() => {
              const breakdown = ProcessDurationService.getDurationBreakdown(selectedProcedure, selectedComplexity);
              return breakdown ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Base:</span>
                    <span className="ml-1 font-medium">{breakdown.baseDuration}min</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Adjusted:</span>
                    <span className="ml-1 font-medium">{breakdown.adjustedDuration}min</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Buffer:</span>
                    <span className="ml-1 font-medium">{breakdown.bufferBefore + breakdown.bufferAfter}min</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="ml-1 font-medium text-blue-600">{breakdown.totalDuration}min</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </Card>

      {/* Suggested Time Slots */}
      {suggestedSlots.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
            Suggested Time Slots
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedSlots.map((slot, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                onClick={() => onScheduleTask?.({
                  title: selectedProcedure,
                  dueDate: slot.start.toISOString(),
                  durationMinutes: ProcessDurationService.calculateTotalDuration(selectedProcedure, selectedComplexity)
                })}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {slot.reason}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {slot.confidence}%
                  </Badge>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleTask?.({
                      title: selectedProcedure,
                      dueDate: slot.start.toISOString(),
                      durationMinutes: ProcessDurationService.calculateTotalDuration(selectedProcedure, selectedComplexity)
                    });
                  }}
                >
                  Schedule
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Utilization Chart */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resource Utilization Trends
        </h3>
        <LineChart
          data={[
            { label: 'Mon', value: 85 },
            { label: 'Tue', value: 92 },
            { label: 'Wed', value: 78 },
            { label: 'Thu', value: 88 },
            { label: 'Fri', value: 95 },
            { label: 'Sat', value: 72 }
          ]}
          height={200}
          showGrid={true}
          showDots={true}
        />
      </Card>

      {/* Staff Workload Distribution */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Staff Workload Distribution
        </h3>
        <BarChart
          data={wellnessMetrics.map(staff => ({
            label: staff.name.split(' ')[1] || staff.name,
            value: staff.metrics.totalHours,
            color: getWellnessColor(staff.metrics.wellnessScore) === 'success' ? '#22c55e' :
                   getWellnessColor(staff.metrics.wellnessScore) === 'warning' ? '#f59e0b' : '#ef4444'
          }))}
          height={200}
          showValues={true}
        />
      </Card>
    </div>
  );

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Smart Scheduling & Resource Management
        </h2>
        {onOptimizeSchedule && (
          <Button
            onClick={onOptimizeSchedule}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <ZapIcon className="h-4 w-4" />
            <span>Optimize Schedule</span>
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'optimization', label: 'Optimization', icon: ActivityIcon },
          { id: 'wellness', label: 'Staff Wellness', icon: UsersIcon },
          { id: 'scheduling', label: 'Smart Scheduling', icon: CalendarIcon },
          { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon }
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
      {activeTab === 'optimization' && renderOptimizationTab()}
      {activeTab === 'wellness' && renderWellnessTab()}
      {activeTab === 'scheduling' && renderSchedulingTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </Card>
  );
};

export default SmartSchedulingPanel;
