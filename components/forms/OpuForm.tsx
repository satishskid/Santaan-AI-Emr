import React, { useState } from 'react';
import { Task, OpuData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';

interface OpuFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const NumberInput: React.FC<{
    name: keyof OpuData;
    label: string;
    value: number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, label, value, onChange }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            type="number"
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
            placeholder="0"
            min="0"
        />
    </div>
);


const OpuForm: React.FC<OpuFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<OpuData>(task.data as OpuData || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? (value === '' ? undefined : Number(value)) : value }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">Log the details of the Oocyte Pick-Up procedure after completing the pre-op safety checklist.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput name="folliclesAspiratedRight" label="Follicles Aspirated (Right Ovary)" value={formData.folliclesAspiratedRight} onChange={handleChange} />
            <NumberInput name="folliclesAspiratedLeft" label="Follicles Aspirated (Left Ovary)" value={formData.folliclesAspiratedLeft} onChange={handleChange} />
        </div>
        
        <div>
            <label htmlFor="procedureNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedure Notes</label>
            <textarea
                name="procedureNotes"
                id="procedureNotes"
                rows={4}
                value={formData.procedureNotes || ''}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., Procedure was straightforward. Both ovaries were easily accessible. Minimal bleeding noted. Patient tolerated procedure well under sedation."
            />
        </div>
      </div>
    </FormWrapper>
  );
};

export default OpuForm;