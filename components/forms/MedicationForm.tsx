
import React, { useState, useMemo } from 'react';
import { Task, MedicationData, TaskStatus, Patient } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { LoadingIcon, AIAssistantIcon } from '../icons';

interface MedicationFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patient: Patient;
}

const COMMON_MEDICATIONS = ['Gonal-F', 'Menopur', 'Follistim', 'Pergoveris'];

const MedicationForm: React.FC<MedicationFormProps> = ({ task, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<MedicationData>(task.data as MedicationData || { medication: '', dosage: '', frequency: '', duration: '' });
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetSuggestion = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const suggestions = await getAIAnalysis(
        'Prescribe Medication',
        { taskData: formData, patient }
      );
      if (suggestions.error) {
        setAiError(suggestions.error);
      } else {
        setFormData(prev => ({ ...prev, ...suggestions }));
      }
    } catch (err) {
      console.error(err);
      setAiError("An unexpected error occurred while fetching AI suggestion.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    onSave({ ...task, data: formData, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = !formData.medication || !formData.dosage || !formData.frequency || !formData.duration;
  
  const medicationOptions = useMemo(() => {
    const options = new Set(COMMON_MEDICATIONS);
    if (formData.medication) {
      options.add(formData.medication);
    }
    return Array.from(options);
  }, [formData.medication]);

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">

        {/* AI Suggestion Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <AIAssistantIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                <span>Clinical Decision Support</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Generate a prescription based on patient history and protocol.</p>
            </div>
            <button
              onClick={handleGetSuggestion}
              disabled={isLoadingAi}
              className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Get AI Suggestion'}
            </button>
          </div>
          {aiError && <p className="text-sm text-red-500 text-center">{aiError}</p>}
          {formData.explanation && (
             <div className="pt-3 border-t border-slate-200 dark:border-slate-700 animate-fade-in-fast">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Rationale</h4>
                <p className="mt-1 text-sm p-3 bg-white dark:bg-slate-700 rounded-md italic">"{formData.explanation}"</p>
            </div>
          )}
        </div>
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label htmlFor="medication" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medication Name</label>
              <select
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                   className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Medication...</option>
                {medicationOptions.map(med => <option key={med} value={med}>{med}</option>)}
              </select>
          </div>
          <div className="md:col-span-1">
             <label htmlFor="dosage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosage</label>
              <input
                  type="text"
                  name="dosage"
                  id="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 225 IU"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
          <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</label>
              <input
                  type="text"
                  name="frequency"
                  id="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  placeholder="e.g., Daily"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
           <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duration</label>
              <input
                  type="text"
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 10 days"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
        </div>
         {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please fill out all fields to save.</p>}
      </div>
       <style>{`
          @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in-fast {
            animation: fade-in-fast 0.5s ease-out forwards;
          }
        `}</style>
    </FormWrapper>
  );
};

export default MedicationForm;
