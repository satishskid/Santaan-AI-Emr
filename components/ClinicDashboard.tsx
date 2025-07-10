
import React, { useState, useMemo } from 'react';
import { Patient, TaskWithPatientInfo, UserRole, NewPatientOnboardingInfo } from '../types';
import { ROLE_ICONS } from '../constants';
import { BeakerIcon, SyringeIcon, ClockIcon, WarningIcon, UserPlusIcon, CalendarIcon, FilterIcon, SearchIcon, TrendingUpIcon, DatabaseIcon } from './icons';
import TimelineEvent from './TimelineEvent';
import { AddPatientModal } from './AddPatientModal';
import { Card, Badge, Button } from './ui/DesignSystem';
import DataQualityIndicator from './DataQualityIndicator';
import WelcomeBanner from './WelcomeBanner';
import SmartSchedulingPanel from './SmartSchedulingPanel';
import ResourceOptimization from './ResourceOptimization';
import DataTypes from './DataTypes';

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

// Task Card Component
const TaskCard: React.FC<{
    task: TaskWithPatientInfo;
    patientColorMap: Map<string, string>;
    onSelectPatient: (patientId: string) => void;
}> = ({ task, patientColorMap, onSelectPatient }) => {
    const AssigneeIcon = ROLE_ICONS[task.assignedTo];
    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

    return (
        <div
            onClick={() => onSelectPatient(task.patientId)}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md"
            style={{ borderLeftColor: patientColorMap.get(task.patientId), borderLeftWidth: '4px' }}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.title}
                </h4>
                {task.conflict && (
                    <WarningIcon className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
                )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {task.patientName}
            </p>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatTime(new Date(task.dueDate))}
                </span>
                <span className="flex items-center text-gray-500">
                    <AssigneeIcon className="h-3 w-3 mr-1" />
                    {task.assignedTo}
                </span>
            </div>
        </div>
    );
};

