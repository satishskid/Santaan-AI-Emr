import React, { useState, useEffect } from 'react';
import { UserRole, Patient, TaskWithPatientInfo } from '../types';
import { Card, Badge, Button } from './ui/DesignSystem';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ActivityIcon,
  PlayIcon,
  PauseIcon
} from './icons';

interface WorkflowDemoProps {
  currentUserRole: UserRole;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  assignedRole: UserRole;
  prerequisites: string[];
  outputs: string[];
  status: 'pending' | 'active' | 'completed';
  derivedValues: string[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'registration',
    title: 'Patient Registration',
    description: 'Collect patient demographics, insurance, and contact information',
    duration: '30 minutes',
    assignedRole: UserRole.Nurse,
    prerequisites: [],
    outputs: ['Patient ID (P-YYYY-NNNN)', 'Insurance verification', 'Emergency contact'],
    status: 'completed',
    derivedValues: ['Auto-generated Patient ID', 'Insurance eligibility check', 'Communication preferences']
  },
  {
    id: 'consultation',
    title: 'Initial Consultation',
    description: 'Medical history review, physical examination, and treatment planning',
    duration: '60 minutes',
    assignedRole: UserRole.Doctor,
    prerequisites: ['Patient registration complete'],
    outputs: ['Medical history', 'Treatment plan', 'Consent forms'],
    status: 'completed',
    derivedValues: ['Risk assessment score', 'Protocol recommendation', 'Success probability estimate']
  },
  {
    id: 'baseline-testing',
    title: 'Baseline Testing',
    description: 'Laboratory tests and imaging to establish baseline values',
    duration: '2-3 days',
    assignedRole: UserRole.Nurse,
    prerequisites: ['Consultation complete', 'Consent signed'],
    outputs: ['Lab results', 'Ultrasound images', 'Baseline values'],
    status: 'completed',
    derivedValues: ['Reference ranges established', 'Cycle day 3 values', 'Ovarian reserve assessment']
  },
  {
    id: 'protocol-selection',
    title: 'Protocol Selection',
    description: 'Choose optimal stimulation protocol based on patient characteristics',
    duration: '15 minutes',
    assignedRole: UserRole.Doctor,
    prerequisites: ['Baseline testing complete', 'Results reviewed'],
    outputs: ['Selected protocol', 'Medication orders', 'Monitoring schedule'],
    status: 'active',
    derivedValues: ['Personalized medication dosages', 'Monitoring frequency', 'Expected timeline']
  },
  {
    id: 'cycle-start',
    title: 'Cycle Initiation',
    description: 'Begin stimulation medications and establish monitoring schedule',
    duration: '30 minutes',
    assignedRole: UserRole.Nurse,
    prerequisites: ['Protocol selected', 'Medications available'],
    outputs: ['Cycle start date', 'Medication schedule', 'Monitoring appointments'],
    status: 'pending',
    derivedValues: ['Cycle day calculations', 'Appointment scheduling', 'Medication reminders']
  },
  {
    id: 'monitoring',
    title: 'Cycle Monitoring',
    description: 'Regular ultrasounds and blood work to track response',
    duration: '8-12 days',
    assignedRole: UserRole.Doctor,
    prerequisites: ['Cycle started', 'Baseline established'],
    outputs: ['Serial ultrasounds', 'Hormone levels', 'Dose adjustments'],
    status: 'pending',
    derivedValues: ['Growth rate calculations', 'Trigger timing prediction', 'Dose optimization']
  },
  {
    id: 'trigger',
    title: 'Trigger Administration',
    description: 'Final maturation injection when follicles are ready',
    duration: '5 minutes',
    assignedRole: UserRole.Nurse,
    prerequisites: ['Monitoring complete', 'Trigger criteria met'],
    outputs: ['Trigger injection', 'OPU scheduling', 'Final instructions'],
    status: 'pending',
    derivedValues: ['Optimal trigger timing', 'OPU appointment time', 'Maturation prediction']
  },
  {
    id: 'opu',
    title: 'Oocyte Pickup (OPU)',
    description: 'Surgical retrieval of mature oocytes',
    duration: '30-45 minutes',
    assignedRole: UserRole.Doctor,
    prerequisites: ['Trigger given 36 hours prior', 'OR prepared'],
    outputs: ['Retrieved oocytes', 'Procedure notes', 'Recovery instructions'],
    status: 'pending',
    derivedValues: ['Oocyte count prediction', 'Fertilization rate estimate', 'Transfer timeline']
  }
];

