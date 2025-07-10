
import React, { useState, useCallback, useMemo } from 'react';
import { Task, FollicleScanData, FollicleMeasurement } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { LoadingIcon, UploadCloudIcon, CheckIcon, AIAssistantIcon } from '../icons';

interface FollicleScanFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const AISuggestion: React.FC<{suggestion?: string | number, onAccept: () => void}> = ({ suggestion, onAccept }) => {
    if (!suggestion) return null;
    return (
        <div className="mt-2 p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-md flex items-center justify-between animate-fade-in-fast">
            <p className="text-sm text-blue-700 dark:text-blue-300 italic">Suggestion: {suggestion}</p>
            <button onClick={onAccept} title="Accept suggestion" className="ml-2 p-1 rounded-full bg-blue-200 text-blue-700 hover:bg-blue-300 flex-shrink-0">
                <CheckIcon className="h-4 w-4" />
            </button>
        </div>
    );
};


const FollicleScanForm: React.FC<FollicleScanFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<FollicleScanData>(task.data as FollicleScanData || { measurements: [] });
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [follicleInput, setFollicleInput] = useState({
      Right: formData.measurements?.find(m => m.ovary === 'Right')?.sizes.join(', ') || '',
      Left: formData.measurements?.find(m => m.ovary === 'Left')?.sizes.join(', ') || '',
  });

  const handleFollicleInputChange = (ovary: 'Right' | 'Left', value: string) => {
      setFollicleInput(prev => ({ ...prev, [ovary]: value }));

      const sizes = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
      const existingMeasurement = formData.measurements?.find(m => m.ovary === ovary);

      if (sizes.length > 0) {
        const newMeasurement: FollicleMeasurement = {
          ovary: ovary,
          count: sizes.length,
          sizes: sizes,
        };
        const otherMeasurements = formData.measurements?.filter(m => m.ovary !== ovary) || [];
        setFormData(prev => ({...prev, measurements: [...otherMeasurements, newMeasurement]}));
      } else if (existingMeasurement) {
        const otherMeasurements = formData.measurements?.filter(m => m.ovary !== ovary) || [];
        setFormData(prev => ({...prev, measurements: otherMeasurements}));
      }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        setFormData(prev => ({ ...prev, scanImageBase64: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchAIAnalysis = useCallback(async () => {
    setIsLoadingAi(true);
    setAiError(null);
    setAiSuggestions({});
    try {
      const suggestions = await getAIAnalysis(
        task.title,
        { taskData: formData },
        formData.scanImageBase64
      );
      if (suggestions.error) {
        setAiError(suggestions.error);
      } else {
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      setAiError("Failed to load AI insights. Please try again.");
    } finally {
      setIsLoadingAi(false);
    }
  }, [formData, task.title]);
  
  const handleAcceptSuggestion = (field: string, nestedField?: string) => {
    if (aiSuggestions[field] === undefined) return;

    if (nestedField) {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [nestedField]: aiSuggestions[field][nestedField] }
        }));
    } else {
        setFormData(prev => ({ ...prev, [field]: aiSuggestions[field] }));
    }
    
    setAiSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[field];
        return newSuggestions;
    });
  };
  
  const handleAcceptEndometriumSuggestion = (field: 'thickness' | 'pattern') => {
    if(aiSuggestions[field]) {
       setFormData(prev => ({
            ...prev,
            endometrium: {
                ...prev.endometrium,
                thickness: field === 'thickness' ? aiSuggestions.endometriumThickness : prev.endometrium?.thickness,
                pattern: field === 'pattern' ? aiSuggestions.endometriumPattern : prev.endometrium?.pattern,
            }
       }));
       setAiSuggestions(prev => {
            const newSuggestions = {...prev};
            delete newSuggestions[field];
            return newSuggestions;
       })
    }
  }


  const handleSave = () => {
    onSave({ ...task, data: formData });
  };

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-2">
        {/* Left Column: Data Entry */}
        <div className="space-y-6">
            {/* Endometrium */}
            <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-2">Endometrium</legend>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="endometriumThickness" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Thickness</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                             <input
                                type="number"
                                name="endometriumThickness"
                                id="endometriumThickness"
                                value={formData.endometrium?.thickness || ''}
                                onChange={(e) => setFormData(prev => ({...prev, endometrium: {...prev.endometrium, thickness: e.target.value ? parseFloat(e.target.value) : undefined, pattern: prev.endometrium?.pattern || 'Trilaminar'}}))}
                                className="block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">mm</span>
                            </div>
                        </div>
                         <AISuggestion suggestion={aiSuggestions.endometriumThickness} onAccept={() => handleAcceptEndometriumSuggestion('thickness')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pattern</label>
                        <select
                            name="endometriumPattern"
                            value={formData.endometrium?.pattern || 'Trilaminar'}
                            onChange={(e) => setFormData(prev => ({...prev, endometrium: {...prev.endometrium, pattern: e.target.value as any, thickness: prev.endometrium?.thickness}}))}
                             className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Trilaminar</option>
                            <option>Homogenous</option>
                            <option>Other</option>
                        </select>
                         <AISuggestion suggestion={aiSuggestions.endometriumPattern} onAccept={() => handleAcceptEndometriumSuggestion('pattern')} />
                    </div>
                </div>
            </fieldset>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Overall cohort appears homogenous. Endometrial lining is well-defined and appears receptive. No free fluid noted in the cul-de-sac."
                />
                <AISuggestion suggestion={aiSuggestions.notes} onAccept={() => handleAcceptSuggestion('notes')} />
            </div>

        </div>

        {/* Right Column: Follicles, Image and AI */}
        <div className="space-y-6">
           {/* Follicle Measurements */}
            <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-2">Follicle Measurements</legend>
                <div className="space-y-4">
                    {(['Right', 'Left'] as const).map(ovary => {
                        const measurement = formData.measurements?.find(m => m.ovary === ovary);
                        return (
                            <div key={ovary}>
                                <label htmlFor={`follicles-${ovary}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{ovary} Ovary</label>
                                 <input
                                    type="text"
                                    id={`follicles-${ovary}`}
                                    value={follicleInput[ovary]}
                                    onChange={(e) => handleFollicleInputChange(ovary, e.target.value)}
                                    placeholder="e.g., 14, 15, 16"
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {measurement ? `${measurement.count} follicle(s)` : 'Enter comma-separated sizes in mm'}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </fieldset>

            {/* Image upload */}
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload Scan Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {formData.scanImageBase64 ? (
                             <img src={`data:image/jpeg;base64,${formData.scanImageBase64}`} alt="Scan preview" className="mx-auto h-24 w-auto rounded-md"/>
                        ): (
                            <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                        )}
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>{formData.scanImageBase64 ? 'Change file' : 'Upload a file'}</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG up to 10MB</p>
                    </div>
                </div>
            </div>

             {/* AI Section */}
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-2">
                    <AIAssistantIcon className="h-5 w-5 text-blue-500 mr-2"/>
                    <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200">AI Assistance</h3>
                </div>
                {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                <button 
                  onClick={handleFetchAIAnalysis}
                  disabled={isLoadingAi}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                  {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Analyze with AI'}
                </button>
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
      </div>
    </FormWrapper>
  );
};

export default FollicleScanForm;
