
import React, { useState } from 'react';
import { Task } from '../../types';
import FormWrapper from './FormWrapper';

interface DefaultFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const DefaultForm: React.FC<DefaultFormProps> = ({ task, onClose, onSave }) => {
  const [data, setData] = useState(JSON.stringify(task.data, null, 2));

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(data);
      onSave({ ...task, data: parsedData });
    } catch (e) {
      alert('Invalid JSON format.');
    }
  };

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
        <div>
          <label htmlFor={`data-json-${task.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Task Data (JSON)
          </label>
          <textarea
            id={`data-json-${task.id}`}
            rows={10}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default DefaultForm;
