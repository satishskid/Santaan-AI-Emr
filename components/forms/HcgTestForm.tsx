
import React, { useState } from 'react';
import { Task, HcgData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { AIAssistantIcon, LoadingIcon } from '../icons';

interface HcgTestFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const HcgTestForm: React.FC<HcgTestFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<HcgData>(task.data as HcgData || {});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGetInterpretation = async () => {
    if (formData.hcgValue === undefined) return;
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const result = await getAIAnalysis('hCG Blood Test', { taskData: formData });
      if (result.error) {
        setAiError(result.error);
      } else {
        setFormData(prev => ({ ...prev, interpretation: result.interpretation }));
      }
    } catch (err) {
      setAiError("Failed to get AI interpretation.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    onSave({ ...task, data: formData, status: TaskStatus.Completed });
  };
  
  const isSaveDisabled = formData.hcgValue === undefined;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-4 space-y-6">
        <div>
          <label htmlFor="hcgValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Beta-hCG Value</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="hcgValue"
              id="hcgValue"
              value={formData.hcgValue || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hcgValue: e.target.value === '' ? undefined : Number(e.target.value) }))}
              className="block w-full pr-16 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">mIU/mL</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
             <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                    <AIAssistantIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                    <span>AI Result Interpretation</span>
                </h3>
                 <button
                    onClick={handleGetInterpretation}
                    disabled={isLoadingAi || formData.hcgValue === undefined}
                    className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                    >
                    {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Interpret Result'}
                </button>
             </div>
              {aiError && <p className="text-sm text-red-500 text-center">{aiError}</p>}
              {formData.interpretation && (
                 <div className="pt-3 border-t border-slate-200 dark:border-slate-700 animate-fade-in-fast">
                    <p className="p-3 bg-white dark:bg-slate-700 rounded-md italic text-slate-800 dark:text-slate-200">{formData.interpretation}</p>
                </div>
              )}
        </div>

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

export default HcgTestForm;