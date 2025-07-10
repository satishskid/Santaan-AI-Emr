import React, { useState } from 'react';
import { Task, FertilizationData, TaskStatus, Patient, OocyteIdentificationData } from '../../types';
import FormWrapper from './FormWrapper';

interface FertilizationFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patient: Patient;
}

const FertilizationForm: React.FC<FertilizationFormProps> = ({ task, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<FertilizationData>(task.data as FertilizationData || {});

  const oocyteIDTask = patient.pathway
    .flatMap(step => step.tasks)
    .find(t => t.title === 'Identify & Count Oocytes');
    
  const availableOocytes = (oocyteIDTask?.data as OocyteIdentificationData)?.miiCount || 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;

    if(name === 'oocytesInseminated'){
      const numValue = Number(value);
      if (numValue > availableOocytes) {
          finalValue = availableOocytes;
      } else {
          finalValue = numValue;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.method || !formData.oocytesInseminated || formData.oocytesInseminated <= 0;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        
        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Mature (MII) Oocytes Available</h4>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{availableOocytes}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="oocytesInseminated" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of MII Oocytes to Inseminate</label>
                <input
                    type="number"
                    name="oocytesInseminated"
                    id="oocytesInseminated"
                    value={formData.oocytesInseminated || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                    placeholder="0"
                    max={availableOocytes}
                    min="0"
                />
                 {formData.oocytesInseminated > availableOocytes && <p className="text-xs text-red-500 mt-1">Cannot inseminate more oocytes than available.</p>}
            </div>
             <div>
                <label htmlFor="method" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fertilization Method</label>
                <select
                    id="method"
                    name="method"
                    value={formData.method || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                >
                    <option value="">Select Method...</option>
                    <option value="ICSI">ICSI</option>
                    <option value="IVF">Conventional IVF</option>
                </select>
            </div>
        </div>
        
        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea
                name="notes"
                id="notes"
                rows={4}
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., ICSI performed due to male factor. All injections were successful with minimal oocyte trauma. Sperm motility was excellent post-prep."
            />
        </div>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please fill all fields to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default FertilizationForm;