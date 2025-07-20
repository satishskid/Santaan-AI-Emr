
import React from 'react';
import { CloseIcon } from '../icons';

interface FormWrapperProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  isSaveDisabled?: boolean;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ title, onClose, onSave, onCancel, children, isSaveDisabled = false }) => {
  return (
    <>
      {/* Enhanced Header with Better Visual Hierarchy */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <button
          onClick={onClose}
          title="Close"
          className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white p-2 rounded-lg hover:bg-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Enhanced Content Area with Better Spacing */}
      <div className="p-8 bg-white dark:bg-slate-800">
        {children}
      </div>

      {/* Enhanced Action Bar with Stress-Reducing Colors */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-500 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-24"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaveDisabled}
          className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 text-base font-medium disabled:bg-cyan-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-32 shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </>
  );
};

export default FormWrapper;
