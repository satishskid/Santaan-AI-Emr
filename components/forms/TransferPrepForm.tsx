
import React, { useState } from 'react';
import { Task, TransferPrepData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface TransferPrepFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TransferPrepForm: React.FC<TransferPrepFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<TransferPrepData>(task.data as TransferPrepData || { checklist: { patientReady: false, bladderProtocolFollowed: false, consentVerified: false }, isComplete: false });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.patientReady || !formData.checklist?.bladderProtocolFollowed || !formData.checklist?.consentVerified;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This checklist must be completed by the nursing staff before the doctor begins the embryo transfer procedure.
        </p>
        
        <fieldset className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
            <legend className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Pre-Transfer Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="patientReady" label="Patient has arrived and is confirmed ready" checked={!!formData.checklist?.patientReady} onChange={handleCheckboxChange} />
                <CheckboxField id="bladderProtocolFollowed" label="Full bladder protocol confirmed (if applicable)" checked={!!formData.checklist?.bladderProtocolFollowed} onChange={handleCheckboxChange} />
                <CheckboxField id="consentVerified" label="Consent for embryo transfer has been verified" checked={!!formData.checklist?.consentVerified} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please complete all items in the checklist to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default TransferPrepForm;
