
import React, { useState } from 'react';
import { Task, EmbryoGradingData, EmbryoDetails, TaskStatus } from '../../types';
import FormWrapper from './FormWrapper';
import { getAIAnalysis } from '../../services/geminiService';
import { AIAssistantIcon, LoadingIcon, UploadCloudIcon, CloseIcon } from '../icons';

interface EmbryoGradingFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const EmbryoCard: React.FC<{
    embryo: EmbryoDetails;
    onUpdate: (updatedEmbryo: EmbryoDetails) => void;
    onRemove: (id: string) => void;
}> = ({ embryo, onUpdate, onRemove }) => {
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string|null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ ...embryo, embryoImageBase64: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGetSuggestion = async () => {
        if (!embryo.embryoImageBase64) {
            setAiError("Please upload an image first.");
            return;
        }
        setIsLoadingAi(true);
        setAiError(null);
        try {
            const suggestions = await getAIAnalysis('Day 5 Check & Grading', { taskData: {} }, embryo.embryoImageBase64);
            if(suggestions.error) {
                setAiError(suggestions.error);
            } else {
                onUpdate({ ...embryo, grade: suggestions.grade || embryo.grade, notes: suggestions.notes || embryo.notes });
            }
        } catch (err) {
            setAiError("Failed to get AI grading.");
        } finally {
            setIsLoadingAi(false);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg border border-slate-300 dark:border-slate-600 space-y-4 relative">
            <button onClick={() => onRemove(embryo.id)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <CloseIcon className="h-4 w-4" />
            </button>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Embryo #{embryo.id.split('-')[1]}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gardner Grade</label>
                        <input type="text" value={embryo.grade} onChange={(e) => onUpdate({...embryo, grade: e.target.value})} placeholder="e.g., 4AA" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">PGT Status</label>
                         <select value={embryo.pgtStatus} onChange={e => onUpdate({...embryo, pgtStatus: e.target.value as any})} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                            <option value="Untested">Untested</option>
                            <option value="Pending">Pending</option>
                            <option value="Euploid">Euploid</option>
                            <option value="Aneuploid">Aneuploid</option>
                             <option value="Mosaic">Mosaic</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image</label>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {embryo.embryoImageBase64 ? <img src={embryo.embryoImageBase64} alt={`Embryo ${embryo.id}`} className="mx-auto h-20 w-20 rounded-full object-cover"/> : <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400"/>}
                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                <label htmlFor={`file-upload-${embryo.id}`} className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                                    <span>{embryo.embryoImageBase64 ? 'Change' : 'Upload'}</span>
                                    <input id={`file-upload-${embryo.id}`} type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea value={embryo.notes} onChange={e => onUpdate({...embryo, notes: e.target.value})} rows={2} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700" placeholder="e.g., ICM is compact and distinct. Trophectoderm is cohesive with many cells forming a uniform layer." />
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                 <button onClick={handleGetSuggestion} disabled={isLoadingAi || !embryo.embryoImageBase64} className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                    {isLoadingAi ? <LoadingIcon className="h-5 w-5 animate-spin" /> : <><AIAssistantIcon className="h-5 w-5 mr-2"/> Suggest Grade from Image</>}
                 </button>
                 {aiError && <p className="text-xs text-red-500 mt-1 text-center">{aiError}</p>}
            </div>
        </div>
    );
};


const EmbryoGradingForm: React.FC<EmbryoGradingFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<EmbryoGradingData>(task.data as EmbryoGradingData || { embryos: [] });

  const handleAddEmbryo = () => {
    const newId = `emb-${(formData.embryos?.length || 0) + 1}`;
    const newEmbryo: EmbryoDetails = { id: newId, grade: '', pgtStatus: 'Untested', notes: '' };
    setFormData(prev => ({ ...prev, embryos: [...(prev.embryos || []), newEmbryo] }));
  };
  
  const handleUpdateEmbryo = (updatedEmbryo: EmbryoDetails) => {
    setFormData(prev => ({
        ...prev,
        embryos: prev.embryos?.map(e => e.id === updatedEmbryo.id ? updatedEmbryo : e)
    }));
  };

  const handleRemoveEmbryo = (id: string) => {
    setFormData(prev => ({
        ...prev,
        embryos: prev.embryos?.filter(e => e.id !== id)
    }));
  };

  const handleSave = () => {
    onSave({ ...task, data: formData, status: TaskStatus.Completed });
  };
  
  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose}>
        <div className="p-4 space-y-4">
            <div className="space-y-4">
            {formData.embryos?.map(embryo => (
                <EmbryoCard key={embryo.id} embryo={embryo} onUpdate={handleUpdateEmbryo} onRemove={handleRemoveEmbryo}/>
            ))}
            </div>
            <button onClick={handleAddEmbryo} className="w-full py-2 px-4 border border-dashed border-slate-400 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                + Add Embryo
            </button>
        </div>
    </FormWrapper>
  );
};

export default EmbryoGradingForm;
