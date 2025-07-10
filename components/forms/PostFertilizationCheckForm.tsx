import React, { useState } from 'react';
import { Task, PostFertilizationCheckData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';

interface PostFertilizationCheckFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const PostFertilizationCheckForm: React.FC<PostFertilizationCheckFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<PostFertilizationCheckData>(task.data as PostFertilizationCheckData || { isComplete: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  }

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = formData.twoPn_count === undefined;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <div>
          <label htmlFor="twoPn_count" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Normally Fertilized Oocytes (2PN)</label>
          <input
              type="number"
              name="twoPn_count"
              id="twoPn_count"
              value={formData.twoPn_count || ''}
              onChange={handleNumberChange}
              className="mt-1 block w-full max-w-xs shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
              placeholder="0"
          />
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
            placeholder="e.g., Pronuclei are clear and well-defined. Also observed 1 oocyte with 1PN and 0 oocytes with 3PN. Two oocytes remain unfertilized."
          />
        </div>

        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please enter the number of 2PN oocytes to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default PostFertilizationCheckForm;