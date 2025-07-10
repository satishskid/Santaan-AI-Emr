
import React from 'react';
import { Task, TaskStatus, UserRole } from '../types';
import { STATUS_COLORS, ROLE_ICONS } from '../constants';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isExpanded?: boolean;
  currentUserRole: UserRole;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isExpanded = false, currentUserRole }) => {
  const statusColor = STATUS_COLORS[task.status];
  const isCompleted = task.status === TaskStatus.Completed;
  // Show assignee icon if the current user is a Doctor and the task isn't assigned to the doctor.
  const showAssignee = currentUserRole === UserRole.Doctor && task.assignedTo !== UserRole.Doctor;
  const AssigneeIcon = showAssignee ? ROLE_ICONS[task.assignedTo] : null;

  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 ${
        isCompleted ? 'bg-white/70 dark:bg-slate-800/60 opacity-80' : 'bg-white dark:bg-slate-700'
      } ${
        isExpanded ? 'ring-2 ring-blue-500 shadow-lg' : 'ring-1 ring-slate-200 dark:ring-slate-600/50'
      }`}
    >
      <div className="flex items-start justify-between">
         <h5 className={`font-semibold text-sm flex-1 ${isCompleted ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>{task.title}</h5>
         {AssigneeIcon && (
            <div title={`Assigned to ${task.assignedTo}`} className="ml-2 text-slate-500 dark:text-slate-400">
              <AssigneeIcon className="h-4 w-4" />
            </div>
         )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
