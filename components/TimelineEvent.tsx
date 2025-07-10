
import React, { useState } from 'react';
import { TaskWithPatientInfo } from '../types';
import { WarningIcon } from './icons';

interface TimelineEventProps {
    task: TaskWithPatientInfo;
    dayStartHour: number;
    totalHours: number;
    onClick: () => void;
    color: string;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ task, dayStartHour, totalHours, onClick, color }) => {
    const [isTooltipVisible, setTooltipVisible] = useState(false);

    const taskStart = new Date(task.dueDate);
    const startMinutes = taskStart.getHours() * 60 + taskStart.getMinutes();
    const dayStartMinutes = dayStartHour * 60;
    
    const minutesFromDayStart = startMinutes - dayStartMinutes;
    const totalDayMinutes = totalHours * 60;

    const left = (minutesFromDayStart / totalDayMinutes) * 100;
    const width = (task.durationMinutes / totalDayMinutes) * 100;

    if (left < 0 || left > 100) return null; // Don't render events outside the timeline view

    const bgColor = task.conflict 
        ? '#F59E0B' // amber-500
        : color;

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <div 
            className="absolute h-full p-0.5 cursor-pointer" 
            style={{ left: `${left}%`, width: `${width}%` }}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onClick={onClick}
        >
            <div 
                className={`relative w-full h-full rounded text-white px-2 py-1 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-all border border-black/10`}
                style={{ backgroundColor: bgColor }}
            >
                <p className="text-xs font-bold truncate">{task.title}</p>
                 {task.conflict && <WarningIcon className="absolute top-1 right-1 h-4 w-4 text-white"/>}
            </div>

            {isTooltipVisible && (
                <div className="absolute z-20 -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-64 bg-slate-800 text-white text-sm rounded-lg shadow-xl p-3 pointer-events-none transition-opacity duration-200">
                    <h4 className="font-bold border-b border-slate-600 pb-1 mb-2">{task.title}</h4>
                    <p><strong>Patient:</strong> {task.patientName} ({task.patientAge})</p>
                    <p><strong>Time:</strong> {formatTime(taskStart)} - {formatTime(new Date(taskStart.getTime() + task.durationMinutes * 60000))}</p>
                    <p><strong>Assigned To:</strong> {task.assignedTo}</p>
                    {task.resourceRequired && <p><strong>Resource:</strong> {task.resourceRequired}</p>}
                    {task.conflict && (
                        <div className="mt-2 pt-2 border-t border-slate-600 text-amber-300">
                             <p className="font-bold flex items-center"><WarningIcon className="h-4 w-4 mr-1.5"/>Conflict Detected</p>
                             <p className="text-xs italic">{task.conflict.message}</p>
                        </div>
                    )}
                     <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-800 -mb-2" />
                </div>
            )}
        </div>
    );
};

export default TimelineEvent;
