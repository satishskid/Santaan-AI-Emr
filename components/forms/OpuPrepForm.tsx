
import React, { useState } from 'react';
import { Task, OpuPrepData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface OpuPrepFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const OpuPrepForm: React.FC<OpuPrepFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<OpuPrepData>(task.data as OpuPrepData || { checklist: { patientIdVerified: false, anesthesiaConsentSigned: false, procedureRoomReady: false }, isComplete: false });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.patientIdVerified || !formData.checklist?.anesthesiaConsentSigned || !formData.checklist?.procedureRoomReady;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This checklist must be completed by the assigned nurse before the OPU procedure begins.
        </p>
        
        <fieldset className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
            <legend className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Pre-Procedure Safety Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="patientIdVerified" label="Patient ID confirmed and matches records" checked={!!formData.checklist?.patientIdVerified} onChange={handleCheckboxChange} />
                <CheckboxField id="anesthesiaConsentSigned" label="Anesthesia consent form signed and verified" checked={!!formData.checklist?.anesthesiaConsentSigned} onChange={handleCheckboxChange} />
                <CheckboxField id="procedureRoomReady" label="Procedure room and equipment are ready" checked={!!formData.checklist?.procedureRoomReady} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please complete all items in the safety checklist to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default OpuPrepForm;
