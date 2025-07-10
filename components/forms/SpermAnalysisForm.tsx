
import React, { useState } from 'react';
import { Task, SpermAnalysisData, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { AIAssistantIcon, LoadingIcon } from '../icons';

interface SpermAnalysisFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

type NumericSpermAnalysisKeys = {
    [K in keyof SpermAnalysisData]: SpermAnalysisData[K] extends number | undefined ? K : never
}[keyof SpermAnalysisData];

const SpermAnalysisForm: React.FC<SpermAnalysisFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<SpermAnalysisData>(task.data as SpermAnalysisData || {});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  }

  const handleGetSuggestion = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const suggestions = await getAIAnalysis(
        'Sperm Analysis',
        { taskData: formData }
      );
      if (suggestions.error) {
        setAiError(suggestions.error);
      } else {
        setFormData(prev => ({ ...prev, aiAssessment: suggestions as { assessment: string; recommendation: string; } }));
      }
    } catch (err) {
      console.error(err);
      setAiError("An unexpected error occurred while fetching AI suggestion.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, isVerified: true }, status: TaskStatus.Completed });
  };
  
  const FormField: React.FC<{name: NumericSpermAnalysisKeys, label: string, unit: string}> = ({name, label, unit}) => (
     <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
            type="number"
            name={name}
            id={name}
            value={formData[name] || ''}
            onChange={handleNumberChange}
            className="block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{unit}</span>
        </div>
      </div>
    </div>
  );
  
  const isAnalysisPossible = formData.count !== undefined && formData.motility !== undefined && formData.morphology !== undefined;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
      <div className="space-y-6 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField name="count" label="Sperm Count" unit="million/mL" />
            <FormField name="motility" label="Progressive Motility" unit="%" />
            <FormField name="morphology" label="Normal Morphology" unit="%" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
          <textarea
            name="notes"
            id="notes"
            rows={2}
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., High viscosity noted, required DTT treatment. Post-wash analysis showed good recovery. Sample processed using gradient method."
          />
        </div>
        
        {/* AI Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
             <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                    <AIAssistantIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                    <span>AI Analysis (WHO 2021)</span>
                </h3>
                 <button
                    onClick={handleGetSuggestion}
                    disabled={isLoadingAi || !isAnalysisPossible}
                    className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                    >
                    {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Analyze with AI'}
                </button>
             </div>
              {aiError && <p className="text-sm text-red-500 text-center">{aiError}</p>}
              {!isAnalysisPossible && !formData.aiAssessment && <p className="text-xs text-center text-slate-500">Enter all three parameters to enable AI analysis.</p>}
              {formData.aiAssessment && (
                 <div className="pt-3 border-t border-slate-200 dark:border-slate-700 animate-fade-in-fast">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                       <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Assessment</dt>
                          <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formData.aiAssessment.assessment}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Recommendation</dt>
                          <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formData.aiAssessment.recommendation}</dd>
                        </div>
                    </dl>
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

export default SpermAnalysisForm;
