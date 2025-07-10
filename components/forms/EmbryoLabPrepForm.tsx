import React, { useState } from 'react';
import { Task, EmbryoLabPrepData, TaskStatus, EmbryoGradingData } from '../../types';
import FormWrapper from './FormWrapper';
import { CheckboxField } from './shared/CheckboxField';

interface EmbryoLabPrepFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patient: any; // Simplified for demo
}

const EmbryoLabPrepForm: React.FC<EmbryoLabPrepFormProps> = ({ task, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<EmbryoLabPrepData>(task.data as EmbryoLabPrepData || { checklist: { warmingProtocolFollowed: false, mediaEquilibrated: false, patientIdMatched: false }, isComplete: false });

  const gradedEmbryosTask = patient.pathway
    .flatMap((step: any) => step.tasks)
    .find((t: Task) => t.title === 'Day 5 Check & Grading');
  const availableEmbryos = (gradedEmbryosTask?.data as EmbryoGradingData)?.embryos || [];


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [name]: checked } }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isComplete: true }, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.checklist?.warmingProtocolFollowed || !formData.checklist?.mediaEquilibrated || !formData.checklist?.patientIdMatched || !formData.embryoIdSelected;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <div>
          <label htmlFor="embryoIdSelected" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Embryo to Prepare</label>
          <select
            id="embryoIdSelected"
            name="embryoIdSelected"
            value={formData.embryoIdSelected || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
          >
            <option value="">Select Embryo...</option>
            {availableEmbryos
                .filter((emb: any) => emb.grade && emb.pgtStatus !== 'Aneuploid')
                .map((emb: any) => (
                    <option key={emb.id} value={emb.id}>
                        {`Embryo #${emb.id.split('-')[1]} (Grade: ${emb.grade}, PGT: ${emb.pgtStatus || 'N/A'})`}
                    </option>
            ))}
          </select>
           {availableEmbryos.length === 0 && <p className="text-xs text-slate-500 mt-1">No graded embryos found from Day 5 Check. Please complete that task first.</p>}
        </div>
        
         <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea
                name="notes"
                id="notes"
                rows={2}
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"
                placeholder="e.g., Embryo survived warming with 100% blastomere survival. Good re-expansion noted after 2 hours."
            />
        </div>

        <fieldset className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
            <legend className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Critical Safety Checklist</legend>
            <div className="space-y-3">
                <CheckboxField id="warmingProtocolFollowed" label="Warming protocol followed correctly" checked={!!formData.checklist?.warmingProtocolFollowed} onChange={handleCheckboxChange} />
                <CheckboxField id="mediaEquilibrated" label="Warming media equilibrated" checked={!!formData.checklist?.mediaEquilibrated} onChange={handleCheckboxChange} />
                <CheckboxField id="patientIdMatched" label="Patient ID on dish matches transfer paperwork" checked={!!formData.checklist?.patientIdMatched} onChange={handleCheckboxChange} />
            </div>
        </fieldset>
        
        {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please select an embryo and complete the safety checklist to save.</p>}
      </div>
    </FormWrapper>
  );
};

export default EmbryoLabPrepForm;