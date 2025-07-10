
import React, { useState, useCallback } from 'react';
import { Task, PsychologicalAssessmentData } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { LoadingIcon, AIAssistantIcon } from '../icons';

interface PsychologicalAssessmentFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const FormTextArea: React.FC<{
    name: keyof PsychologicalAssessmentData;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
}> = ({ name, label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <textarea
            name={name}
            id={name}
            rows={3}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
        />
    </div>
);


const PsychologicalAssessmentForm: React.FC<PsychologicalAssessmentFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<PsychologicalAssessmentData>(task.data as PsychologicalAssessmentData || {});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFetchAIAnalysis = useCallback(async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      // We only need to send the needs to the AI
      const needsData = {
          clinicalNeeds: formData.clinicalNeeds,
          emotionalNeeds: formData.emotionalNeeds,
          financialNeeds: formData.financialNeeds,
      };
      const suggestions = await getAIAnalysis(task.title, { taskData: needsData });
      if (suggestions.error) {
        setAiError(suggestions.error);
      } else {
        setFormData(prev => ({ ...prev, ...suggestions }));
      }
    } catch (error) {
      setAiError("Failed to load AI insights. Please try again.");
    } finally {
      setIsLoadingAi(false);
    }
  }, [formData.clinicalNeeds, formData.emotionalNeeds, formData.financialNeeds, task.title]);

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, assessmentComplete: true } });
  };
  
  const hasNeeds = formData.clinicalNeeds || formData.emotionalNeeds || formData.financialNeeds;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
        <div className="space-y-6 p-2">
            <FormTextArea name="clinicalNeeds" label="Clinical Needs" value={formData.clinicalNeeds || ''} onChange={handleChange} placeholder="e.g., Understanding the IVF process, medication side effects, concerns about success rates..." />
            <FormTextArea name="emotionalNeeds" label="Emotional Needs" value={formData.emotionalNeeds || ''} onChange={handleChange} placeholder="e.g., High anxiety levels, feeling isolated, managing expectations, partner communication..." />
            <FormTextArea name="financialNeeds" label="Financial Needs" value={formData.financialNeeds || ''} onChange={handleChange} placeholder="e.g., Concerns about treatment costs, insurance coverage questions, need for financial planning resources..." />
            
            {/* AI Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center">
                    <AIAssistantIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"/>
                    <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200">AI-Powered Persona & Plan</h3>
                </div>

                {!formData.persona && !formData.interventionPlan && (
                     <button 
                        onClick={handleFetchAIAnalysis}
                        disabled={isLoadingAi || !hasNeeds}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                        {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Generate with AI'}
                    </button>
                )}
               
                {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                {!hasNeeds && !formData.persona && <p className="text-xs text-center text-slate-500">Enter at least one need to enable AI generation.</p>}

                {formData.persona && (
                    <div className="animate-fade-in-fast">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Generated Persona</h4>
                        <p className="mt-1 text-sm p-3 bg-white dark:bg-slate-700 rounded-md italic">"{formData.persona}"</p>
                    </div>
                )}
                {formData.interventionPlan && (
                    <div className="animate-fade-in-fast">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Generated Intervention Plan</h4>
                        <div className="mt-1 text-sm p-3 bg-white dark:bg-slate-700 rounded-md whitespace-pre-line">{formData.interventionPlan}</div>
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

export default PsychologicalAssessmentForm;
