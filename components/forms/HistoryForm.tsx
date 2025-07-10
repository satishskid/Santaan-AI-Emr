
import React, { useState, useEffect } from 'react';
import { Task, PatientHistoryData, Diagnosis } from '../../types';
import FormWrapper from './FormWrapper';
import { DIAGNOSIS_HIERARCHY, COMMON_ALLERGIES } from '../../constants';
import { UploadCloudIcon } from '../icons';

interface HistoryFormProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const HistoryForm: React.FC<HistoryFormProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState<PatientHistoryData>(task.data as PatientHistoryData || { reviewed: 'No', diagnoses: [], allergies: [], identityVerified: false });
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  useEffect(() => {
    // A task can be saved if the identity is verified AND a document is present
    if(formData.identityVerified && formData.identityDocumentBase64){
        setIsSaveDisabled(false);
    } else {
        setIsSaveDisabled(true);
    }
  }, [formData.identityVerified, formData.identityDocumentBase64]);

  const handleMainDiagnosisChange = (main: string, isChecked: boolean) => {
    setFormData(prev => {
      const existingDiagnoses = prev.diagnoses || [];
      if (isChecked) {
        // Add new main diagnosis if it doesn't exist
        if (!existingDiagnoses.some(d => d.main === main)) {
          return { ...prev, diagnoses: [...existingDiagnoses, { main, sub: [] }] };
        }
      } else {
        // Remove main diagnosis
        return { ...prev, diagnoses: existingDiagnoses.filter(d => d.main !== main) };
      }
      return prev;
    });
  };

  const handleSubDiagnosisChange = (main: string, sub: string, isChecked: boolean) => {
    setFormData(prev => {
        const existingDiagnoses = prev.diagnoses || [];
        const newDiagnoses = existingDiagnoses.map(d => {
            if (d.main === main) {
                const existingSub = d.sub || [];
                if(isChecked) {
                    // Add sub-diagnosis if it doesn't exist
                    return {...d, sub: [...new Set([...existingSub, sub])]};
                } else {
                    // Remove sub-diagnosis
                    return {...d, sub: existingSub.filter(s => s !== sub)};
                }
            }
            return d;
        });
        return {...prev, diagnoses: newDiagnoses};
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        setFormData(prev => ({ ...prev, identityDocumentBase64: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAllergyChange = (allergy: string, isChecked: boolean) => {
    setFormData(prev => {
        const existingAllergies = prev.allergies || [];
        if(isChecked) {
            return {...prev, allergies: [...new Set([...existingAllergies, allergy])]};
        } else {
            return {...prev, allergies: existingAllergies.filter(a => a !== allergy)};
        }
    });
  };

  const handleSave = () => {
    onSave({ ...task, data: { ...formData, reviewed: 'Yes' } });
  };

  return (
    <FormWrapper title={task.title} onClose={onClose} onSave={handleSave} onCancel={onClose} isSaveDisabled={isSaveDisabled}>
      <div className="space-y-6 p-2">
        {/* Diagnosis Hierarchy */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Known Diagnoses</label>
          <div className="mt-2 space-y-3">
            {Object.entries(DIAGNOSIS_HIERARCHY).map(([main, subItems]) => {
              const currentDiag = formData.diagnoses?.find(d => d.main === main);
              return (
                <div key={main}>
                  <div className="flex items-center">
                    <input
                      id={`main-${main}`}
                      type="checkbox"
                      checked={!!currentDiag}
                      onChange={(e) => handleMainDiagnosisChange(main, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`main-${main}`} className="ml-2 block text-sm font-medium text-slate-900 dark:text-slate-200">
                      {main}
                    </label>
                  </div>
                  {currentDiag && subItems.length > 0 && (
                    <div className="pl-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                      {subItems.map(sub => (
                        <div key={sub} className="flex items-center">
                          <input
                            id={`sub-${main}-${sub}`}
                            type="checkbox"
                            checked={!!currentDiag.sub?.includes(sub)}
                            onChange={(e) => handleSubDiagnosisChange(main, sub, e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`sub-${main}-${sub}`} className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            {sub}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Allergies */}
         <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Allergies</label>
           <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_ALLERGIES.map(allergy => (
              <div key={allergy} className="flex items-center">
                <input
                  id={`allergy-${allergy}`}
                  type="checkbox"
                  checked={!!formData.allergies?.includes(allergy)}
                  onChange={(e) => handleAllergyChange(allergy, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`allergy-${allergy}`} className="ml-2 block text-sm text-slate-900 dark:text-slate-200">
                  {allergy}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quality Checks */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quality & Verification</h4>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Identity Document</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {formData.identityDocumentBase64 ? (
                            <span className="text-sm text-green-600 font-semibold">Document Uploaded</span>
                        ): (
                            <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                        )}
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>{formData.identityDocumentBase64 ? 'Change file' : 'Upload a file'}</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        id="identityVerified"
                        name="identityVerified"
                        type="checkbox"
                        checked={!!formData.identityVerified}
                        onChange={(e) => setFormData(prev => ({...prev, identityVerified: e.target.checked}))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="identityVerified" className="font-medium text-gray-700 dark:text-gray-300">Identity Verified</label>
                    <p className="text-gray-500 dark:text-gray-400">Confirm that the patient's identity has been verified against the uploaded document.</p>
                </div>
            </div>
             {isSaveDisabled && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">Please upload an ID and verify identity to save.</p>}
        </div>

      </div>
    </FormWrapper>
  );
};

export default HistoryForm;
