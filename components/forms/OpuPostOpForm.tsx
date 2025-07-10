
import React, { useState } from 'react';
import { Task, OpuPostOpData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface OpuPostOpFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const OpuPostOpForm: React.FC<OpuPostOpFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<OpuPostOpData>(task.data as OpuPostOpData || { checklist: { patientStable: false, postOpInstructionsGiven: false, followUpScheduled: false }, isComplete: false });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.patientStable || !formData.checklist?.postOpInstructionsGiven || !formData.checklist?.followUpScheduled;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
         <p className="text-sm text-slate-600 dark:text-slate-400">
          Confirm post-operative recovery status and care for the patient.
        </p>

        <fieldset className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <legend className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-2">Post-Operative Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="patientStable" label="Patient is stable and vital signs are normal" checked={!!formData.checklist?.patientStable} onChange={handleCheckboxChange} />
                <CheckboxField id="postOpInstructionsGiven" label="Post-operative instructions provided to patient" checked={!!formData.checklist?.postOpInstructionsGiven} onChange={handleCheckboxChange} />
                <CheckboxField id="followUpScheduled" label="Follow-up communication/appointment scheduled" checked={!!formData.checklist?.followUpScheduled} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please complete all items to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default OpuPostOpForm;
