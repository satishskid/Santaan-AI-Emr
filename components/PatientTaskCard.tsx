
import React from 'react';
import { TaskWithPatientInfo, TaskStatus, UserRole } from '../types';
import { STATUS_COLORS, ROLE_ICONS } from '../constants';

interface PatientTaskCardProps {
  task: TaskWithPatientInfo;
  onClick: () => void;
  currentUserRole: UserRole;
}

const PatientTaskCard: React.FC<PatientTaskCardProps> = ({ task, onClick, currentUserRole }) => {
  const statusColor = STATUS_COLORS[task.status];
  const isOverdue = new Date(task.dueDate) < new Date() && !isSameDay(new Date(task.dueDate), new Date()) && task.status !== TaskStatus.Completed;
  
  const showAssignee = currentUserRole === UserRole.Doctor && task.assignedTo !== UserRole.Doctor;
  const AssigneeIcon = showAssignee ? ROLE_ICONS[task.assignedTo] : null;

  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-slate-700 ${
        isOverdue ? 'ring-2 ring-red-500' : 'ring-1 ring-slate-200 dark:ring-slate-600/50'
      }`}
    >
      <div className="flex items-start justify-between">
         <h5 className={`font-semibold text-sm flex-1 text-slate-800 dark:text-slate-100`}>{task.title}</h5>
         {AssigneeIcon && (
            <div title={`Assigned to ${task.assignedTo}`} className="ml-2 text-slate-500 dark:text-slate-400">
              <AssigneeIcon className="h-4 w-4" />
            </div>
         )}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {task.patientName} (Age {task.patientAge})
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
          {task.status}
        </span>
      </div>
    </div>
  );
};

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}


export default PatientTaskCard;
