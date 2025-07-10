
import React, { useState, useMemo } from 'react';
import { Task, PatientOnboardingData, UserRole, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { PROTOCOL_DESCRIPTIONS } from '../../constants';
import { CheckIcon } from '../icons';

interface OnboardingFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  patientProtocol: string;
}

const AccordionItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-600">
      <button
        onClick={onClick}
        className="flex justify-between items-center w-full p-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <span>{question}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-300">{answer}</p>
        </div>
      )}
    </div>
  );
};


const OnboardingForm: React.FC<OnboardingFormProps> = ({ task, onClose, onSave, patientProtocol }) => {
  const [formData, setFormData] = useState<PatientOnboardingData>(task.data as PatientOnboardingData || {});
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const protocolInfo = useMemo(() => PROTOCOL_DESCRIPTIONS[patientProtocol] || {
    title: 'Unknown Protocol',
    description: 'No description available for this protocol.'
  }, [patientProtocol]);
  
  const isSaveDisabled = !formData.protocolExplained || !formData.consentSigned;

  const handleSave = () => {
    onSave({ ...task, data: formData, status: TaskStatus.Completed });
  };
  
  const handleToggleAccordion = (question: string) => {
    setOpenAccordion(prev => prev === question ? null : question);
  };

  const { consentForm } = formData;

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="p-2 space-y-6">
        {/* Step 1: Protocol Explanation */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{protocolInfo.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{protocolInfo.description}</p>
            <div className="mt-4 flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="protocolExplained"
                        name="protocolExplained"
                        type="checkbox"
                        checked={!!formData.protocolExplained}
                        onChange={(e) => setFormData(prev => ({...prev, protocolExplained: e.target.checked}))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="protocolExplained" className="font-medium text-gray-700 dark:text-gray-300">I have explained the above protocol to the patient.</label>
                </div>
            </div>
        </div>

        {/* Step 2: Consent Form & Aide */}
        {consentForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Left: Consent Form */}
                 <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{consentForm.title}</h3>
                    <div className="p-3 border rounded-md h-72 overflow-y-auto bg-white dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {consentForm.content}
                    </div>
                 </div>
                 {/* Right: Nurse's Aide */}
                 <div className="space-y-3">
                     <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Nurse's Aide: Common Questions</h3>
                     <div className="border rounded-md h-72 overflow-y-auto bg-white dark:bg-slate-700/50">
                         {consentForm.explanationPoints.map(point => (
                             <AccordionItem 
                                key={point.question}
                                question={point.question}
                                answer={point.answer}
                                isOpen={openAccordion === point.question}
                                onClick={() => handleToggleAccordion(point.question)}
                             />
                         ))}
                     </div>
                 </div>
            </div>
        )}
       

        {/* Step 3: Completion and Logging */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
                <label htmlFor="patientQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Log any patient questions or concerns
                </label>
                <textarea
                    id="patientQuestions"
                    name="patientQuestions"
                    rows={3}
                    value={formData.patientQuestions || ''}
                    onChange={(e) => setFormData(prev => ({...prev, patientQuestions: e.target.value}))}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Patient asked about medication side effects and was reassured. Expressed concern about OHSS, provided with information pamphlet."
                />
            </div>

            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="consentSigned"
                        name="consentSigned"
                        type="checkbox"
                        checked={!!formData.consentSigned}
                        onChange={(e) => setFormData(prev => ({...prev, consentSigned: e.target.checked}))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="consentSigned" className="font-medium text-gray-700 dark:text-gray-300">Consent form signed and collected from patient.</label>
                </div>
            </div>
        </div>

      </div>
    </FormWrapper>
  );
};

export default OnboardingForm;