const ClinicDashboard: React.FC<ClinicDashboardProps> = ({ patients, onSelectPatient, currentUserRole, onAddNewPatient }) => {
    const today = new Date('2024-07-22T08:00:00Z');
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'timeline' | 'workflow' | 'priority' | 'optimization'>('workflow');
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'resource_optimization' | 'data_types'>('dashboard');
    
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

    // Filter and search logic
    const filteredTasks = useMemo(() => {
        let filtered = tasksWithConflicts;

        if (filterRole !== 'all') {
            filtered = filtered.filter(task => task.assignedTo === filterRole);
        }

        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.patientName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [tasksWithConflicts, filterRole, searchQuery]);

    // Group tasks by workflow stage
    const workflowGroups = useMemo(() => {
        const groups = {
            'Consultation': filteredTasks.filter(t => t.title.includes('History') || t.title.includes('Consultation')),
            'Stimulation': filteredTasks.filter(t => t.title.includes('Medication') || t.title.includes('Scan')),
            'Retrieval': filteredTasks.filter(t => t.title.includes('OPU') || t.title.includes('Oocytes')),
            'Laboratory': filteredTasks.filter(t => t.title.includes('Fertilization') || t.title.includes('Check') || t.title.includes('Grading')),
            'Transfer': filteredTasks.filter(t => t.title.includes('Transfer')),
            'Follow-up': filteredTasks.filter(t => t.title.includes('Test') || t.title.includes('Monitoring'))
        };
        return groups;
    }, [filteredTasks]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Welcome Banner */}
            <WelcomeBanner currentRole={currentUserRole} />

            {/* Modern Header with Controls */}
            <Card variant="elevated" className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinic Operations</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <DataQualityIndicator patients={patients} showDetails={false} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks or patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={handleDateChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value={UserRole.Doctor}>Doctor</option>
                            <option value={UserRole.Nurse}>Nurse</option>
                            <option value={UserRole.Embryologist}>Embryologist</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {(['workflow', 'timeline', 'priority', 'optimization'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === mode
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Add Patient Button */}
                        <Button
                            onClick={() => setIsAddPatientModalOpen(true)}
                            variant="primary"
                            className="flex items-center space-x-2"
                        >
                            <UserPlusIcon className="h-4 w-4" />
                            <span>Add Patient</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: CalendarIcon },
                        { id: 'resource_optimization', label: 'Resource Optimization', icon: TrendingUpIcon },
                        { id: 'data_types', label: 'Data Types', icon: DatabaseIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
                <>
            {/* Dynamic Content Based on View Mode */}
            {viewMode === 'workflow' && (
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    {Object.entries(workflowGroups).map(([stage, tasks]) => (
                        <Card key={stage} variant="elevated" className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{stage}</h3>
                                <Badge variant={tasks.length > 0 ? 'info' : 'default'}>
                                    {tasks.length}
                                </Badge>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {tasks.map(task => {
                                    const AssigneeIcon = ROLE_ICONS[task.assignedTo];
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => onSelectPatient(task.patientId)}
                                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md"
                                            style={{ borderLeftColor: patientColorMap.get(task.patientId), borderLeftWidth: '4px' }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                                    {task.title}
                                                </h4>
                                                {task.conflict && (
                                                    <WarningIcon className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {task.patientName}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="flex items-center text-gray-500">
                                                    <ClockIcon className="h-3 w-3 mr-1" />
                                                    {formatTime(new Date(task.dueDate))}
                                                </span>
                                                <span className="flex items-center text-gray-500">
                                                    <AssigneeIcon className="h-3 w-3 mr-1" />
                                                    {task.assignedTo}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {tasks.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No tasks in this stage</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {viewMode === 'timeline' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Agenda View */}
                    <Card variant="elevated" className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Today's Schedule
                        </h2>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {filteredTasks.map(task => {
                                const AssigneeIcon = ROLE_ICONS[task.assignedTo];
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => onSelectPatient(task.patientId)}
                                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all"
                                        style={{ borderLeftColor: task.conflict ? '#F59E0B' : patientColorMap.get(task.patientId), borderLeftWidth: '4px' }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {task.title}
                                            </span>
                                            {task.conflict && (
                                                <WarningIcon className="h-4 w-4 text-amber-500" title={task.conflict.message} />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {task.patientName}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                {formatTime(new Date(task.dueDate))} - {formatTime(new Date(new Date(task.dueDate).getTime() + task.durationMinutes * 60000))}
                                            </span>
                                            <span className="flex items-center">
                                                <AssigneeIcon className="h-3 w-3 mr-1" />
                                                {task.assignedTo}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredTasks.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">No appointments scheduled</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Timeline View */}
                    <Card variant="elevated" className="lg:col-span-3 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Resource Timeline
                        </h2>
                        <div className="relative">
                            <div className="h-12 sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative h-full ml-32 min-w-[700px]">
                                    {renderTimeMarkers()}
                                </div>
                            </div>

                            <div className="space-y-2 min-w-[700px] mt-4">
                                {Object.entries(RESOURCES).map(([category, resources]) => (
                                    <React.Fragment key={category}>
                                        <h3 className="text-xs font-semibold uppercase text-gray-400 pt-3 pl-2">
                                            {category}
                                        </h3>
                                        {resources.map(resource => {
                                            const tasksForResource = filteredTasks.filter(task =>
                                                task.assignedTo === resource || task.resourceRequired === resource
                                            );
                                            const Icon = RESOURCE_ICONS[resource];
                                            return (
                                                <div key={resource} className="flex items-center min-h-[50px]">
                                                    <div className="w-32 flex-shrink-0 flex items-center pr-4">
                                                        {Icon && <Icon className="h-4 w-4 text-gray-500 mr-2" />}
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {resource}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 rounded-md relative"
                                                         style={{
                                                             backgroundSize: `${100 / TOTAL_HOURS}% 100%`,
                                                             backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)'
                                                         }}>
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
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {viewMode === 'priority' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* High Priority */}
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">High Priority</h3>
                        </div>
                        <div className="space-y-3">
                            {filteredTasks.filter(t => t.conflict || t.title.includes('OPU') || t.title.includes('Transfer')).map(task => (
                                <TaskCard key={task.id} task={task} patientColorMap={patientColorMap} onSelectPatient={onSelectPatient} />
                            ))}
                        </div>
                    </Card>

                    {/* Medium Priority */}
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Medium Priority</h3>
                        </div>
                        <div className="space-y-3">
                            {filteredTasks.filter(t => !t.conflict && (t.title.includes('Scan') || t.title.includes('Check'))).map(task => (
                                <TaskCard key={task.id} task={task} patientColorMap={patientColorMap} onSelectPatient={onSelectPatient} />
                            ))}
                        </div>
                    </Card>

                    {/* Low Priority */}
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Low Priority</h3>
                        </div>
                        <div className="space-y-3">
                            {filteredTasks.filter(t => !t.conflict && t.title.includes('History')).map(task => (
                                <TaskCard key={task.id} task={task} patientColorMap={patientColorMap} onSelectPatient={onSelectPatient} />
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {viewMode === 'optimization' && (
                <SmartSchedulingPanel
                    tasks={filteredTasks}
                    patients={patients}
                    selectedDate={selectedDate}
                    currentUserRole={currentUserRole}
                    onScheduleTask={(task) => {
                        // Handle new task scheduling
                        console.log('Schedule new task:', task);
                    }}
                    onOptimizeSchedule={() => {
                        // Handle schedule optimization
                        console.log('Optimize schedule');
                    }}
                />
            )}
                </>
            )}

            {/* Resource Optimization Tab */}
            {activeTab === 'resource_optimization' && (
                <ResourceOptimization currentUserRole={currentUserRole} />
            )}

            {/* Data Types Tab */}
            {activeTab === 'data_types' && (
                <DataTypes currentUserRole={currentUserRole} />
            )}

            {/* Add Patient Modal */}
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
