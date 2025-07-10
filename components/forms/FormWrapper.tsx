
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
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} title="Close" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 md:p-6">
        {children}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
        <button onClick={onCancel} className="px-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 text-sm font-semibold">
            Cancel
        </button>
        <button 
            onClick={onSave} 
            disabled={isSaveDisabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed">
            Save Changes
        </button>
      </div>
    </>
  );
};

export default FormWrapper;
