
import React, { useState } from 'react';
import { Task, FertilizationPrepData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface FertilizationPrepFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const FertilizationPrepForm: React.FC<FertilizationPrepFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<FertilizationPrepData>(task.data as FertilizationPrepData || { checklist: { spermVerified: false, dishesPrepared: false, incubatorConfirmed: false }, isComplete: false });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.spermVerified || !formData.checklist?.dishesPrepared || !formData.checklist?.incubatorConfirmed;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This checklist must be completed by the embryologist before beginning the fertilization procedure.
        </p>
        
        <fieldset className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
            <legend className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Pre-Procedure Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="spermVerified" label="Sperm sample prepared and verified" checked={!!formData.checklist?.spermVerified} onChange={handleCheckboxChange} />
                <CheckboxField id="dishesPrepared" label="Culture dishes prepared and labeled" checked={!!formData.checklist?.dishesPrepared} onChange={handleCheckboxChange} />
                <CheckboxField id="incubatorConfirmed" label="Incubator conditions confirmed" checked={!!formData.checklist?.incubatorConfirmed} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please complete all items in the checklist to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default FertilizationPrepForm;
