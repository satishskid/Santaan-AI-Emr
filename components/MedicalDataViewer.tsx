
import React from 'react';
import { 
    Task, TaskData, PatientHistoryData, MedicationData, FollicleScanData, UserRole, 
    EmbryoGradingData, SpermAnalysisData, Diagnosis, PsychologicalAssessmentData, 
    PatientOnboardingData, HcgData, OocyteIdentificationData, FertilizationData, 
    Day3CheckData, OpuData, EmbryoTransferData, OpuPrepData, OpuPostOpData,
    FertilizationPrepData, PostFertilizationCheckData, EmbryoLabPrepData, TransferPrepData, TransferPostCareData
} from '../types';
import { PillIcon, LockIcon, CheckIcon, AIAssistantIcon, MicroscopeIcon } from './icons';
import { PERMISSIONS } from '../constants';

interface MedicalDataViewerProps {
  task: Task;
  currentUserRole: UserRole;
}

const DataRow: React.FC<{ label: string; children: React.ReactNode; isVertical?: boolean }> = ({ label, children, isVertical = false }) => (
    <div className={`grid ${isVertical ? 'grid-cols-1' : 'grid-cols-3'} gap-2 py-1.5 border-b border-slate-200 dark:border-slate-600/50 last:border-b-0`}>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className={`text-sm text-slate-800 dark:text-slate-200 ${isVertical ? 'mt-1' : 'col-span-2'}`}>{children}</dd>
    </div>
);