const WorkflowDemo: React.FC<WorkflowDemoProps> = ({ currentUserRole }) => {
  const [currentStep, setCurrentStep] = useState(3); // Start at protocol selection
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < WORKFLOW_STEPS.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getStepStatus = (index: number): 'pending' | 'active' | 'completed' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Doctor: return 'text-blue-600';
      case UserRole.Nurse: return 'text-green-600';
      case UserRole.Embryologist: return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IVF Workflow Demonstration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive demonstration of the complete IVF treatment workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? 'secondary' : 'primary'}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'} Demo</span>
          </Button>
          <Button
            onClick={() => setCurrentStep(0)}
            variant="secondary"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Workflow Timeline */}
      <Card variant="elevated" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Treatment Workflow Timeline</h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Workflow Steps */}
          <div className="space-y-6">
            {WORKFLOW_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              const isSelected = selectedStep?.id === step.id;
              
              return (
                <div
                  key={step.id}
                  className={`relative flex items-start cursor-pointer transition-all duration-300 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 -m-4' : ''
                  }`}
                  onClick={() => setSelectedStep(isSelected ? null : step)}
                >
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                    status === 'completed' ? 'bg-green-500 border-green-500' :
                    status === 'active' ? 'bg-yellow-500 border-yellow-500 animate-pulse' :
                    'bg-gray-300 border-gray-300'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    ) : status === 'active' ? (
                      <ActivityIcon className="h-6 w-6 text-white" />
                    ) : (
                      <ClockIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(status)}>
                          {status}
                        </Badge>
                        <Badge variant="info">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {step.duration}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span className={`font-medium ${getRoleColor(step.assignedRole)}`}>
                          {step.assignedRole}
                        </span>
                      </div>
                      
                      {step.prerequisites.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Prerequisites:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {step.prerequisites.length} requirement(s)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Expanded Details */}
                    {isSelected && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Prerequisites</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {step.prerequisites.length > 0 ? step.prerequisites.map((prereq, i) => (
                              <li key={i} className="flex items-start space-x-1">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{prereq}</span>
                              </li>
                            )) : (
                              <li className="text-gray-500">None</li>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Outputs</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {step.outputs.map((output, i) => (
                              <li key={i} className="flex items-start space-x-1">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{output}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Derived Values</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {step.derivedValues.map((value, i) => (
                              <li key={i} className="flex items-start space-x-1">
                                <span className="text-purple-500 mt-1">•</span>
                                <span>{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow to Next Step */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className="absolute left-8 top-16 transform translate-y-4">
                      <ArrowRightIcon className="h-4 w-4 text-gray-400 transform rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Current Step Details */}
      {WORKFLOW_STEPS[currentStep] && (
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Step: {WORKFLOW_STEPS[currentStep].title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Step Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Assigned Role:</span>
                  <span className={`font-medium ${getRoleColor(WORKFLOW_STEPS[currentStep].assignedRole)}`}>
                    {WORKFLOW_STEPS[currentStep].assignedRole}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{WORKFLOW_STEPS[currentStep].duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge variant={getStatusColor(getStepStatus(currentStep))}>
                    {getStepStatus(currentStep)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Derived Values Generated</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {WORKFLOW_STEPS[currentStep].derivedValues.map((value, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {WORKFLOW_STEPS.filter((_, i) => getStepStatus(i) === 'completed').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed Steps</div>
        </Card>
        
        <Card variant="elevated" className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {WORKFLOW_STEPS.filter((_, i) => getStepStatus(i) === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Steps</div>
        </Card>
        
        <Card variant="elevated" className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {WORKFLOW_STEPS.filter((_, i) => getStepStatus(i) === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Steps</div>
        </Card>
        
        <Card variant="elevated" className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((currentStep / WORKFLOW_STEPS.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDemo;
