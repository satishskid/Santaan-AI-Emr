
import React, { useState } from 'react';
import { Task, TransferPostCareData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface TransferPostCareFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TransferPostCareForm: React.FC<TransferPostCareFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<TransferPostCareData>(task.data as TransferPostCareData || { checklist: { patientRested: false, postProcedureInstructionsGiven: false }, isComplete: false });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.patientRested || !formData.checklist?.postProcedureInstructionsGiven;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Confirm post-transfer care for the patient.
        </p>

        <fieldset className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <legend className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-2">Post-Transfer Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="patientRested" label="Patient has rested for the recommended duration" checked={!!formData.checklist?.patientRested} onChange={handleCheckboxChange} />
                <CheckboxField id="postProcedureInstructionsGiven" label="Post-procedure instructions and medication plan provided" checked={!!formData.checklist?.postProcedureInstructionsGiven} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please complete all items to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default TransferPostCareForm;
