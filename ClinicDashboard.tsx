import React, { useState, useMemo } from 'react';
import { Patient, TaskWithPatientInfo, UserRole, NewPatientOnboardingInfo } from './types';
import { ROLE_ICONS } from './constants';
import { BeakerIcon, SyringeIcon, ClockIcon, WarningIcon, UserPlusIcon } from './components/icons';
import TimelineEvent from './components/TimelineEvent';
import { AddPatientModal } from './components/AddPatientModal';

interface ClinicDashboardProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  currentUserRole: UserRole;
  onAddNewPatient: (patientInfo: NewPatientOnboardingInfo) => void;
}

const RESOURCES = {
    'Staff': [UserRole.Doctor, UserRole.Nurse, UserRole.Embryologist],
    'Facilities': ['OT', 'Lab'],
};

const RESOURCE_ICONS: Record<string, React.FC<{className?:string}>> = {
    ...ROLE_ICONS,
    'OT': SyringeIcon,
    'Lab': BeakerIcon
}

const PATIENT_COLORS = [
    '#3B82F6', // blue-500
    '#14B8A6', // teal-500
    '#6366F1', // indigo-500
    '#EC4899', // pink-500
    '#0EA5E9', // sky-500
    '#F97316', // orange-500
];

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 17;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

const ClinicDashboard: React.FC<ClinicDashboardProps> = ({ patients, onSelectPatient, currentUserRole, onAddNewPatient }) => {
    const today = new Date('2024-07-22T08:00:00Z');
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    
    const { tasksWithConflicts, patientColorMap } = useMemo(() => {
        const allTasks: TaskWithPatientInfo[] = patients.flatMap((p, pIndex) =>
            p.pathway.flatMap(step =>
                step.tasks.map(task => ({
                    ...task,
                    patientId: p.id,
                    patientName: p.name,
                    patientAge: p.age
                }))
            )
        );
        
        const patientColorMap = new Map<string, string>();
        patients.forEach((p, index) => {
            patientColorMap.set(p.id, PATIENT_COLORS[index % PATIENT_COLORS.length]);
        });

        const tasksForSelectedDay = allTasks
            .filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.getFullYear() === selectedDate.getFullYear() &&
                       taskDate.getMonth() === selectedDate.getMonth() &&
                       taskDate.getDate() === selectedDate.getDate();
            })
            .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const tasksWithConflicts = [...tasksForSelectedDay]; 

        for (let i = 0; i < tasksWithConflicts.length; i++) {
            for (let j = i + 1; j < tasksWithConflicts.length; j++) {
                const taskA = tasksWithConflicts[i];
                const taskB = tasksWithConflicts[j];
                
                const startA = new Date(taskA.dueDate).getTime();
                const endA = startA + taskA.durationMinutes * 60000;
                const startB = new Date(taskB.dueDate).getTime();
                const endB = startB + taskB.durationMinutes * 60000;

                const overlap = startA < endB && endA > startB;

                if (overlap) {
                    if (taskA.assignedTo === taskB.assignedTo) {
                        taskA.conflict = { type: 'person', message: `Conflict: ${taskA.assignedTo} is double-booked with task for ${taskB.patientName}.` };
                        taskB.conflict = { type: 'person', message: `Conflict: ${taskB.assignedTo} is double-booked with task for ${taskA.patientName}.` };
                    }
                    if (taskA.resourceRequired && taskA.resourceRequired === taskB.resourceRequired) {
                         taskA.conflict = { type: 'resource', message: `Conflict: Resource '${taskA.resourceRequired}' is double-booked by ${taskB.patientName}.` };
                         taskB.conflict = { type: 'resource', message: `Conflict: Resource '${taskB.resourceRequired}' is double-booked by ${taskA.patientName}.` };
                    }
                }
            }
        }
        
        return { tasksWithConflicts, patientColorMap };
    }, [patients, selectedDate]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        setSelectedDate(new Date(date.getTime() + userTimezoneOffset));
    };
    
    const handleSaveNewPatient = (patientInfo: NewPatientOnboardingInfo) => {
        onAddNewPatient(patientInfo);
        setIsAddPatientModalOpen(false);
    }

    const renderTimeMarkers = () => {
        const markers = [];
        for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour++) {
            const percentage = ((hour - DAY_START_HOUR) / TOTAL_HOURS) * 100;
            markers.push(
                <div key={hour} className="absolute h-full top-0" style={{ left: `${percentage}%` }}>
                    <div className="text-xs -ml-3 mt-1 text-slate-400">{hour}:00</div>
                </div>
            );
        }
        return markers;
    };
    
    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clinic Dashboard</h1>
                <div className="flex items-center space-x-4">
                     <input 
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                     />
                     <button
                        onClick={() => setIsAddPatientModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                     >
                        <UserPlusIcon className="h-5 w-5"/>
                        <span>Add New Patient</span>
                     </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Agenda View */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Agenda for {selectedDate.toLocaleDateString('en-CA')}</h2>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {tasksWithConflicts.map(task => {
                             const AssigneeIcon = ROLE_ICONS[task.assignedTo];
                             return (
                                <button
                                    key={task.id}
                                    onClick={() => onSelectPatient(task.patientId)}
                                    className="w-full text-left p-3 rounded-md bg-slate-50 dark:bg-slate-700/50 border-l-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                    style={{ borderColor: task.conflict ? '#F59E0B' : patientColorMap.get(task.patientId) }}
                                >
                                    <div className="flex items-center justify-between text-sm font-semibold">
                                        <span>{task.title}</span>
                                        {task.conflict && <WarningIcon className="h-5 w-5 text-amber-500" title={task.conflict.message}/>}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{task.patientName}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                                         <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5"/>{formatTime(new Date(task.dueDate))} - {formatTime(new Date(new Date(task.dueDate).getTime() + task.durationMinutes * 60000))}</span>
                                         <span className="flex items-center"><AssigneeIcon className="h-4 w-4 mr-1.5"/>{task.assignedTo}</span>
                                    </div>
                                </button>
                             )
                        })}
                         {tasksWithConflicts.length === 0 && <p className="text-center text-slate-500 py-8">No appointments scheduled for this day.</p>}
                    </div>
                </div>

                {/* Timeline View */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <div className="relative">
                        <div className="h-12 sticky top-16 bg-white dark:bg-slate-800 z-10">
                            <div className="relative h-full ml-32 min-w-[700px]">
                                 {renderTimeMarkers()}
                            </div>
                        </div>

                        <div className="space-y-2 min-w-[700px] mt-2">
                            {Object.entries(RESOURCES).map(([category, resources]) => (
                                 <React.Fragment key={category}>
                                    <h3 className="text-xs font-semibold uppercase text-slate-400 pt-3 pl-2">{category}</h3>
                                    {resources.map(resource => {
                                        const tasksForResource = tasksWithConflicts.filter(task => 
                                            task.assignedTo === resource || task.resourceRequired === resource
                                        );
                                        const Icon = RESOURCE_ICONS[resource];
                                        return (
                                            <div key={resource} className="flex items-center min-h-[50px]">
                                                <div className="w-32 flex-shrink-0 flex items-center pr-2">
                                                    {Icon && <Icon className="h-5 w-5 text-slate-500 mr-2"/>}
                                                    <span className="font-semibold text-sm">{resource}</span>
                                                </div>
                                                <div className="flex-1 h-full bg-slate-100 dark:bg-slate-700/50 rounded-md relative" style={{ backgroundSize: `${100 / TOTAL_HOURS}% 100%`, backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)'}}>
                                                    {tasksForResource.map(task => (
                                                        <TimelineEvent 
                                                            key={task.id} 
                                                            task={task} 
                                                            dayStartHour={DAY_START_HOUR} 
                                                            totalHours={TOTAL_HOURS}
                                                            onClick={() => onSelectPatient(task.patientId)}
                                                            color={patientColorMap.get(task.patientId) || '#64748B'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                 </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
             {isAddPatientModalOpen && (
                <AddPatientModal 
                    onClose={() => setIsAddPatientModalOpen(false)}
                    onSave={handleSaveNewPatient}
                />
             )}
        </div>
    );
};

export default ClinicDashboard;