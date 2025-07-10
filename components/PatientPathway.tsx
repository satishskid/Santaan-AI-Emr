
import React, { useState } from 'react';
import { Patient, PatientPathwayStep, Task, UserRole } from '../types';
import TaskCard from './TaskCard';
import InlineTaskDetail from './InlineTaskDetail';
import { 
    ClipboardListIcon, 
    BeakerIcon, 
    SyringeIcon, 
    TestTubeIcon, 
    MicroscopeIcon, 
    MoveRightIcon, 
    HeartPulseIcon, 
    CalendarDaysIcon,
    CircleCheckIcon, 
    CircleDotIcon, 
    CircleIcon
} from './icons';

interface PatientPathwayProps {
  patient: Patient;
  onUpdate: (updatedTask: Task, stepId: string, patientId: string) => void;
  currentUserRole: UserRole;
}

const stepIconMap: Record<string, React.ReactNode> = {
    'Initial Consultation': <ClipboardListIcon className="h-6 w-6" />,
    'Ovarian Stimulation': <BeakerIcon className="h-6 w-6" />,
    'Egg Retrieval': <SyringeIcon className="h-6 w-6" />,
    'Fertilization': <TestTubeIcon className="h-6 w-6" />,
    'Embryo Culture': <MicroscopeIcon className="h-6 w-6" />,
    'Embryo Transfer': <MoveRightIcon className="h-6 w-6" />,
    'Pregnancy Test': <HeartPulseIcon className="h-6 w-6" />,
};

const TimelineStatusIcon: React.FC<{status: PatientPathwayStep['stepStatus']}> = ({status}) => {
    switch (status) {
        case 'completed': return <CircleCheckIcon className="h-5 w-5 text-green-500" />;
        case 'active': return <CircleDotIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
        case 'upcoming': return <CircleIcon className="h-5 w-5 text-slate-400" />;
        default: return null;
    }
}


const PatientPathway: React.FC<PatientPathwayProps> = ({ patient, onUpdate, currentUserRole }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
  };

  const handleSaveTask = (updatedTask: Task, stepId: string) => {
    onUpdate(updatedTask, stepId, patient.id);
    setExpandedTaskId(null); // Collapse after saving
  };
  
  const formatDate = (dateString?: string) => {
      if (!dateString) return 'TBD';
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Patient Pathway: <span className="text-blue-600 dark:text-blue-400">{patient.name}</span> ({patient.age})
        </h1>
        {patient.pathway.map((step, index) => {
            const tasksForRole = currentUserRole === UserRole.Doctor 
                ? step.tasks 
                : step.tasks.filter(task => task.assignedTo === currentUserRole);

            return (
                <div key={step.stepId} className="relative pl-14 pb-12">
                    {/* Vertical Line */}
                    {index !== patient.pathway.length-1 && <div className="absolute left-6 top-5 -ml-px mt-1 w-0.5 h-full bg-slate-300 dark:bg-slate-700" />}

                    {/* Step Header */}
                    <div className="relative flex items-start gap-4">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`flex items-center justify-center h-12 w-12 rounded-full ${step.stepStatus === 'active' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-200 dark:bg-slate-800' } text-slate-600 dark:text-slate-300`}>
                                {stepIconMap[step.stepName] || <ClipboardListIcon className="h-6 w-6" />}
                            </div>
                        </div>
                        <div className="pt-2">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{step.stepName}</h3>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <TimelineStatusIcon status={step.stepStatus} />
                                <CalendarDaysIcon className="h-4 w-4 ml-3 mr-1.5" />
                                <span>{formatDate(step.startDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tasks for this step */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tasksForRole.length > 0 ? (
                            tasksForRole.map(task => (
                                <React.Fragment key={task.id}>
                                    <div className={expandedTaskId === task.id ? 'lg:col-span-1 md:col-span-1 col-span-1' : 'col-span-1'}>
                                        <TaskCard
                                            task={task}
                                            onClick={() => handleTaskClick(task.id)}
                                            isExpanded={expandedTaskId === task.id}
                                            currentUserRole={currentUserRole}
                                        />
                                    </div>
                                    {expandedTaskId === task.id && (
                                       <div className="col-span-full mt-2">
                                            <InlineTaskDetail
                                                task={task}
                                                onSave={(updatedTask) => handleSaveTask(updatedTask, step.stepId)}
                                                onClose={() => handleTaskClick(task.id)}
                                                currentUserRole={currentUserRole}
                                                patient={patient}
                                            />
                                       </div>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="col-span-full text-sm text-slate-500 italic py-4">
                                No tasks for your role in this step.
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
    </div>
  );
};

export default PatientPathway;
