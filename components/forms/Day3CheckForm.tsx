import React, { useMemo } from 'react';
import { Task, Day3CheckData, TaskStatus, Patient, PostFertilizationCheckData } from '../../types';
import FormWrapper from './FormWrapper';

interface Day3CheckFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patient: Patient;
}


const Day3CheckForm: React.FC<Day3CheckFormProps> = ({ task, onClose, onSave, patient }) => {
  const fertilizedTask = patient.pathway
    .flatMap(step => step.tasks)
    .find(t => t.title === 'Post-Fertilization Check (Day 1)');
  
  const fertilizedCount = (fertilizedTask?.data as PostFertilizationCheckData)?.twoPn_count || 0;

  const initialEmbryoData = useMemo(() => {
    return Array.from({ length: fertilizedCount }, (_, i) => ({
      id: `emb-${i + 1}`,
      cellNumber: undefined,
      fragmentation: 'None' as const,
    }));
  }, [fertilizedCount]);

  const [formData, setFormData] = React.useState<Day3CheckData>(
    (task.data as Day3CheckData)?.embryos?.length > 0 
      ? task.data as Day3CheckData
      : { embryos: initialEmbryoData }
  );
  
  const handleEmbryoChange = (id: string, field: 'cellNumber' | 'fragmentation', value: string | number | undefined) => {
    setFormData(prev => ({
        ...prev,
        embryos: prev.embryos?.map(emb => 
            emb.id === id ? { ...emb, [field]: value } : emb
        )
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = formData.embryos?.some(e => e.cellNumber === undefined);

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
            Log the cell number and fragmentation for each embryo from the cohort.
        </p>
        <div className="max-h-96 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4">
            {formData.embryos?.map(embryo => (
                <div key={embryo.id} className="grid grid-cols-3 gap-4 items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="col-span-1 font-semibold text-slate-800 dark:text-slate-100">
                        Embryo #{embryo.id.split('-')[1]}
                    </div>
                    <div className="col-span-1">
                         <label htmlFor={`cellNumber-${embryo.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">Cell #</label>
                        <input
                            type="number"
                            id={`cellNumber-${embryo.id}`}
                            value={embryo.cellNumber || ''}
                            onChange={(e) => handleEmbryoChange(embryo.id, 'cellNumber', e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                            placeholder="e.g., 8"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor={`fragmentation-${embryo.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">Frag %</label>
                        <select
                            id={`fragmentation-${embryo.id}`}
                            value={embryo.fragmentation}
                            onChange={(e) => handleEmbryoChange(embryo.id, 'fragmentation', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                        >
                            <option>None</option>
                            <option>{'<10%'}</option>
                            <option>{'10-25%'}</option>
                            <option>{'>25%'}</option>
                        </select>
                    </div>
                </div>
            ))}
            {fertilizedCount === 0 && <p className="text-center text-slate-500 py-4">No fertilized embryos from Day 1 check to assess.</p>}
            </div>
        </div>

         <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Overall Notes</label>
            <textarea
                name="notes"
                id="notes"
                rows={2}
                value={formData.notes || ''}
                onChange={handleNotesChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., Good cohort synchronicity, most embryos at 8-cell stage with minimal fragmentation. One embryo arrested at 4-cell stage."
            />
        </div>

        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please enter a cell number for all embryos to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default Day3CheckForm;