
export enum UserRole {
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  Embryologist = 'Embryologist',
  Counselor = 'Counselor',
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
}

// --- Specific Data Payloads for Tasks ---

export interface Diagnosis {
    main: string;
    sub?: string[];
}

export interface PatientHistoryData {
  reviewed: 'Yes' | 'No';
  previousIVFCycles?: number;
  diagnoses?: Diagnosis[];
  allergies?: string[];
  notes?: string;
  identityDocumentBase64?: string;
  identityVerified?: boolean;
}

export interface ConsentExplanation {
  question: string;
  answer: string;
}

export interface PatientOnboardingData {
  protocolExplained?: boolean;
  consentSigned?: boolean;
  patientQuestions?: string;
  consentForm?: {
    title: string;
    content: string; 
    explanationPoints: ConsentExplanation[];
  };
}

export interface MedicationData {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  explanation?: string;
}

export interface FollicleMeasurement {
  ovary: 'Right' | 'Left';
  count: number;
  sizes: number[]; // in mm
}

export interface FollicleScanData {
  measurements?: FollicleMeasurement[];
  endometrium?: {
    thickness: number; // e.g., 8
    pattern: 'Trilaminar' | 'Homogenous' | 'Other';
  };
  notes?: string;
  scanImageBase64?: string; // For image uploads
  aiSuggestions?: Record<string, any>;
  isVerified?: boolean;
}

export interface EmbryoDetails {
    id: string; // e.g., embryo-1
    grade: string; // e.g., '4AA'
    pgtStatus?: 'Euploid' | 'Aneuploid' | 'Mosaic' | 'Pending' | 'Untested';
    notes?: string;
    embryoImageBase64?: string;
}

export interface EmbryoGradingData {
    embryos?: EmbryoDetails[];
}

export interface SpermAnalysisData {
  sampleId?: string;
  count?: number; // in million/mL
  motility?: number; // in percentage
  morphology?: number; // in percentage
  notes?: string;
  isVerified?: boolean;
  aiAssessment?: {
    assessment: string;
    recommendation: string;
  };
}

export interface PsychologicalAssessmentData {
    clinicalNeeds?: string;
    emotionalNeeds?: string;
    financialNeeds?: string;
    persona?: string;
    interventionPlan?: string;
    assessmentComplete?: boolean;
}

export interface HcgData {
    hcgValue?: number;
    interpretation?: string;
}


// --- New Detailed Embryology & Procedure Payloads (Prep -> Action -> Post) ---

// -- OPU (Egg Retrieval) --
export interface OpuPrepData {
    checklist: {
        patientIdVerified: boolean;
        anesthesiaConsentSigned: boolean;
        procedureRoomReady: boolean;
    };
    isComplete: boolean;
}
export interface OpuData {
    folliclesAspiratedRight?: number;
    folliclesAspiratedLeft?: number;
    procedureNotes?: string;
    isComplete?: boolean;
}
export interface OocyteIdentificationData {
    totalRetrieved?: number;
    miiCount?: number; // Mature
    miCount?: number;  // Metaphase I
    gvCount?: number;   // Germinal Vesicle
    degenerateCount?: number; // Atretic/Degenerate
    notes?: string;
    isVerified?: boolean;
}
export interface OpuPostOpData {
    checklist: {
        patientStable: boolean;
        postOpInstructionsGiven: boolean;
        followUpScheduled: boolean;
    };
    isComplete: boolean;
}

// -- Fertilization --
export interface FertilizationPrepData {
     checklist: {
        spermVerified: boolean;
        dishesPrepared: boolean;
        incubatorConfirmed: boolean;
    };
    isComplete: boolean;
}
export interface FertilizationData {
    oocytesInseminated?: number;
    method?: 'ICSI' | 'IVF';
    notes?: string;
    isComplete?: boolean;
}
export interface PostFertilizationCheckData {
    twoPn_count?: number; // Number of normally fertilized oocytes (2 pronuclei)
    notes?: string;
    isComplete: boolean;
}

// -- Embryo Culture --
export interface Day3EmbryoDetails {
    id: string;
    cellNumber?: number;
    fragmentation?: 'None' | '<10%' | '10-25%' | '>25%';
}
export interface Day3CheckData {
    embryos?: Day3EmbryoDetails[];
    notes?: string;
    isComplete?: boolean;
}

// -- Embryo Transfer --
export interface EmbryoLabPrepData { 
    embryoIdSelected?: string; 
    notes?: string;
    checklist: {
        warmingProtocolFollowed: boolean;
        mediaEquilibrated: boolean;
        patientIdMatched: boolean;
    };
    isComplete: boolean;
}
export interface TransferPrepData {
    checklist: {
        patientReady: boolean;
        bladderProtocolFollowed: boolean;
        consentVerified: boolean;
    };
    isComplete: boolean;
}
export interface EmbryoTransferData {
    embryosTransferredCount?: number;
    catheterType?: 'Soft' | 'Firm' | 'Other';
    transferDifficulty?: 'Easy' | 'Moderate' | 'Difficult';
    procedureNotes?: string;
    isComplete?: boolean;
}
export interface TransferPostCareData {
    checklist: {
        patientRested: boolean;
        postProcedureInstructionsGiven: boolean;
    };
    isComplete: boolean;
}


// Union type for all possible task data structures
export type TaskData = 
    | PatientHistoryData 
    | MedicationData 
    | FollicleScanData 
    | EmbryoGradingData 
    | SpermAnalysisData 
    | PsychologicalAssessmentData 
    | PatientOnboardingData 
    | HcgData
    | OocyteIdentificationData
    | Day3CheckData
    | OpuData
    | FertilizationData
    | EmbryoTransferData
    | OpuPrepData
    | OpuPostOpData
    | FertilizationPrepData
    | PostFertilizationCheckData
    | EmbryoLabPrepData
    | TransferPrepData
    | TransferPostCareData
    | Record<string, any>;


export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: UserRole;
  status: TaskStatus;
  data: TaskData;
  notes?: string;
  dueDate: string; // Full ISO string with time
  durationMinutes: number;
  resourceRequired: 'OT' | 'Lab' | null;
}

export interface PatientPathwayStep {
  stepId: string;
  stepName: string;
  stepStatus: 'upcoming' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  tasks: Task[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  partnerName?: string;
  protocol: string;
  cycleStartDate: string;
  pathway: PatientPathwayStep[];
}

export interface TaskWithPatientInfo extends Task {
    patientId: string;
    patientName: string;
    patientAge: number;
    conflict?: {
        type: 'resource' | 'person';
        message: string;
    };
}

export interface NewPatientOnboardingInfo {
  name: string;
  age: number;
  partnerName?: string;
  protocol: string;
  cycleStartDate: string;
  historyData: PatientHistoryData;
}


// --- Quality Management Types ---

export interface QualityMetric {
  metric: string;
  value: string;
  progress: number; // Percentage
  target: string;
}

export interface MetricGroup {
  title: string;
  metrics: QualityMetric[];
}

export interface ClinicalAuditData {
  centerName: string;
  dateRange: string;
  groups: MetricGroup[];
}
