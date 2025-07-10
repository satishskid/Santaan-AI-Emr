
import React, { useState, useEffect } from 'react';
import { NewPatientOnboardingInfo, PatientHistoryData, Diagnosis } from '../types';
import { CloseIcon, UploadCloudIcon } from './icons';
import { PROTOCOL_DESCRIPTIONS, DIAGNOSIS_HIERARCHY, COMMON_ALLERGIES } from '../constants';

interface AddPatientModalProps {
  onClose: () => void;
  onSave: (patientInfo: NewPatientOnboardingInfo) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onSave }) => {
  const [patientInfo, setPatientInfo] = useState<Partial<NewPatientOnboardingInfo>>({
    protocol: 'Antagonist Protocol',
    historyData: {
        reviewed: 'No',
        diagnoses: [],
        allergies: [],
        identityVerified: false,
    }
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { name, age, protocol, cycleStartDate, historyData } = patientInfo;
    const { identityVerified, identityDocumentBase64 } = historyData || {};
    const valid = !!(name && age && protocol && cycleStartDate && identityVerified && identityDocumentBase64);
    setIsFormValid(valid);
  }, [patientInfo]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) : value }));
  };

  const handleHistoryChange = (field: keyof PatientHistoryData, value: any) => {
    setPatientInfo(prev => ({ ...prev, historyData: { ...prev.historyData, [field]: value } as PatientHistoryData }));
  };
  
  const handleMainDiagnosisChange = (main: string, isChecked: boolean) => {
    const existingDiagnoses = patientInfo.historyData?.diagnoses || [];
    let newDiagnoses: Diagnosis[];
    if (isChecked) {
      newDiagnoses = [...existingDiagnoses, { main, sub: [] }];
    } else {
      newDiagnoses = existingDiagnoses.filter(d => d.main !== main);
    }
    handleHistoryChange('diagnoses', newDiagnoses);
  };

  const handleSubDiagnosisChange = (main: string, sub: string, isChecked: boolean) => {
    const existingDiagnoses = patientInfo.historyData?.diagnoses || [];
    const newDiagnoses = existingDiagnoses.map(d => {
        if (d.main === main) {
            const existingSub = d.sub || [];
            return {...d, sub: isChecked ? [...new Set([...existingSub, sub])] : existingSub.filter(s => s !== sub)};
        }
        return d;
    });
    handleHistoryChange('diagnoses', newDiagnoses);
  };
  
  const handleAllergyChange = (allergy: string, isChecked: boolean) => {
    const existingAllergies = patientInfo.historyData?.allergies || [];
    const newAllergies = isChecked ? [...new Set([...existingAllergies, allergy])] : existingAllergies.filter(a => a !== allergy);
    handleHistoryChange('allergies', newAllergies);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        handleHistoryChange('identityDocumentBase64', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
        const finalHistoryData = { ...patientInfo.historyData, reviewed: 'Yes' as const };
        onSave({ ...patientInfo, historyData: finalHistoryData } as NewPatientOnboardingInfo);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Patient & Review History</h3>
            <button type="button" onClick={onClose} title="Close" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Patient Info */}
            <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100">Patient Information</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input type="text" name="name" id="name" required onChange={handleInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                        <input type="number" name="age" id="age" required onChange={handleInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700" />
                    </div>
                    <div>
                        <label htmlFor="partnerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Partner's Name (Optional)</label>
                        <input type="text" name="partnerName" id="partnerName" onChange={handleInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700" />
                    </div>
                 </div>
            </fieldset>

            {/* Cycle Info */}
             <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100">Cycle Information</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="protocol" className="block text-sm font-medium text-slate-700 dark:text-slate-300">IVF Protocol</label>
                        <select name="protocol" id="protocol" required value={patientInfo.protocol} onChange={handleInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                          {Object.keys(PROTOCOL_DESCRIPTIONS).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cycleStartDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cycle Start Date</label>
                        <input type="date" name="cycleStartDate" id="cycleStartDate" required value={patientInfo.cycleStartDate} onChange={handleInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700" />
                    </div>
                </div>
            </fieldset>

            {/* Medical History */}
            <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100">Medical History</legend>
                <div className="mt-4 space-y-4">
                    {/* Diagnoses */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Known Diagnoses</label>
                       {Object.entries(DIAGNOSIS_HIERARCHY).map(([main, subItems]) => {
                          const currentDiag = patientInfo.historyData?.diagnoses?.find(d => d.main === main);
                          return (
                            <div key={main} className="mb-2">
                              <div className="flex items-center">
                                <input id={`main-${main}`} type="checkbox" checked={!!currentDiag} onChange={(e) => handleMainDiagnosisChange(main, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                <label htmlFor={`main-${main}`} className="ml-2 block text-sm font-medium text-slate-900 dark:text-slate-200">{main}</label>
                              </div>
                              {currentDiag && subItems.length > 0 && (
                                <div className="pl-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                  {subItems.map(sub => (
                                    <div key={sub} className="flex items-center">
                                      <input id={`sub-${main}-${sub}`} type="checkbox" checked={!!currentDiag.sub?.includes(sub)} onChange={(e) => handleSubDiagnosisChange(main, sub, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                      <label htmlFor={`sub-${main}-${sub}`} className="ml-2 block text-sm text-slate-700 dark:text-slate-300">{sub}</label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    {/* Allergies */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Allergies</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {COMMON_ALLERGIES.map(allergy => (
                            <div key={allergy} className="flex items-center">
                                <input id={`allergy-${allergy}`} type="checkbox" checked={!!patientInfo.historyData?.allergies?.includes(allergy)} onChange={(e) => handleAllergyChange(allergy, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                <label htmlFor={`allergy-${allergy}`} className="ml-2 block text-sm text-slate-900 dark:text-slate-200">{allergy}</label>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* Verification */}
            <fieldset>
                <legend className="text-md font-semibold text-slate-800 dark:text-slate-100">Verification</legend>
                 <div className="mt-2 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Identity Document</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {patientInfo.historyData?.identityDocumentBase64 ? <span className="text-sm text-green-600 font-semibold">Document Uploaded</span> : <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />}
                                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                                        <span>{patientInfo.historyData?.identityDocumentBase64 ? 'Change file' : 'Upload a file'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="identityVerified" name="identityVerified" type="checkbox" checked={!!patientInfo.historyData?.identityVerified} onChange={(e) => handleHistoryChange('identityVerified', e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="identityVerified" className="font-medium text-gray-700 dark:text-gray-300">Identity Verified</label>
                            <p className="text-gray-500 dark:text-gray-400">Confirm the patient's identity has been verified against the document.</p>
                        </div>
                    </div>
                </div>
            </fieldset>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end items-center space-x-3 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
               {!isFormValid && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400 mr-4">Please fill all required fields, upload ID, and verify identity to save.</p>}
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 text-sm font-semibold">
                  Cancel
              </button>
              <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed">
                  Save and Schedule Patient
              </button>
          </div>
        </form>
         <style>{`
          @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};
