import React, { useState, useEffect } from 'react';
import { Task, OocyteIdentificationData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';

interface OocyteIdentificationFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const NumberInput: React.FC<{
    name: keyof OocyteIdentificationData;
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


const OocyteIdentificationForm: React.FC<OocyteIdentificationFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<OocyteIdentificationData>(task.data as OocyteIdentificationData || {});
  
  useEffect(() => {
    const { miiCount = 0, miCount = 0, gvCount = 0, degenerateCount = 0 } = formData;
    const total = miiCount + miCount + gvCount + degenerateCount;
    if (formData.totalRetrieved !== total) {
        setFormData(prev => ({...prev, totalRetrieved: total}));
    }
  }, [formData.miiCount, formData.miCount, formData.gvCount, formData.degenerateCount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? (value === '' ? undefined : Number(value)) : value }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isVerified: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = (formData.totalRetrieved || 0) <= 0;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumberInput name="miiCount" label="MII (Mature)" value={formData.miiCount} onChange={handleChange} />
            <NumberInput name="miCount" label="MI" value={formData.miCount} onChange={handleChange} />
            <NumberInput name="gvCount" label="GV" value={formData.gvCount} onChange={handleChange} />
            <NumberInput name="degenerateCount" label="Degenerate" value={formData.degenerateCount} onChange={handleChange} />
        </div>

        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Oocytes Retrieved</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{formData.totalRetrieved || 0}</p>
        </div>

        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea
                name="notes"
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., Cumulus cells appear healthy and expansive. Follicular fluid was clear. Some oocytes show minor cytoplasmic abnormalities."
            />
        </div>
      </div>
    </FormWrapper>
  );
};

export default OocyteIdentificationForm;