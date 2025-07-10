
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

// Production mode: Start with empty patient list
// To enable demo data for testing, set DEMO_MODE=true in environment variables
const DEMO_MODE = process.env.DEMO_MODE === 'true' || false;

let allPatients: Patient[] = DEMO_MODE ? [
    // Demo patient for testing - remove in production
    {
        id: 'demo-patient-001',
        name: 'Demo Patient',
        age: 30,
        partnerName: 'Demo Partner',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date().toISOString().split('T')[0],
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

// Patient 1 (Sarah Chen): Just starting - no progress yet
// Keep as is - fresh start

// Patient 2 (Emily Rodriguez): Mid-stimulation - completed consultation, on medications
const emily = allPatients.find(p => p.id === 'patient-002');
if (emily) {
    // Complete Initial Consultation
    completeTaskWithData(emily, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Unexplained Infertility' }],
        allergies: ['Penicillin'],
        notes: 'First IVF cycle. Patient anxious but well-informed. Normal AMH levels.',
        identityVerified: true
    });

    completeTaskWithData(emily, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true,
        patientQuestions: 'Asked about success rates and side effects. All questions answered.'
    });

    // Complete first medication prescription
    completeTaskWithData(emily, 'Ovarian Stimulation', 'Prescribe Medication', {
        medication: 'Gonal-F',
        dosage: '225 IU',
        frequency: 'Daily',
        duration: '10 days',
        explanation: 'Standard dose for patient age and AMH levels. Monitor for OHSS.'
    });

    // Complete first follicle scan
    completeTaskWithData(emily, 'Ovarian Stimulation', 'Follicle Scan (Day 6)', {
        measurements: [
            { ovary: 'Right', count: 8, sizes: [12, 11, 10, 9, 8, 7, 6, 5] },
            { ovary: 'Left', count: 6, sizes: [11, 10, 9, 8, 7, 6] }
        ],
        endometrium: { thickness: 7.2, pattern: 'Trilaminar' },
        notes: 'Good response to stimulation. Continue current dose.',
        isVerified: true
    });
}

// Patient 3 (Maria Patel): Ready for egg retrieval - completed stimulation
const maria = allPatients.find(p => p.id === 'patient-003');
if (maria) {
    // Complete all consultation and stimulation tasks
    completeTaskWithData(maria, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 1,
        diagnoses: [{ main: 'Diminished Ovarian Reserve', sub: ['Advanced Maternal Age'] }],
        notes: 'Previous cycle cancelled due to poor response. Increased stimulation protocol.',
        identityVerified: true
    });

    completeTaskWithData(maria, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true
    });

    completeTaskWithData(maria, 'Ovarian Stimulation', 'Prescribe Medication', {
        medication: 'Menopur',
        dosage: '300 IU',
        frequency: 'Daily',
        duration: '12 days',
        explanation: 'High dose protocol due to previous poor response and age.'
    });

    // Complete all follicle scans
    completeTaskWithData(maria, 'Ovarian Stimulation', 'Follicle Scan (Day 6)', {
        measurements: [
            { ovary: 'Right', count: 4, sizes: [14, 12, 10, 8] },
            { ovary: 'Left', count: 3, sizes: [13, 11, 9] }
        ],
        endometrium: { thickness: 6.8, pattern: 'Trilaminar' },
        notes: 'Slower response than expected. Continue current dose.',
        isVerified: true
    });

    completeTaskWithData(maria, 'Ovarian Stimulation', 'Follicle Scan (Day 10)', {
        measurements: [
            { ovary: 'Right', count: 4, sizes: [18, 17, 16, 14] },
            { ovary: 'Left', count: 3, sizes: [17, 16, 15] }
        ],
        endometrium: { thickness: 9.1, pattern: 'Trilaminar' },
        notes: 'Good final response. Ready for trigger. Schedule OPU.',
        isVerified: true
    });

    completeTaskWithData(maria, 'Ovarian Stimulation', 'Psychological Assessment', {
        clinicalNeeds: 'Patient expressing anxiety about cycle outcome due to previous cancellation.',
        emotionalNeeds: 'Needs reassurance and support. Partner very supportive.',
        financialNeeds: 'Concerned about costs if cycle fails again.',
        persona: 'The Cautious Optimist - experienced but hopeful despite previous setback.',
        interventionPlan: '- Provide regular updates during cycle\n- Schedule check-in call post-retrieval\n- Discuss backup plans if needed',
        assessmentComplete: true
    });
}