const renderPatientOnboarding = (data: PatientOnboardingData) => (
     <dl>
        <DataRow label="Protocol Explained">
            <span className={`flex items-center ${data.protocolExplained ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                <CheckIcon className="h-4 w-4 mr-1.5" /> {data.protocolExplained ? 'Yes' : 'No'}
            </span>
        </DataRow>
        <DataRow label="Consent Signed">
             <span className={`flex items-center ${data.consentSigned ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                <CheckIcon className="h-4 w-4 mr-1.5" /> {data.consentSigned ? 'Yes' : 'No'}
            </span>
        </DataRow>
        <DataRow label="Patient Questions">{data.patientQuestions || 'None Logged'}</DataRow>
    </dl>
);


const renderPatientHistory = (data: PatientHistoryData) => (
    <dl>
        <DataRow label="Prev. IVF Cycles">{data.previousIVFCycles ?? 'N/A'}</DataRow>
        <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-200 dark:border-slate-600/50">
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Diagnoses</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-200 col-span-2">
                {data.diagnoses && data.diagnoses.length > 0 ? (
                    <ul className="space-y-1">
                        {data.diagnoses.map((diag, index) => (
                            <li key={index}>
                                <span className="font-semibold">{diag.main}</span>
                                {diag.sub && diag.sub.length > 0 && (
                                    <ul className="pl-4 list-disc list-inside text-slate-600 dark:text-slate-400">
                                        {diag.sub.map((subItem, subIndex) => <li key={subIndex}>{subItem}</li>)}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : 'None Recorded'}
            </dd>
        </div>
        <DataRow label="Allergies">{data.allergies?.join(', ') ?? 'None'}</DataRow>
        <DataRow label="Notes">{data.notes ?? 'N/A'}</DataRow>
    </dl>
);

const renderMedication = (data: MedicationData) => (
    <dl>
        <DataRow label="Medication">
            <div className="flex items-center">
                <PillIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span>{data.medication}</span>
            </div>
        </DataRow>
        <DataRow label="Dosage">{data.dosage}</DataRow>
        <DataRow label="Frequency">{data.frequency}</DataRow>
        <DataRow label="Duration">{data.duration}</DataRow>
        {data.explanation && (
            <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                <dt className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-start">
                    <AIAssistantIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>AI Rationale</span>
                </dt>
                <dd className="text-sm text-slate-800 dark:text-slate-200 col-span-2 italic">{data.explanation}</dd>
            </div>
        )}
    </dl>
);

const renderFollicleScan = (data: FollicleScanData) => (
    <div>
        {data.scanImageBase64 && (
             <div className="mb-4">
                <h4 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Scan Image</h4>
                <img src={`data:image/jpeg;base64,${data.scanImageBase64}`} alt="Follicle Scan" className="rounded-lg max-h-48 border border-slate-300 dark:border-slate-600" />
            </div>
        )}
        <h4 className="text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Follicle Measurements</h4>
        {data.measurements && data.measurements.length > 0 ? (
            <div className="space-y-2">
                {data.measurements.map((m, i) => (
                    <div key={i} className="text-sm">
                        <span className="font-semibold">{m.ovary} Ovary:</span> {m.count} follicles ({m.sizes.join('mm, ')}mm)
                    </div>
                ))}
            </div>
        ) : <p className="text-sm text-slate-500">No follicle measurements recorded.</p>}
        
        <h4 className="text-sm font-bold mt-4 mb-2 text-slate-700 dark:text-slate-300">Endometrium</h4>
        {data.endometrium ? (
             <div className="text-sm">
                <span className="font-semibold">Thickness:</span> {data.endometrium.thickness}, <span className="font-semibold">Pattern:</span> {data.endometrium.pattern}
             </div>
        ): <p className="text-sm text-slate-500">No endometrium data.</p>}

         {data.notes && (
            <>
                <h4 className="text-sm font-bold mt-4 mb-2 text-slate-700 dark:text-slate-300">Notes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{data.notes}</p>
            </>
        )}
    </div>
);

const renderEmbryoGrading = (data: EmbryoGradingData) => (
    <div>
        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
            <MicroscopeIcon className="h-5 w-5 mr-2" />
            Embryo Report
        </h3>
        {(!data.embryos || data.embryos.length === 0) ? (
            <p className="text-sm text-slate-500">No embryos graded yet.</p>
        ) : (
            <div className="space-y-4">
                {data.embryos.map(embryo => (
                    <div key={embryo.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <dl>
                             <DataRow label="Embryo ID">{embryo.id}</DataRow>
                             <DataRow label="Grade">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{embryo.grade}</span>
                            </DataRow>
                             <DataRow label="PGT Status">{embryo.pgtStatus || 'N/A'}</DataRow>
                             <DataRow label="Notes">{embryo.notes || 'N/A'}</DataRow>
                        </dl>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const renderSpermAnalysis = (data: SpermAnalysisData) => (
    <dl>
        <DataRow label="Count">{data.count ? `${data.count} million/mL` : 'N/A'}</DataRow>
        <DataRow label="Motility">{data.motility ? `${data.motility}%` : 'N/A'}</DataRow>
        <DataRow label="Morphology">{data.morphology ? `${data.morphology}%` : 'N/A'}</DataRow>
        <DataRow label="Notes">{data.notes ?? 'N/A'}</DataRow>
        {data.aiAssessment && (
            <div className="grid grid-cols-1 gap-2 pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
                <dt className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-start">
                    <AIAssistantIcon className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>AI Assessment</span>
                </dt>
                <dd className="text-sm text-slate-800 dark:text-slate-200 col-span-2 italic">
                    <p><strong>Assessment:</strong> {data.aiAssessment.assessment}</p>
                    <p><strong>Recommendation:</strong> {data.aiAssessment.recommendation}</p>
                </dd>
            </div>
        )}
    </dl>
);


const renderPsychologicalAssessment = (data: PsychologicalAssessmentData) => (
    <dl className="space-y-4">
        <div>
            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300">Clinical Needs</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{data.clinicalNeeds || 'N/A'}</dd>
        </div>
        <div>
            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300">Emotional Needs</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{data.emotionalNeeds || 'N/A'}</dd>
        </div>
        <div>
            <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300">Financial Needs</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{data.financialNeeds || 'N/A'}</dd>
        </div>

        {(data.persona || data.interventionPlan) && <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50" />}

        {data.persona && (
            <div>
                <dt className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI-Generated Persona</dt>
                <dd className="text-sm text-slate-800 dark:text-slate-200 mt-1 italic">"{data.persona}"</dd>
            </div>
        )}
        {data.interventionPlan && (
             <div className="mt-4">
                <dt className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI-Generated Intervention Plan</dt>
                <dd className="text-sm text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-line">{data.interventionPlan}</dd>
            </div>
        )}
    </dl>
);

const renderHcgTest = (data: HcgData) => (
    <dl>
        <DataRow label="hCG Value">
            <span className="font-bold">{data.hcgValue ?? 'N/A'} mIU/mL</span>
        </DataRow>
        {data.interpretation && (
             <DataRow label="AI Interpretation" isVertical>
                 <p className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-md italic text-blue-800 dark:text-blue-200">{data.interpretation}</p>
            </DataRow>
        )}
    </dl>
);

// --- New Embryology & Procedure Renderers ---

const ChecklistItem: React.FC<{label: string, checked: boolean}> = ({ label, checked }) => (
    <li className={`flex items-center ${checked ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
        <CheckIcon className="h-4 w-4 mr-2" />
        <span>{label}</span>
    </li>
);

const renderChecklist = (data: { checklist?: Record<string, boolean> }, labels: Record<string, string>) => (
    <ul className="space-y-1 mt-1">
        {Object.entries(labels).map(([key, label]) => (
             <ChecklistItem key={key} label={label} checked={!!data.checklist?.[key]} />
        ))}
    </ul>
);

const renderOpuPrep = (data: OpuPrepData) => (
    <DataRow label="Pre-Procedure Checklist" isVertical>
        {renderChecklist(data, {
            patientIdVerified: "Patient ID Verified",
            anesthesiaConsentSigned: "Anesthesia Consent Signed",
            procedureRoomReady: "Procedure Room Ready"
        })}
    </DataRow>
);

const renderOpuData = (data: OpuData) => (
    <dl>
        <DataRow label="Follicles Aspirated (R)">{data.folliclesAspiratedRight ?? 'N/A'}</DataRow>
        <DataRow label="Follicles Aspirated (L)">{data.folliclesAspiratedLeft ?? 'N/A'}</DataRow>
        <DataRow label="Procedure Notes">{data.procedureNotes || 'None'}</DataRow>
    </dl>
);

const renderOpuPostOp = (data: OpuPostOpData) => (
    <DataRow label="Post-Operative Checklist" isVertical>
        {renderChecklist(data, {
            patientStable: "Patient Stable",
            postOpInstructionsGiven: "Post-Op Instructions Given",
            followUpScheduled: "Follow-up Scheduled"
        })}
    </DataRow>
);

const renderFertilizationPrep = (data: FertilizationPrepData) => (
     <DataRow label="Pre-Procedure Checklist" isVertical>
        {renderChecklist(data, {
            spermVerified: "Sperm sample verified",
            dishesPrepared: "Culture dishes prepared",
            incubatorConfirmed: "Incubator conditions confirmed"
        })}
    </DataRow>
);

const renderFertilization = (data: FertilizationData) => (
    <dl>
        <DataRow label="Method">{data.method ?? 'N/A'}</DataRow>
        <DataRow label="Oocytes Inseminated">{data.oocytesInseminated ?? 'N/A'}</DataRow>
        <DataRow label="Notes">{data.notes || 'None'}</DataRow>
    </dl>
);

const renderPostFertilizationCheck = (data: PostFertilizationCheckData) => (
    <dl>
        <DataRow label="Normally Fertilized (2PN)">{data.twoPn_count ?? 'N/A'}</DataRow>
        <DataRow label="Notes">{data.notes || 'None'}</DataRow>
    </dl>
);

const renderEmbryoLabPrep = (data: EmbryoLabPrepData) => (
     <dl>
        <DataRow label="Embryo Selected">{data.embryoIdSelected ?? 'N/A'}</DataRow>
        <DataRow label="Pre-Transfer Checklist" isVertical>
             {renderChecklist(data, {
                warmingProtocolFollowed: "Warming protocol followed",
                mediaEquilibrated: "Media equilibrated",
                patientIdMatched: "Patient ID on dish matches paperwork"
            })}
        </DataRow>
        <DataRow label="Notes">{data.notes || 'None'}</DataRow>
    </dl>
);

const renderTransferPrep = (data: TransferPrepData) => (
     <DataRow label="Pre-Transfer Checklist" isVertical>
        {renderChecklist(data, {
            patientReady: "Patient confirmed ready",
            bladderProtocolFollowed: "Bladder protocol followed",
            consentVerified: "Consent verified"
        })}
    </DataRow>
);

const renderEmbryoTransferData = (data: EmbryoTransferData) => (
    <dl>
        <DataRow label="Embryos Transferred">{data.embryosTransferredCount ?? 'N/A'}</DataRow>
        <DataRow label="Catheter Type">{data.catheterType ?? 'N/A'}</DataRow>
        <DataRow label="Transfer Difficulty">{data.transferDifficulty ?? 'N/A'}</DataRow>
        <DataRow label="Procedure Notes">{data.procedureNotes || 'None'}</DataRow>
    </dl>
);

const renderTransferPostCare = (data: TransferPostCareData) => (
    <DataRow label="Post-Care Checklist" isVertical>
        {renderChecklist(data, {
            patientRested: "Patient rested post-procedure",
            postProcedureInstructionsGiven: "Post-procedure instructions given"
        })}
    </DataRow>
);


const renderOocyteID = (data: OocyteIdentificationData) => (
     <dl>
        <DataRow label="Total Retrieved">{data.totalRetrieved ?? 'N/A'}</DataRow>
        <DataRow label="MII (Mature)">{data.miiCount ?? 'N/A'}</DataRow>
        <DataRow label="MI">{data.miCount ?? 'N/A'}</DataRow>
        <DataRow label="GV">{data.gvCount ?? 'N/A'}</DataRow>
        <DataRow label="Degenerate">{data.degenerateCount ?? 'N/A'}</DataRow>
        <DataRow label="Notes">{data.notes || 'None'}</DataRow>
    </dl>
);

const renderDay3Check = (data: Day3CheckData) => (
    <div>
        {(!data.embryos || data.embryos.length === 0) ? (
            <p className="text-sm text-slate-500">No embryo data recorded for Day 3.</p>
        ) : (
            <div className="space-y-3">
                {data.embryos.map(embryo => (
                    <div key={embryo.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                         <DataRow label={`Embryo #${embryo.id.split('-')[1]}`}>
                            <div className="flex space-x-4">
                                <span><strong>Cells:</strong> {embryo.cellNumber ?? 'N/A'}</span>
                                <span><strong>Frag:</strong> {embryo.fragmentation ?? 'N/A'}</span>
                            </div>
                         </DataRow>
                    </div>
                ))}
            </div>
        )}
        {data.notes && <DataRow label="Notes">{data.notes}</DataRow>}
    </div>
);

const MedicalDataViewer: React.FC<MedicalDataViewerProps> = ({ task, currentUserRole }) => {

    const userPermissions = PERMISSIONS[currentUserRole];
    const hasPermission = userPermissions.includes('*') || userPermissions.includes(task.title);

    if (!hasPermission) {
        return (
            <div className="flex items-center space-x-2 p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-md">
                <LockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    You do not have permission to view these details.
                </p>
            </div>
        );
    }
    
    // Check if data is empty or just has a completion flag
    const isDataEmpty = !task.data || Object.keys(task.data).every(k => k === 'isComplete' || k === 'isVerified' || task.data[k] === undefined || task.data[k] === null || (Array.isArray(task.data[k]) && task.data[k].length === 0));
    if (isDataEmpty) {
        return <p className="text-sm text-slate-500">No data recorded yet.</p>;
    }

    switch (task.title) {
        // Clinical / Nursing
        case 'Patient Onboarding': return renderPatientOnboarding(task.data as PatientOnboardingData);
        case 'Review Patient History': return renderPatientHistory(task.data as PatientHistoryData);
        case 'Psychological Assessment': return renderPsychologicalAssessment(task.data as PsychologicalAssessmentData);
        case 'Prescribe Medication': return renderMedication(task.data as MedicationData);
        case 'Follicle Scan #1':
        case 'Follicle Scan #2': return renderFollicleScan(task.data as FollicleScanData);
        case 'hCG Blood Test': return renderHcgTest(task.data as HcgData);
        case 'OPU Preparation': return renderOpuPrep(task.data as OpuPrepData);
        case 'Post-OPU Recovery': return renderOpuPostOp(task.data as OpuPostOpData);
        case 'Clinical Transfer Preparation': return renderTransferPrep(task.data as TransferPrepData);
        case 'Post-Transfer Care': return renderTransferPostCare(task.data as TransferPostCareData);

        // Doctor Procedures
        case 'Perform OPU': return renderOpuData(task.data as OpuData);
        case 'Perform Transfer': return renderEmbryoTransferData(task.data as EmbryoTransferData);
            
        // Embryology Lab
        case 'Sperm Analysis': return renderSpermAnalysis(task.data as SpermAnalysisData);
        case 'Fertilization Preparation': return renderFertilizationPrep(task.data as FertilizationPrepData);
        case 'Perform ICSI/IVF': return renderFertilization(task.data as FertilizationData);
        case 'Post-Fertilization Check (Day 1)': return renderPostFertilizationCheck(task.data as PostFertilizationCheckData);
        case 'Identify & Count Oocytes': return renderOocyteID(task.data as OocyteIdentificationData);
        case 'Day 3 Check': return renderDay3Check(task.data as Day3CheckData);
        case 'Day 5 Check & Grading': return renderEmbryoGrading(task.data as EmbryoGradingData);
        case 'Embryo Lab Preparation': return renderEmbryoLabPrep(task.data as EmbryoLabPrepData);

        default:
             if (Object.keys(task.data).length > 0) {
                return <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono bg-slate-100 dark:bg-slate-900/50 p-2 rounded-md">{JSON.stringify(task.data, null, 2)}</pre>;
             }
             return <p className="text-sm text-slate-500">No detailed data for this task.</p>;
    }
};

export default MedicalDataViewer;
