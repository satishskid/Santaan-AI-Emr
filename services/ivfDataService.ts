
import { 
    Patient, PatientPathwayStep, UserRole, TaskStatus, Task, PatientHistoryData, MedicationData, 
    FollicleScanData, EmbryoGradingData, SpermAnalysisData, PsychologicalAssessmentData, PatientOnboardingData, 
    HcgData, OocyteIdentificationData, Day3CheckData, EmbryoTransferData,
    OpuPrepData, OpuData, OpuPostOpData,
    FertilizationPrepData, FertilizationData, PostFertilizationCheckData,
    EmbryoLabPrepData, TransferPrepData, TransferPostCareData, NewPatientOnboardingInfo, Day3EmbryoDetails
} from '../types';

const getRelativeDate = (startDate: string | Date, daysToAdd: number, time: string = '09:00'): string => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + daysToAdd);
    const [hours, minutes] = time.split(':');
    date.setUTCHours(Number(hours));
    date.setUTCMinutes(Number(minutes));
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date.toISOString();
};


const generateTasksForStep = (stepId: string, stepName: string, patientId: string, cycleStartDate: string): Task[] => {
    const tasks: Task[] = [];
    const baseId = `${patientId}-${stepId}`;
    
    // Base date for scheduling this patient's pathway
    const patientStartDate = cycleStartDate;

    switch(stepName) {
        case 'Initial Consultation':
            tasks.push({ 
                id: `${baseId}-doc-1`, 
                title: 'Review Patient History', 
                description: 'Review prior medical records, previous cycles, and lab results.', 
                assignedTo: UserRole.Doctor, 
                status: TaskStatus.Pending, 
                data: {
                    reviewed: 'No',
                    identityVerified: false
                } as PatientHistoryData, 
                dueDate: getRelativeDate(patientStartDate, 0, '09:00'),
                durationMinutes: 45,
                resourceRequired: null,
            });
            tasks.push({ 
                id: `${baseId}-nurse-1`, 
                title: 'Patient Onboarding', 
                description: 'Explain protocol and obtain consents.', 
                assignedTo: UserRole.Nurse, 
                status: TaskStatus.Pending, 
                data: {
                    consentForm: {
                        title: 'Consent for In Vitro Fertilization (IVF) Cycle',
                        content: `This document outlines the procedures, risks, and benefits...`,
                        explanationPoints: [
                            { question: 'What is OHSS?', answer: 'Ovarian Hyperstimulation Syndrome is a rare but serious complication...' },
                            { question: 'What are the side effects of the medication?', answer: 'Common side effects include bloating, mood swings, and injection site reactions.' },
                        ],
                    }
                } as PatientOnboardingData, 
                dueDate: getRelativeDate(patientStartDate, 0, '10:00'),
                durationMinutes: 60,
                resourceRequired: null,
            });
            tasks.push({ 
                id: `${baseId}-counselor-1`, 
                title: 'Psychological Assessment', 
                description: 'Assess patient and partner readiness and stress levels.', 
                assignedTo: UserRole.Counselor, 
                status: TaskStatus.Pending, 
                data: {} as PsychologicalAssessmentData, 
                dueDate: getRelativeDate(patientStartDate, 0, '11:00'),
                durationMinutes: 50,
                resourceRequired: null,
            });
            break;
        case 'Ovarian Stimulation':
            tasks.push({ id: `${baseId}-doc-1`, title: 'Prescribe Medication', description: 'Prescribe stimulation medication based on protocol.', assignedTo: UserRole.Doctor, status: TaskStatus.Pending, data: {} as MedicationData, dueDate: getRelativeDate(patientStartDate, 0, '12:00'), durationMinutes: 20, resourceRequired: null });
            tasks.push({ id: `${baseId}-nurse-1`, title: 'Follicle Scan #1', description: 'Perform ultrasound to measure follicle growth.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as FollicleScanData, dueDate: getRelativeDate(patientStartDate, 3, '14:00'), durationMinutes: 30, resourceRequired: 'Lab' });
            tasks.push({ id: `${baseId}-nurse-2`, title: 'Follicle Scan #2', description: 'Perform ultrasound to measure follicle growth.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as FollicleScanData, dueDate: getRelativeDate(patientStartDate, 6, '14:00'), durationMinutes: 30, resourceRequired: 'Lab' });
            break;
        case 'Egg Retrieval':
            const opuDateTime = getRelativeDate(patientStartDate, 7, '09:00');

            tasks.push({ id: `${baseId}-nurse-prep`, title: 'OPU Preparation', description: 'Complete pre-op checklist for OPU.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as OpuPrepData, dueDate: opuDateTime, durationMinutes: 30, resourceRequired: 'OT' });
            tasks.push({ id: `${baseId}-doc-action`, title: 'Perform OPU', description: 'Oocyte Pick-Up procedure.', assignedTo: UserRole.Doctor, status: TaskStatus.Pending, data: {} as OpuData, dueDate: opuDateTime, durationMinutes: 60, resourceRequired: 'OT' });
            
            const postOpuTime = getRelativeDate(opuDateTime, 0, '10:00');
            tasks.push({ id: `${baseId}-embryo-action`, title: 'Identify & Count Oocytes', description: 'Count mature oocytes from follicular fluid.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as OocyteIdentificationData, dueDate: postOpuTime, durationMinutes: 45, resourceRequired: 'Lab' });
            tasks.push({ id: `${baseId}-nurse-post`, title: 'Post-OPU Recovery', description: 'Monitor patient and provide post-op care.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as OpuPostOpData, dueDate: postOpuTime, durationMinutes: 60, resourceRequired: null });
            break;
        case 'Fertilization':
            const fertTime = getRelativeDate(patientStartDate, 7, '12:00');
            tasks.push({ id: `${baseId}-embryo-sperm`, title: 'Sperm Analysis', description: 'Analyze sperm sample.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as SpermAnalysisData, dueDate: fertTime, durationMinutes: 30, resourceRequired: 'Lab' });

            const fertActionDate = getRelativeDate(fertTime, 0, '12:30');
            tasks.push({ id: `${baseId}-embryo-prep`, title: 'Fertilization Preparation', description: 'Prepare lab for fertilization procedure.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as FertilizationPrepData, dueDate: fertActionDate, durationMinutes: 30, resourceRequired: 'Lab' });
            
            const performFertDate = getRelativeDate(fertActionDate, 0, '13:00');
            tasks.push({ id: `${baseId}-embryo-action`, title: 'Perform ICSI/IVF', description: 'Fertilize mature eggs.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as FertilizationData, dueDate: performFertDate, durationMinutes: 90, resourceRequired: 'Lab' });
            
            const postFertCheckDate = getRelativeDate(performFertDate, 1, '09:00');
            tasks.push({ id: `${baseId}-embryo-post`, title: 'Post-Fertilization Check (Day 1)', description: 'Check for 2PN.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as PostFertilizationCheckData, dueDate: postFertCheckDate, durationMinutes: 45, resourceRequired: 'Lab' });
            break;
        case 'Embryo Culture':
            tasks.push({ id: `${baseId}-embryo-d3`, title: 'Day 3 Check', description: 'Assess embryo development.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as Day3CheckData, dueDate: getRelativeDate(patientStartDate, 10, '09:00'), durationMinutes: 60, resourceRequired: 'Lab' });
            tasks.push({ id: `${baseId}-embryo-d5`, title: 'Day 5 Check & Grading', description: 'Assess blastocyst quality and grade.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as EmbryoGradingData, dueDate: getRelativeDate(patientStartDate, 12, '10:00'), durationMinutes: 75, resourceRequired: 'Lab' });
            break;
        case 'Embryo Transfer':
             const transferDateTime = getRelativeDate(patientStartDate, 12, '14:00');
             tasks.push({ id: `${baseId}-embryo-prep`, title: 'Embryo Lab Preparation', description: 'Prepare selected embryo for transfer.', assignedTo: UserRole.Embryologist, status: TaskStatus.Pending, data: {} as EmbryoLabPrepData, dueDate: transferDateTime, durationMinutes: 60, resourceRequired: 'Lab' });
             
             const clinicalPrepDate = getRelativeDate(transferDateTime, 0, '14:30');
             tasks.push({ id: `${baseId}-nurse-prep`, title: 'Clinical Transfer Preparation', description: 'Prepare patient for embryo transfer.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as TransferPrepData, dueDate: clinicalPrepDate, durationMinutes: 30, resourceRequired: null });
             
             const performTransferDate = getRelativeDate(clinicalPrepDate, 0, '15:00');
             tasks.push({ id: `${baseId}-doc-action`, title: 'Perform Transfer', description: 'Transfer selected embryo(s).', assignedTo: UserRole.Doctor, status: TaskStatus.Pending, data: {} as EmbryoTransferData, dueDate: performTransferDate, durationMinutes: 30, resourceRequired: 'OT' });
             
             const postTransferDate = getRelativeDate(performTransferDate, 0, '15:30');
             tasks.push({ id: `${baseId}-nurse-post`, title: 'Post-Transfer Care', description: 'Provide care after embryo transfer.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as TransferPostCareData, dueDate: postTransferDate, durationMinutes: 30, resourceRequired: null });
             break;
        case 'Pregnancy Test':
            tasks.push({ id: `${baseId}-nurse-1`, title: 'hCG Blood Test', description: 'Perform blood test to check for pregnancy.', assignedTo: UserRole.Nurse, status: TaskStatus.Pending, data: {} as HcgData, dueDate: getRelativeDate(patientStartDate, 24, '10:00'), durationMinutes: 15, resourceRequired: null });
            break;
    }
    return tasks;
}


const MOCK_PATHWAY_STEPS_TEMPLATE: Omit<PatientPathwayStep, 'tasks' | 'stepStatus'>[] = [
    { stepId: 'step-1', stepName: 'Initial Consultation' },
    { stepId: 'step-2', stepName: 'Ovarian Stimulation' },
    { stepId: 'step-3', stepName: 'Egg Retrieval' },
    { stepId: 'step-4', stepName: 'Fertilization' },
    { stepId: 'step-5', stepName: 'Embryo Culture' },
    { stepId: 'step-6', stepName: 'Embryo Transfer' },
    { stepId: 'step-7', stepName: 'Pregnancy Test' },
];

const createPatientPathway = (patientId: string, cycleStartDate: string): PatientPathwayStep[] => {
    return MOCK_PATHWAY_STEPS_TEMPLATE.map(step => ({
        ...step,
        stepStatus: 'upcoming',
        tasks: generateTasksForStep(step.stepId, step.stepName, patientId, cycleStartDate)
    }));
};

// Demo mode for sales demonstrations with comprehensive Indian patient data
// Set DEMO_MODE=true for sales demos, false for production
const DEMO_MODE = process.env.DEMO_MODE !== 'false'; // Default to true for demos

let allPatients: Patient[] = DEMO_MODE ? [
    // Patient 1: Fresh consultation - showcases initial assessment and AI analysis
    {
        id: 'patient-001',
        name: 'Priya Sharma',
        age: 32,
        partnerName: 'Rajesh Sharma',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date().toISOString().split('T')[0], // Today
        pathway: [],
    },
    // Patient 2: Mid-stimulation - showcases medication AI and follicle scan AI
    {
        id: 'patient-002',
        name: 'Meera Patel',
        age: 28,
        partnerName: 'Arjun Patel',
        protocol: 'Long Agonist Protocol',
        cycleStartDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
        pathway: [],
    },
    // Patient 3: Ready for retrieval - showcases advanced monitoring
    {
        id: 'patient-003',
        name: 'Lakshmi Reddy',
        age: 35,
        partnerName: 'Venkat Reddy',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days ago
        pathway: [],
    },
    // Patient 4: Lab phase - showcases embryology AI features
    {
        id: 'patient-004',
        name: 'Kavya Iyer',
        age: 30,
        partnerName: 'Arun Iyer',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 16 days ago
        pathway: [],
    },
    // Patient 5: Transfer ready - showcases embryo grading AI
    {
        id: 'patient-005',
        name: 'Ananya Gupta',
        age: 33,
        partnerName: 'Vikram Gupta',
        protocol: 'Long Agonist Protocol',
        cycleStartDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 19 days ago
        pathway: [],
    },
    // Patient 6: Post-transfer - showcases outcome tracking
    {
        id: 'patient-006',
        name: 'Deepika Singh',
        age: 29,
        partnerName: 'Rohit Singh',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 26 days ago
        pathway: [],
    },
    // Patient 7: Success story - showcases positive outcomes and counseling
    {
        id: 'patient-007',
        name: 'Sneha Joshi',
        age: 31,
        partnerName: 'Amit Joshi',
        protocol: 'Long Agonist Protocol',
        cycleStartDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days ago
        pathway: [],
    }
].map(p => ({...p, pathway: createPatientPathway(p.id, p.cycleStartDate)})) : [];

// --- Pre-process mock data to set initial statuses ---

// --- Helper function to update task data and status ---
const updateTask = (patient: Patient, taskTitle: string, data: any, status: TaskStatus = TaskStatus.Completed) => {
    patient.pathway.forEach(step => {
        const task = step.tasks.find(t => t.title === taskTitle);
        if (task) {
            task.data = data;
            task.status = status;
        }
    });
};

// --- Patient 001: Set up for conflict ---
const patient1 = allPatients.find(p => p.id === 'patient-001')!;
const opuTask1 = patient1.pathway.find(s => s.stepName === "Egg Retrieval")?.tasks.find(t => t.title === "Perform OPU");
if (opuTask1) opuTask1.dueDate = getRelativeDate(patient1.cycleStartDate, 7, '09:00');

// --- Patient 002: Set up for conflict ---
const patient2 = allPatients.find(p => p.id === 'patient-002')!;
const opuTask2 = patient2.pathway.find(s => s.stepName === "Egg Retrieval")?.tasks.find(t => t.title === "Perform OPU");
if (opuTask2) opuTask2.dueDate = getRelativeDate(patient2.cycleStartDate, 7, '09:30'); // This creates the conflict

// --- Patient 004: Completed Successful Cycle ---
const patient4 = allPatients.find(p => p.id === 'patient-004')!;
updateTask(patient4, 'Review Patient History', { reviewed: 'Yes', diagnoses: [{ main: 'Unexplained Infertility' }], allergies: [], identityVerified: true, identityDocumentBase64: 'mock-base64' });
updateTask(patient4, 'Patient Onboarding', { protocolExplained: true, consentSigned: true });
updateTask(patient4, 'Psychological Assessment', { clinicalNeeds: 'Support during two-week wait.', emotionalNeeds: 'High anxiety about cycle outcome.', persona: 'The Hopeful Worrier', interventionPlan: 'Weekly check-ins, provide journaling prompts.' });
updateTask(patient4, 'Prescribe Medication', { medication: 'Gonal-F', dosage: '225 IU', frequency: 'Daily', duration: '11 days', explanation: 'Standard dose for age.' });
updateTask(patient4, 'Follicle Scan #1', { measurements: [{ ovary: 'Right', count: 6, sizes: [12, 11, 11, 10, 10, 9] }, { ovary: 'Left', count: 5, sizes: [12, 12, 10, 9, 9] }], endometrium: { thickness: 8, pattern: 'Trilaminar' } });
updateTask(patient4, 'Follicle Scan #2', { measurements: [{ ovary: 'Right', count: 6, sizes: [18, 17, 17, 16, 16, 15] }, { ovary: 'Left', count: 5, sizes: [18, 18, 17, 16, 15] }], endometrium: { thickness: 11, pattern: 'Trilaminar' } });
updateTask(patient4, 'OPU Preparation', { checklist: { patientIdVerified: true, anesthesiaConsentSigned: true, procedureRoomReady: true }, isComplete: true });
updateTask(patient4, 'Perform OPU', { folliclesAspiratedRight: 6, folliclesAspiratedLeft: 5 });
updateTask(patient4, 'Identify & Count Oocytes', { totalRetrieved: 12, miiCount: 10, miCount: 1, gvCount: 1, degenerateCount: 0 });
updateTask(patient4, 'Post-OPU Recovery', { checklist: { patientStable: true, postOpInstructionsGiven: true, followUpScheduled: true }, isComplete: true });
updateTask(patient4, 'Sperm Analysis', { count: 60, motility: 55, morphology: 7 });
updateTask(patient4, 'Fertilization Preparation', { checklist: { spermVerified: true, dishesPrepared: true, incubatorConfirmed: true }, isComplete: true });
updateTask(patient4, 'Perform ICSI/IVF', { oocytesInseminated: 10, method: 'ICSI' });
updateTask(patient4, 'Post-Fertilization Check (Day 1)', { twoPn_count: 8, notes: 'Two oocytes did not fertilize.' });
const day3embryos: Day3EmbryoDetails[] = Array.from({length: 8}, (_, i) => ({ id: `emb-${i+1}`, cellNumber: 8, fragmentation: '<10%' }));
day3embryos[7].cellNumber = 6;
updateTask(patient4, 'Day 3 Check', { embryos: day3embryos });
updateTask(patient4, 'Day 5 Check & Grading', { embryos: [ { id: 'emb-1', grade: '4AA', pgtStatus: 'Euploid' }, { id: 'emb-2', grade: '4AB', pgtStatus: 'Euploid' }, { id: 'emb-3', grade: '3BB', pgtStatus: 'Untested' }, { id: 'emb-4', grade: '3BC', pgtStatus: 'Untested' } ] });
updateTask(patient4, 'Embryo Lab Preparation', { embryoIdSelected: 'emb-1', checklist: { warmingProtocolFollowed: true, mediaEquilibrated: true, patientIdMatched: true }, isComplete: true });
updateTask(patient4, 'Clinical Transfer Preparation', { checklist: { patientReady: true, bladderProtocolFollowed: true, consentVerified: true }, isComplete: true });
updateTask(patient4, 'Perform Transfer', { embryosTransferredCount: 1, catheterType: 'Soft', transferDifficulty: 'Easy' });
updateTask(patient4, 'Post-Transfer Care', { checklist: { patientRested: true, postProcedureInstructionsGiven: true }, isComplete: true });
updateTask(patient4, 'hCG Blood Test', { hcgValue: 250, interpretation: 'Positive, consistent with a viable pregnancy.' });

// --- Patient 005: Cancelled Cycle ---
const patient5 = allPatients.find(p => p.id === 'patient-005')!;
updateTask(patient5, 'Review Patient History', { reviewed: 'Yes', diagnoses: [{ main: 'Female Factor - Ovarian', sub: ['Diminished Ovarian Reserve (DOR)'] }], identityVerified: true, identityDocumentBase64: 'mock-base64' });
updateTask(patient5, 'Patient Onboarding', { protocolExplained: true, consentSigned: true });
updateTask(patient5, 'Prescribe Medication', { medication: 'Menopur', dosage: '300 IU', frequency: 'Daily', duration: '12 days' });
updateTask(patient5, 'Follicle Scan #1', { measurements: [{ ovary: 'Right', count: 3, sizes: [10, 9, 9] }, { ovary: 'Left', count: 2, sizes: [10, 8] }], endometrium: { thickness: 7, pattern: 'Trilaminar' } });
updateTask(patient5, 'Follicle Scan #2', { measurements: [{ ovary: 'Right', count: 3, sizes: [12, 11, 10] }, { ovary: 'Left', count: 2, sizes: [11, 9] }], notes: 'Poor response to stimulation. Discuss cancellation with patient.' });
// Mark subsequent tasks as On Hold
patient5.pathway.forEach(step => {
    if (['Egg Retrieval', 'Fertilization', 'Embryo Culture', 'Embryo Transfer', 'Pregnancy Test'].includes(step.stepName)) {
        step.tasks.forEach(task => task.status = TaskStatus.OnHold);
    }
});


// Set realistic clinical data and progress for each patient
const today = new Date('2024-07-22T08:00:00Z');

// Helper function to complete tasks and add realistic data
const completeTaskWithData = (patient: Patient, stepName: string, taskTitle: string, data: any) => {
    const step = patient.pathway.find(s => s.stepName === stepName);
    if (step) {
        const task = step.tasks.find(t => t.title === taskTitle);
        if (task) {
            task.status = TaskStatus.Completed;
            task.data = { ...task.data, ...data };
        }
    }
};

// COMPREHENSIVE DEMO DATA FOR SALES DEMONSTRATIONS
// Showcases ALL AI features with realistic Indian patient scenarios

// Patient 1 (Priya Sharma): Fresh consultation - showcases AI history analysis
const priya = allPatients.find(p => p.id === 'patient-001');
if (priya) {
    // Fresh patient - ready for AI-powered initial assessment
    // This showcases the AI analysis for new patient onboarding
}

// Patient 2 (Meera Patel): Mid-stimulation - showcases medication AI and monitoring
const meera = allPatients.find(p => p.id === 'patient-002');
if (meera) {
    // Complete Initial Consultation with comprehensive data
    completeTaskWithData(meera, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'PCOS', sub: ['Insulin Resistance', 'Irregular Cycles'] }],
        allergies: ['Sulfa drugs'],
        notes: 'First IVF cycle. PCOS with good ovarian reserve. AMH: 4.2 ng/mL. Patient from Gujarat, vegetarian diet.',
        identityVerified: true,
        medicalHistory: {
            diabetes: false,
            hypertension: false,
            thyroid: 'Subclinical hypothyroidism - on levothyroxine 50mcg',
            previousSurgeries: 'Laparoscopic ovarian drilling (2022)'
        }
    });

    completeTaskWithData(meera, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true,
        financialCounseling: 'Insurance covers 50%, patient paying ₹1,25,000',
        culturalConsiderations: 'Gujarati family, vegetarian preferences for medications'
    });

    completeTaskWithData(emily, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true,
        patientQuestions: 'Asked about success rates and side effects. All questions answered.'
    });

    // AI-powered medication prescription - showcases dosing algorithm
    completeTaskWithData(meera, 'Ovarian Stimulation', 'Prescribe Medication', {
        medication: 'Gonal-F',
        dosage: '150 IU', // Lower dose due to PCOS and high AMH
        frequency: 'Daily',
        duration: '8-10 days',
        explanation: 'AI-recommended lower starting dose due to PCOS and AMH 4.2. Risk of OHSS - careful monitoring required.',
        aiRecommendation: {
            reasoning: 'PCOS patients with AMH >4.0 have 3x higher OHSS risk. Starting with 150 IU reduces risk by 40%.',
            confidence: 92,
            alternatives: ['Letrozole + FSH protocol', 'Antagonist with lower dose']
        }
    });

    // AI-powered follicle scan analysis - showcases image analysis
    completeTaskWithData(meera, 'Ovarian Stimulation', 'Follicle Scan (Day 6)', {
        measurements: [
            { ovary: 'Right', count: 12, sizes: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3] },
            { ovary: 'Left', count: 10, sizes: [13, 12, 11, 10, 9, 8, 7, 6, 5, 4] }
        ],
        endometrium: { thickness: 8.1, pattern: 'Trilaminar' },
        notes: 'Excellent response - 22 follicles total. AI suggests reducing dose to prevent OHSS.',
        isVerified: true,
        aiAnalysis: {
            follicleCount: 22,
            leadFollicles: 6,
            ohssRisk: 'Moderate-High',
            recommendation: 'Reduce Gonal-F to 112.5 IU, add Cetrotide from Day 7',
            confidence: 89
        }
    });

    // Psychological assessment with AI insights
    completeTaskWithData(meera, 'Initial Consultation', 'Psychological Assessment', {
        clinicalNeeds: 'Anxiety about OHSS risk, cultural pressure from family',
        emotionalNeeds: 'Support for managing expectations, stress reduction techniques',
        financialNeeds: 'Concerned about additional costs if cycle cancelled',
        aiPersona: 'Anxious Perfectionist with Cultural Pressure',
        interventionPlan: 'CBT + Cultural counseling + Family education session',
        culturalConsiderations: 'Joint family system, religious considerations for treatment timing'
    });
}

// Patient 3 (Lakshmi Reddy): Ready for egg retrieval - showcases advanced monitoring
const lakshmi = allPatients.find(p => p.id === 'patient-003');
if (lakshmi) {
    // Complete comprehensive consultation
    completeTaskWithData(lakshmi, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 1,
        diagnoses: [{ main: 'Diminished Ovarian Reserve', sub: ['Advanced Maternal Age', 'Low AMH'] }],
        notes: 'Previous cycle: 4 eggs retrieved, 2 fertilized, 1 transferred - BFN. AMH: 1.1 ng/mL. From Hyderabad.',
        identityVerified: true,
        medicalHistory: {
            diabetes: false,
            hypertension: 'Controlled on Amlodipine 5mg',
            thyroid: 'Normal',
            previousSurgeries: 'Appendectomy (2015)'
        }
    });

    completeTaskWithData(lakshmi, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true,
        financialCounseling: 'Self-funded - ₹2,50,000 budget',
        culturalConsiderations: 'Telugu family, traditional values, husband very supportive'
    });

    // High-dose protocol with AI optimization for poor responder
    completeTaskWithData(lakshmi, 'Ovarian Stimulation', 'Prescribe Medication', {
        medication: 'Gonal-F + Menopur',
        dosage: '300 IU + 150 IU',
        frequency: 'Daily',
        duration: '12 days',
        explanation: 'AI-optimized high dose protocol for DOR. Menopur added for LH activity to improve egg quality.',
        aiRecommendation: {
            reasoning: 'Previous cycle analysis shows better response to dual stimulation. 23% higher maturation rate with Menopur.',
            confidence: 87,
            expectedOutcome: '6-8 follicles, 4-5 mature eggs'
        }
    });

    // AI-powered follicle monitoring with detailed analysis
    completeTaskWithData(lakshmi, 'Ovarian Stimulation', 'Follicle Scan (Day 6)', {
        measurements: [
            { ovary: 'Right', count: 4, sizes: [11, 10, 9, 8] },
            { ovary: 'Left', count: 3, sizes: [10, 9, 8] }
        ],
        endometrium: { thickness: 7.2, pattern: 'Trilaminar' },
        notes: 'Better response than previous cycle. AI predicts good outcome.',
        isVerified: true,
        aiAnalysis: {
            follicleCount: 7,
            growthRate: 'Optimal for DOR',
            prediction: '5-6 mature eggs expected',
            confidence: 84
        }
    });

    completeTaskWithData(lakshmi, 'Ovarian Stimulation', 'Follicle Scan (Day 10)', {
        measurements: [
            { ovary: 'Right', count: 4, sizes: [17, 16, 15, 14] },
            { ovary: 'Left', count: 3, sizes: [16, 15, 14] }
        ],
        endometrium: { thickness: 9.1, pattern: 'Trilaminar' },
        notes: 'Excellent response! Ready for trigger. AI confirms optimal timing.',
        isVerified: true,
        aiAnalysis: {
            triggerRecommendation: 'Trigger tonight - optimal maturation window',
            expectedMatureEggs: 6,
            retrievalTiming: '36 hours post-trigger'
        }
    });

    // Psychological assessment with cultural considerations
    completeTaskWithData(lakshmi, 'Ovarian Stimulation', 'Psychological Assessment', {
        clinicalNeeds: 'Anxiety about age-related risks, previous cycle failure trauma',
        emotionalNeeds: 'Support for managing expectations, grief processing from previous BFN',
        financialNeeds: 'Financial stress - using savings for second attempt',
        aiPersona: 'Experienced Veteran with Realistic Expectations',
        interventionPlan: 'Grief counseling + Expectation management + Partner support sessions',
        culturalConsiderations: 'Telugu family traditions, religious prayers for success',
        assessmentComplete: true
    });
}

// Patient 4 (Kavya Iyer): Lab phase - showcases embryology AI features
const kavya = allPatients.find(p => p.id === 'patient-004');
if (kavya) {
    // Complete consultation and stimulation phases
    completeTaskWithData(kavya, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Male Factor Infertility', sub: ['Severe Oligoasthenospermia'] }],
        notes: 'Husband has severe sperm issues. ICSI mandatory. From Chennai, both software engineers.',
        identityVerified: true,
        medicalHistory: {
            diabetes: false,
            hypertension: false,
            thyroid: 'Normal',
            previousSurgeries: 'None'
        }
    });

    completeTaskWithData(kavya, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true,
        financialCounseling: 'Corporate insurance covers 80% - ₹50,000 out of pocket',
        culturalConsiderations: 'South Indian Tamil family, both highly educated, analytical approach to treatment'
    });

    // AI-powered sperm analysis showcasing WHO 2021 standards
    completeTaskWithData(kavya, 'Fertilization', 'Sperm Analysis', {
        sampleId: 'SP-2024-0722-004',
        count: 2.1, // Severe oligospermia
        motility: 15, // Asthenospermia
        morphology: 2, // Teratospermia
        volume: 3.2,
        ph: 7.8,
        notes: 'Severe oligoasthenoteratospermia. ICSI mandatory.',
        isVerified: true,
        aiAnalysis: {
            who2021Classification: 'Severe OAT syndrome',
            icsiRecommendation: 'Mandatory - conventional IVF not viable',
            spermSelection: 'IMSI recommended for optimal sperm selection',
            fertilizationRate: 'Expected 70-80% with ICSI',
            confidence: 94
        }
    });

    // Excellent egg retrieval showcasing oocyte AI analysis
    completeTaskWithData(kavya, 'Egg Retrieval', 'Identify & Count Oocytes', {
        totalOocytes: 15,
        matureOocytes: 13,
        notes: 'Excellent retrieval! 13 mature MII oocytes. AI confirms optimal quality.',
        isVerified: true,
        aiAnalysis: {
            maturityAssessment: 'Excellent - 87% maturation rate',
            qualityGrading: '11 Grade A, 2 Grade B oocytes',
            icsiSuitability: 'All 13 suitable for ICSI',
            expectedFertilization: '9-11 embryos predicted'
        }
    });
    // AI-powered ICSI procedure with detailed tracking
    completeTaskWithData(kavya, 'Fertilization', 'Perform Fertilization (ICSI)', {
        fertilizationMethod: 'ICSI',
        oocytesInseminated: 13,
        notes: 'ICSI performed on all 13 mature oocytes. AI-guided sperm selection used.',
        aiGuidance: {
            spermSelectionMethod: 'AI-enhanced morphology assessment',
            injectionSuccess: '100% - all oocytes survived injection',
            technicalNotes: 'Optimal sperm selected using AI pattern recognition'
        }
    });

    // Excellent fertilization results showcasing AI prediction accuracy
    completeTaskWithData(kavya, 'Fertilization', 'Post-Fertilization Check (Day 1)', {
        normalFertilization: 11,
        abnormalFertilization: 1,
        unfertilized: 1,
        notes: '11 normally fertilized embryos (2PN). Excellent 85% fertilization rate!',
        aiAnalysis: {
            fertilizationRate: '85% - exceeds predicted 70-80%',
            embryoQuality: 'High quality 2PN embryos observed',
            developmentPrediction: '8-9 blastocysts expected by Day 5'
        }
    });

    // AI-powered embryo development tracking
    completeTaskWithData(kavya, 'Embryo Culture', 'Day 3 Check', {
        embryos: [
            { id: 'embryo-1', cellCount: 8, grade: 'A', fragmentation: 5, aiScore: 9.2 },
            { id: 'embryo-2', cellCount: 8, grade: 'A', fragmentation: 8, aiScore: 8.9 },
            { id: 'embryo-3', cellCount: 7, grade: 'A', fragmentation: 10, aiScore: 8.5 },
            { id: 'embryo-4', cellCount: 8, grade: 'A', fragmentation: 5, aiScore: 9.1 },
            { id: 'embryo-5', cellCount: 6, grade: 'B', fragmentation: 15, aiScore: 7.8 },
            { id: 'embryo-6', cellCount: 7, grade: 'A', fragmentation: 12, aiScore: 8.2 },
            { id: 'embryo-7', cellCount: 8, grade: 'A', fragmentation: 8, aiScore: 8.7 },
            { id: 'embryo-8', cellCount: 6, grade: 'B', fragmentation: 20, aiScore: 7.2 }
        ],
        notes: '8 embryos developing well. AI predicts 6 will reach blastocyst stage.',
        aiAnalysis: {
            topEmbryos: ['embryo-1', 'embryo-4', 'embryo-2'],
            blastocystPrediction: '6 embryos likely to reach Day 5',
            transferRecommendation: 'Single embryo transfer recommended - excellent quality'
        }
    });
}

// Patient 5 (Ananya Gupta): Transfer ready - showcases embryo grading AI
const ananya = allPatients.find(p => p.id === 'patient-005');
if (ananya) {
    // Complete consultation with comprehensive history
    completeTaskWithData(ananya, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Endometriosis', sub: ['Stage III', 'Bilateral Endometriomas'] }],
        notes: 'Laparoscopy 8 months ago. Endometriomas removed. AMH: 2.8 ng/mL. From Delhi, working in finance.',
        identityVerified: true,
        medicalHistory: {
            diabetes: false,
            hypertension: false,
            thyroid: 'Subclinical hypothyroidism - on 25mcg levothyroxine',
            previousSurgeries: 'Laparoscopic cystectomy for endometriomas (2023)'
        }
    });

    // AI-powered embryo development tracking with detailed analysis
    completeTaskWithData(ananya, 'Embryo Culture', 'Day 3 Check', {
        embryos: [
            { id: 'embryo-1', cellCount: 8, grade: 'A', fragmentation: 5, aiScore: 9.4 },
            { id: 'embryo-2', cellCount: 8, grade: 'A', fragmentation: 8, aiScore: 9.1 },
            { id: 'embryo-3', cellCount: 7, grade: 'A', fragmentation: 12, aiScore: 8.6 },
            { id: 'embryo-4', cellCount: 8, grade: 'A', fragmentation: 6, aiScore: 9.0 },
            { id: 'embryo-5', cellCount: 6, grade: 'B', fragmentation: 18, aiScore: 7.5 },
            { id: 'embryo-6', cellCount: 7, grade: 'A', fragmentation: 10, aiScore: 8.3 }
        ],
        notes: '6 embryos developing excellently. AI predicts 5 will reach high-quality blastocyst stage.',
        isVerified: true,
        aiAnalysis: {
            developmentRate: 'Excellent - 100% on track',
            qualityPrediction: '5 top-grade blastocysts expected',
            transferRecommendation: 'Single embryo transfer - multiple excellent options'
        }
    });

    // AI-powered blastocyst grading showcasing advanced image analysis
    completeTaskWithData(ananya, 'Embryo Culture', 'Day 5 Check & Grading', {
        embryos: [
            {
                id: 'embryo-1',
                grade: '5AA',
                pgtStatus: 'Untested',
                notes: 'Hatching blastocyst - exceptional quality. AI confidence: 96%',
                aiGrading: {
                    expansion: 5,
                    icm: 'A',
                    trophectoderm: 'A',
                    aiConfidence: 96,
                    implantationPotential: 'Very High (65-70%)',
                    morphokinetics: 'Optimal timing patterns'
                }
            },
            {
                id: 'embryo-2',
                grade: '4AA',
                pgtStatus: 'Untested',
                notes: 'Excellent expanded blastocyst. AI confidence: 94%',
                aiGrading: {
                    expansion: 4,
                    icm: 'A',
                    trophectoderm: 'A',
                    aiConfidence: 94,
                    implantationPotential: 'High (60-65%)',
                    morphokinetics: 'Excellent development'
                }
            },
            {
                grade: '4AB',
                pgtStatus: 'Untested',
                notes: 'Very good blastocyst. AI confidence: 89%',
                aiGrading: {
                    expansion: 4,
                    icm: 'A',
                    trophectoderm: 'B',
                    aiConfidence: 89,
                    implantationPotential: 'Good (50-55%)',
                    morphokinetics: 'Good development pattern'
                }
            },
            {
                id: 'embryo-3',
                grade: '3AB',
                pgtStatus: 'Untested',
                notes: 'Good quality blastocyst for freezing. AI confidence: 85%',
                aiGrading: {
                    expansion: 3,
                    icm: 'A',
                    trophectoderm: 'B',
                    aiConfidence: 85,
                    implantationPotential: 'Moderate (45-50%)',
                    morphokinetics: 'Slightly delayed but good quality'
                }
            }
        ],
        notes: '5 excellent blastocysts! AI recommends single embryo transfer with embryo-1.',
        aiAnalysis: {
            transferRecommendation: 'Embryo-1 (5AA) - highest implantation potential',
            freezingPlan: '4 embryos for cryopreservation',
            successPrediction: '68% live birth rate with selected embryo'
        }
    });

    // AI-powered transfer planning
    completeTaskWithData(ananya, 'Embryo Transfer', 'Transfer Planning', {
        selectedEmbryo: 'embryo-1',
        embryoGrade: '5AA',
        transferDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endometrialPreparation: 'Natural cycle - optimal thickness 10.2mm',
        notes: 'AI-selected best embryo. Patient counseled on excellent prognosis.',
        aiGuidance: {
            optimalTiming: 'Day 5 post-ovulation confirmed',
            implantationWindow: 'Perfect - receptivity markers positive',
            successPrediction: '68% live birth probability'
        }
    });
}

// Patient 6 (Deepika Singh): Post-transfer - showcases outcome tracking
const deepika = allPatients.find(p => p.id === 'patient-006');
if (deepika) {
    // Complete consultation with detailed history
    completeTaskWithData(deepika, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'PCOS', sub: ['Insulin Resistance', 'Obesity'] }],
        notes: 'PCOS with BMI 32. On metformin. Good response expected. From Mumbai, works in marketing.',
        identityVerified: true,
        medicalHistory: {
            diabetes: 'Pre-diabetic - on metformin 500mg BD',
            hypertension: false,
            thyroid: 'Normal',
            previousSurgeries: 'None'
        }
    });

    // AI-guided transfer procedure
    completeTaskWithData(deepika, 'Embryo Transfer', 'Embryo Transfer Procedure', {
        embryosTransferred: 1,
        embryoGrades: ['4AA'],
        transferDifficulty: 'Easy',
        catheterType: 'Soft',
        notes: 'Single excellent blastocyst transferred. AI-optimized timing. Smooth procedure.',
        isVerified: true,
        aiGuidance: {
            transferTiming: 'Optimal - Day 5 post-ovulation',
            embryoSelection: 'AI-selected best quality embryo',
            implantationPrediction: '62% success probability'
        }
    });

    // Post-transfer monitoring with AI insights
    completeTaskWithData(deepika, 'Post-Transfer Care', 'Post-Transfer Instructions', {
        medicationsGiven: ['Progesterone 400mg BD', 'Folic acid 5mg', 'Aspirin 75mg'],
        restrictions: 'Normal activity, avoid heavy lifting, no bed rest required',
        followUpDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Patient counseled on symptoms to watch for. AI predicts good outcome.',
        aiMonitoring: {
            riskFactors: 'Low risk - excellent embryo quality',
            symptomPrediction: 'Mild cramping expected Days 6-8',
            successIndicators: 'Monitor for implantation bleeding Day 7-10'
        }
    });
}

// Patient 7 (Sneha Joshi): Success story - showcases positive outcomes and counseling
const sneha = allPatients.find(p => p.id === 'patient-007');
if (sneha) {
    // Complete consultation with comprehensive history
    completeTaskWithData(sneha, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Tubal Factor Infertility', sub: ['Bilateral Hydrosalpinx'] }],
        notes: 'Bilateral tubal damage from PID. Tubes removed laparoscopically. Excellent prognosis. From Pune, teacher.',
        identityVerified: true,
        medicalHistory: {
            diabetes: false,
            hypertension: false,
            thyroid: 'Normal',
            previousSurgeries: 'Bilateral salpingectomy for hydrosalpinx (2023)'
        }
    });

    // AI-powered hCG interpretation showcasing positive outcome
    completeTaskWithData(sneha, 'Pregnancy Test', 'hCG Blood Test', {
        hcgValue: 342,
        testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interpretation: 'POSITIVE! Strong hCG level indicating healthy pregnancy.',
        isVerified: true,
        aiAnalysis: {
            pregnancyViability: 'Excellent - hCG level indicates strong implantation',
            twinPrediction: 'Single pregnancy likely (hCG range normal for singleton)',
            nextSteps: 'Repeat hCG in 48 hours, scan at 6-7 weeks',
            riskAssessment: 'Low risk - excellent early indicators'
        }
    });

    // Comprehensive psychological support showcasing counseling success
    completeTaskWithData(sneha, 'Post-Transfer Care', 'Psychological Support', {
        clinicalNeeds: 'Anxiety about early pregnancy symptoms, fear of miscarriage',
        emotionalNeeds: 'Celebration support, managing excitement vs. caution',
        culturalNeeds: 'Family announcement timing, religious gratitude practices',
        aiPersona: 'Cautiously Optimistic Success Story',
        interventionPlan: 'Early pregnancy support + Family counseling + Celebration guidance',
        culturalConsiderations: 'Marathi traditions for pregnancy announcements, religious ceremonies',
        outcomeNotes: 'Patient extremely grateful for AI-guided treatment success'
    });

    // Follow-up hCG showing excellent progression
    completeTaskWithData(sneha, 'Pregnancy Test', 'Follow-up hCG', {
        hcgValue: 687,
        testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interpretation: 'Excellent doubling! Pregnancy progressing perfectly.',
        isVerified: true,
        aiAnalysis: {
            doublingTime: '48 hours - perfect progression',
            pregnancyViability: 'Excellent - 95% chance of ongoing pregnancy',
            scanRecommendation: 'Transvaginal scan at 6 weeks to confirm fetal heartbeat'
        }
    });
}

// Now set the step statuses based on completed tasks and current date
allPatients.forEach(patient => {
    let activeStepFound = false;
    patient.pathway.forEach(step => {
        let firstTaskDate: Date | null = null;
        if (step.tasks.length > 0) {
            firstTaskDate = new Date(step.tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate);
        }

        const allTasksInStepCompletedOrOnHold = step.tasks.every(t => t.status === TaskStatus.Completed || t.status === TaskStatus.OnHold);

        if (allTasksInStepCompletedOrOnHold) {
            step.stepStatus = 'completed';
        } else if (!activeStepFound && firstTaskDate && firstTaskDate <= today) {
            step.stepStatus = 'active';
            activeStepFound = true;
        } else {
            step.stepStatus = 'upcoming';
        }
    });

    // If no active step found but we have completed steps, make the next incomplete step active
    if (!activeStepFound) {
        const firstIncompleteStep = patient.pathway.find(step =>
            step.tasks.some(task => task.status !== TaskStatus.Completed)
        );
        if (firstIncompleteStep) {
            firstIncompleteStep.stepStatus = 'active';
        }
    }
});


export const getAllPatients = (): Promise<Patient[]> => {
  console.log(`Fetching all patient data`);
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(allPatients)));
    }, 500);
  });
};

let patientCounter = 1;
export const createNewPatient = (info: NewPatientOnboardingInfo): Patient => {
    const id = `patient-${String(patientCounter++).padStart(3, '0')}`;
    const pathway = createPatientPathway(id, info.cycleStartDate);
    
    const historyStep = pathway.find(step => step.stepId === 'step-1');
    if (historyStep) {
        const historyTask = historyStep.tasks.find(task => task.title === 'Review Patient History');
        if (historyTask) {
            historyTask.data = info.historyData;
            historyTask.status = TaskStatus.Completed;
        }
    }

    let activeStepFound = false;
    pathway.forEach(step => {
        const allTasksCompleted = step.tasks.every(t => t.status === TaskStatus.Completed);
        if (allTasksCompleted) {
             step.stepStatus = 'completed';
        } else if (!activeStepFound) {
            step.stepStatus = 'active';
            activeStepFound = true;
        } else {
            step.stepStatus = 'upcoming';
        }
    });

    if (!activeStepFound && pathway.length > 0) {
        pathway[0].stepStatus = 'active';
    }
    
    const newPatient: Patient = {
        name: info.name,
        age: info.age,
        partnerName: info.partnerName,
        protocol: info.protocol,
        cycleStartDate: info.cycleStartDate,
        id,
        pathway,
    };
    // Add to our in-memory list
    allPatients.push(newPatient);
    return newPatient;
};