// Patient 4 (Jennifer Thompson): Post-fertilization, awaiting Day 3 check
const jennifer = allPatients.find(p => p.id === 'patient-004');
if (jennifer) {
    // Complete consultation, stimulation, and egg retrieval
    completeTaskWithData(jennifer, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Male Factor Infertility', sub: ['Oligospermia'] }],
        notes: 'Partner has low sperm count. ICSI recommended.',
        identityVerified: true
    });

    completeTaskWithData(jennifer, 'Initial Consultation', 'Patient Onboarding', {
        protocolExplained: true,
        consentSigned: true
    });

    // Complete egg retrieval with good results
    completeTaskWithData(jennifer, 'Egg Retrieval', 'Identify & Count Oocytes', {
        totalOocytes: 12,
        matureOocytes: 10,
        notes: 'Excellent retrieval. 10 mature eggs suitable for ICSI.',
        isVerified: true
    });

    // Complete fertilization
    completeTaskWithData(jennifer, 'Fertilization', 'Sperm Analysis', {
        sampleId: 'SP-2024-0722-001',
        count: 8.5,
        motility: 25,
        morphology: 3,
        notes: 'Low parameters confirmed. ICSI performed on all mature oocytes.',
        isVerified: true,
        aiAssessment: {
            assessment: 'Oligoasthenoteratozoospermia (OAT)',
            recommendation: 'ICSI is strongly recommended due to low count, motility, and morphology.'
        }
    });

    completeTaskWithData(jennifer, 'Fertilization', 'Perform Fertilization (ICSI)', {
        fertilizationMethod: 'ICSI',
        oocytesInseminated: 10,
        notes: 'ICSI performed on all 10 mature oocytes due to male factor.'
    });

    completeTaskWithData(jennifer, 'Fertilization', 'Post-Fertilization Check (Day 1)', {
        normalFertilization: 8,
        abnormalFertilization: 1,
        unfertilized: 1,
        notes: '8 normally fertilized embryos (2PN). Good fertilization rate of 80%.'
    });
}

// Patient 5 (Lisa Kim): Ready for embryo transfer
const lisa = allPatients.find(p => p.id === 'patient-005');
if (lisa) {
    // Complete all previous steps and embryo culture
    completeTaskWithData(lisa, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Endometriosis', sub: ['Stage III'] }],
        notes: 'Laparoscopy performed 6 months ago. Good ovarian reserve.',
        identityVerified: true
    });

    completeTaskWithData(lisa, 'Embryo Culture', 'Day 3 Check', {
        embryos: [
            { id: 'embryo-1', cellCount: 8, grade: 'A', fragmentation: 5 },
            { id: 'embryo-2', cellCount: 7, grade: 'A', fragmentation: 10 },
            { id: 'embryo-3', cellCount: 6, grade: 'B', fragmentation: 15 },
            { id: 'embryo-4', cellCount: 8, grade: 'A', fragmentation: 5 },
            { id: 'embryo-5', cellCount: 5, grade: 'C', fragmentation: 25 }
        ],
        notes: '4 good quality embryos continuing to Day 5. 1 poor quality embryo arrested.',
        isVerified: true
    });

    completeTaskWithData(lisa, 'Embryo Culture', 'Day 5 Check & Grading', {
        embryos: [
            {
                id: 'embryo-1',
                grade: '4AA',
                pgtStatus: 'Untested',
                notes: 'Excellent quality blastocyst. Top choice for transfer.'
            },
            {
                id: 'embryo-2',
                grade: '3AB',
                pgtStatus: 'Untested',
                notes: 'Good quality blastocyst. Suitable for transfer or freezing.'
            },
            {
                id: 'embryo-4',
                grade: '4BB',
                pgtStatus: 'Untested',
                notes: 'Good quality blastocyst. Will be frozen.'
            }
        ]
    });
}

// Patient 6 (Amanda Johnson): Awaiting pregnancy test
const amanda = allPatients.find(p => p.id === 'patient-006');
if (amanda) {
    // Complete all steps up to transfer
    completeTaskWithData(amanda, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'PCOS' }],
        notes: 'Well-controlled PCOS. Good prognosis.',
        identityVerified: true
    });

    completeTaskWithData(amanda, 'Embryo Transfer', 'Embryo Transfer Procedure', {
        embryosTransferred: 1,
        embryoGrades: ['5AA'],
        transferDifficulty: 'Easy',
        catheterType: 'Soft',
        notes: 'Single excellent quality blastocyst transferred. Smooth procedure.',
        isVerified: true
    });
}

// Patient 7 (Rachel Williams): Successful pregnancy (completed cycle)
const rachel = allPatients.find(p => p.id === 'patient-007');
if (rachel) {
    // Complete entire cycle with positive result
    completeTaskWithData(rachel, 'Initial Consultation', 'Review Patient History', {
        reviewed: 'Yes',
        previousIVFCycles: 0,
        diagnoses: [{ main: 'Tubal Factor Infertility' }],
        notes: 'Bilateral tubal blockage. IVF indicated.',
        identityVerified: true
    });

    completeTaskWithData(rachel, 'Pregnancy Test', 'hCG Blood Test', {
        hcgValue: 156,
        testDate: '2024-07-09',
        interpretation: 'Positive, consistent with a viable pregnancy.',
        isVerified: true
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
