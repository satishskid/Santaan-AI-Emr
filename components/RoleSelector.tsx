
import React from 'react';
import { UserRole } from '../types';
import { USER_ROLES, ROLE_ICONS } from '../constants';

interface RoleSelectorProps {
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentUserRole, onRoleChange }) => {
  const CurrentRoleIcon = ROLE_ICONS[currentUserRole];

  return (
    <div className="flex items-center space-x-2">
        <label htmlFor="role-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Viewing as:
        </label>
        <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                 <CurrentRoleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
                id="role-select"
                value={currentUserRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="block w-full max-w-xs pl-10 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700"
            >
                {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                    {role}
                    </option>
                ))}
            </select>
        </div>
    </div>
  );
};

export default RoleSelector;
