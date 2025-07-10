import React, { useState } from 'react';
import { Task, EmbryoTransferData, TaskStatus, EmbryoLabPrepData } from '../../types';
import FormWrapper from './FormWrapper';

interface EmbryoTransferFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patient: any; 
}

const EmbryoTransferForm: React.FC<EmbryoTransferFormProps> = ({ task, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<EmbryoTransferData>(task.data as EmbryoTransferData || {});
  
  const preparedEmbryoTask = patient.pathway
    .flatMap((step: any) => step.tasks)
    .find((t: Task) => t.title === 'Embryo Lab Preparation');
    
  const preparedEmbryoData = preparedEmbryoTask?.data as EmbryoLabPrepData | undefined;
  const preparedEmbryoId = preparedEmbryoData?.embryoIdSelected;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? (value === '' ? undefined : Number(value)) : value }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !preparedEmbryoId || !formData.embryosTransferredCount;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        
        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Embryo for Transfer</h4>
            {preparedEmbryoId ? (
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{`ID: ${preparedEmbryoId}`}</p>
            ): (
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">Embryo has not been prepared yet. Please complete the 'Embryo Lab Preparation' task first.</p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                <label htmlFor="embryosTransferredCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300"># Embryos Transferred</label>
                <input
                    type="number"
                    name="embryosTransferredCount"
                    id="embryosTransferredCount"
                    value={formData.embryosTransferredCount || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                    placeholder="1"
                    min="1"
                />
            </div>
             <div>
                <label htmlFor="catheterType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catheter Type</label>
                <select id="catheterType" name="catheterType" value={formData.catheterType || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                    <option value="">Select...</option>
                    <option>Soft</option>
                    <option>Firm</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="transferDifficulty" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Transfer Difficulty</label>
                <select id="transferDifficulty" name="transferDifficulty" value={formData.transferDifficulty || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                    <option value="">Select...</option>
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Difficult</option>
                </select>
            </div>
        </div>
        
        <div>
            <label htmlFor="procedureNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedure Notes</label>
            <textarea
                name="procedureNotes"
                id="procedureNotes"
                rows={3}
                value={formData.procedureNotes || ''}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., Transfer performed under ultrasound guidance. No blood on catheter tip. Patient comfortable throughout."
            />
        </div>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please ensure an embryo is prepared and number transferred is logged.</p>}
      </div>
    </FormWrapper>
  );
};

export default EmbryoTransferForm;