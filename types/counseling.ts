// Counseling Platform Types for IVF EMR System
// Compliant with ESHRE guidelines and Indian ART Act 2021

export interface CounselingPatient {
  id: string;
  name: string;
  age: number;
  partnerId?: string;
  partnerName?: string;
  partnerAge?: number;
  primaryLanguage: 'hindi' | 'tamil' | 'bengali' | 'english' | 'telugu' | 'marathi' | 'gujarati';
  secondaryLanguage?: string;
  culturalBackground: string;
  religiousConsiderations?: string;
  educationLevel: 'primary' | 'secondary' | 'graduate' | 'postgraduate';
  occupation: string;
  monthlyIncome: number; // in INR
  insuranceCoverage: 'none' | 'partial' | 'comprehensive';
  treatmentHistory: TreatmentHistory[];
  currentCycleStage: IVFCycleStage;
  referralSource: 'doctor' | 'self' | 'partner' | 'family' | 'previous_patient';
}

export interface TreatmentHistory {
  cycleNumber: number;
  outcome: 'ongoing' | 'positive' | 'negative' | 'cancelled' | 'miscarriage';
  duration: number; // months
  complications?: string[];
  emotionalImpact: 'low' | 'moderate' | 'high' | 'severe';
}

export type IVFCycleStage = 
  | 'pre_treatment'
  | 'ovarian_stimulation'
  | 'monitoring'
  | 'trigger'
  | 'opu'
  | 'fertilization'
  | 'embryo_culture'
  | 'transfer'
  | 'two_week_wait'
  | 'pregnancy_test'
  | 'early_pregnancy'
  | 'post_treatment';

export interface PsychometricAssessment {
  id: string;
  patientId: string;
  assessmentDate: Date;
  assessmentType: 'initial' | 'mid_treatment' | 'post_treatment' | 'follow_up';
  
  // Beck Anxiety Inventory (BAI)
  baiScore: number; // 0-63
  baiSeverity: 'minimal' | 'mild' | 'moderate' | 'severe';
  
  // Depression Anxiety Stress Scales (DASS-21)
  dassDepression: number; // 0-42
  dassAnxiety: number; // 0-42
  dassStress: number; // 0-42
  dassSeverityLevels: {
    depression: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
    anxiety: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
    stress: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
  };
  
  // Fertility Quality of Life (FertiQoL)
  fertiQolScore: number; // 0-100
  fertiQolDomains: {
    emotional: number;
    mind_body: number;
    relational: number;
    social: number;
    environmental: number;
    tolerability: number;
  };
  
  // Custom IVF-specific assessments
  copingStrategies: CopingStrategy[];
  supportSystems: SupportSystem[];
  financialStress: FinancialStressAssessment;
  relationshipImpact: RelationshipImpactAssessment;
}

export interface CopingStrategy {
  strategy: 'problem_focused' | 'emotion_focused' | 'avoidance' | 'social_support' | 'spiritual' | 'maladaptive';
  frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
  effectiveness: 'very_poor' | 'poor' | 'fair' | 'good' | 'excellent';
}

export interface SupportSystem {
  type: 'partner' | 'family' | 'friends' | 'healthcare_team' | 'support_group' | 'online_community' | 'spiritual';
  availability: 'not_available' | 'limited' | 'moderate' | 'high' | 'very_high';
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  culturalAlignment: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface FinancialStressAssessment {
  totalTreatmentCost: number; // in INR
  outOfPocketExpense: number; // in INR
  percentageOfIncome: number;
  financialStrain: 'none' | 'mild' | 'moderate' | 'severe' | 'overwhelming';
  impactOnLifestyle: 'none' | 'minimal' | 'moderate' | 'significant' | 'major';
  futureFinancialConcerns: string[];
}

export interface RelationshipImpactAssessment {
  relationshipSatisfaction: number; // 1-10 scale
  communicationQuality: 'poor' | 'fair' | 'good' | 'excellent';
  intimacyImpact: 'no_impact' | 'mild_impact' | 'moderate_impact' | 'severe_impact';
  decisionMakingAlignment: 'poor' | 'fair' | 'good' | 'excellent';
  stressOnRelationship: 'none' | 'mild' | 'moderate' | 'high' | 'severe';
}

export interface PatientPersona {
  id: string;
  patientId: string;
  generatedDate: Date;
  personaType: PersonaType;
  emotionalProfile: EmotionalProfile;
  copingProfile: CopingProfile;
  riskFactors: RiskFactor[];
  strengths: Strength[];
  culturalConsiderations: CulturalConsideration[];
  recommendedApproaches: TherapeuticApproach[];
  contraindications: string[];
}

export type PersonaType = 
  | 'anxious_perfectionist'
  | 'resilient_optimist'
  | 'overwhelmed_newcomer'
  | 'experienced_veteran'
  | 'financially_stressed'
  | 'culturally_conflicted'
  | 'relationship_strained'
  | 'spiritually_seeking';

export interface EmotionalProfile {
  primaryEmotions: string[];
  emotionalRegulation: 'poor' | 'developing' | 'adequate' | 'good' | 'excellent';
  emotionalAwareness: 'low' | 'moderate' | 'high';
  expressionStyle: 'suppressed' | 'controlled' | 'open' | 'overwhelming';
}

export interface CopingProfile {
  dominantStrategies: CopingStrategy[];
  adaptiveCapacity: 'low' | 'moderate' | 'high';
  flexibilityInCoping: 'rigid' | 'somewhat_flexible' | 'flexible' | 'highly_flexible';
  learningReadiness: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  evidenceBased: boolean;
  interventionRequired: boolean;
  monitoringFrequency: 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
}

export interface Strength {
  strength: string;
  leverageOpportunity: string;
  reinforcementStrategy: string;
}

export interface CulturalConsideration {
  aspect: 'family_involvement' | 'religious_practices' | 'gender_roles' | 'communication_style' | 'decision_making' | 'stigma_concerns';
  description: string;
  adaptationRequired: string;
  sensitivityLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface TherapeuticApproach {
  approach: 'CBT' | 'mindfulness' | 'psychoeducation' | 'supportive' | 'solution_focused' | 'narrative' | 'culturally_adapted';
  rationale: string;
  evidenceBase: string;
  adaptations: string[];
  expectedOutcomes: string[];
  duration: string;
  frequency: string;
}

export interface InterventionPlan {
  id: string;
  patientId: string;
  personaId: string;
  createdDate: Date;
  lastUpdated: Date;
  status: 'active' | 'completed' | 'paused' | 'discontinued';
  
  goals: TherapeuticGoal[];
  interventions: Intervention[];
  timeline: InterventionTimeline;
  progressMetrics: ProgressMetric[];
  
  // Compliance tracking
  adherenceRate: number; // percentage
  engagementLevel: 'low' | 'moderate' | 'high' | 'very_high';
  barriersTreatment: string[];
  facilitators: string[];
}

export interface TherapeuticGoal {
  id: string;
  description: string;
  category: 'emotional_regulation' | 'stress_management' | 'relationship_improvement' | 'coping_skills' | 'psychoeducation' | 'behavioral_change';
  priority: 'low' | 'medium' | 'high' | 'critical';
  measurable: boolean;
  targetDate: Date;
  status: 'not_started' | 'in_progress' | 'achieved' | 'modified' | 'discontinued';
  progressIndicators: string[];
}

export interface Intervention {
  id: string;
  type: InterventionType;
  title: string;
  description: string;
  rationale: string;
  evidenceBase: string;
  
  // Delivery details
  format: 'individual' | 'couple' | 'group' | 'self_guided' | 'digital';
  duration: number; // minutes
  frequency: string;
  totalSessions: number;
  
  // Content
  materials: InterventionMaterial[];
  exercises: Exercise[];
  homework: HomeworkAssignment[];
  
  // Tracking
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  effectivenessRating: number; // 1-10
  patientFeedback: string;
  
  // Cultural adaptations
  culturalAdaptations: string[];
  languageSupport: string[];
}

export type InterventionType = 
  | 'psychoeducation'
  | 'cognitive_restructuring'
  | 'mindfulness_meditation'
  | 'progressive_muscle_relaxation'
  | 'breathing_exercises'
  | 'journaling'
  | 'communication_skills'
  | 'problem_solving'
  | 'values_clarification'
  | 'grief_processing'
  | 'stress_inoculation'
  | 'behavioral_activation'
  | 'exposure_therapy'
  | 'acceptance_commitment'
  | 'culturally_adapted_therapy';

export interface InterventionMaterial {
  id: string;
  type: 'video' | 'audio' | 'text' | 'interactive' | 'worksheet' | 'infographic';
  title: string;
  description: string;
  language: string;
  culturallyAdapted: boolean;
  accessibilityFeatures: string[];
  estimatedTime: number; // minutes
  url?: string;
  content?: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: 'breathing' | 'meditation' | 'cognitive' | 'behavioral' | 'mindfulness' | 'relaxation' | 'communication';
  instructions: string;
  duration: number; // minutes
  frequency: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  adaptations: string[];
  trackingMetrics: string[];
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  estimatedTime: number; // minutes
  dueDate: Date;
  completionCriteria: string[];
  trackingMethod: 'self_report' | 'app_tracking' | 'partner_verification' | 'counselor_review';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'modified';
}

export interface InterventionTimeline {
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  phases: TreatmentPhase[];
  milestones: Milestone[];
  reviewDates: Date[];
}

export interface TreatmentPhase {
  phase: 'assessment' | 'stabilization' | 'skill_building' | 'integration' | 'maintenance' | 'relapse_prevention';
  startDate: Date;
  endDate: Date;
  goals: string[];
  interventions: string[];
  successCriteria: string[];
}

export interface Milestone {
  id: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  achieved: boolean;
  significance: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface ProgressMetric {
  id: string;
  metric: string;
  category: 'symptom_reduction' | 'skill_acquisition' | 'behavioral_change' | 'quality_of_life' | 'relationship_improvement';
  measurementMethod: 'standardized_scale' | 'self_report' | 'behavioral_observation' | 'partner_report' | 'physiological';
  baseline: number;
  target: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
  lastMeasured: Date;
  nextMeasurement: Date;
}

export interface CounselingSession {
  id: string;
  patientId: string;
  counselorId: string;
  sessionDate: Date;
  duration: number; // minutes
  sessionType: 'individual' | 'couple' | 'family' | 'group' | 'crisis' | 'follow_up';
  format: 'in_person' | 'video' | 'phone' | 'chat';
  
  // Session content
  agenda: string[];
  interventionsUsed: string[];
  progressReviewed: string[];
  newConcerns: string[];
  homeworkReviewed: boolean;
  newHomeworkAssigned: string[];
  
  // Assessments
  sessionRating: number; // 1-10
  therapeuticAlliance: number; // 1-10
  patientEngagement: 'low' | 'moderate' | 'high' | 'very_high';
  
  // Clinical notes
  clinicalObservations: string;
  progressNotes: string;
  riskAssessment: RiskAssessment;
  nextSessionPlan: string;
  
  // Compliance tracking
  adherenceToTreatment: number; // percentage
  barriersDifficulties: string[];
  facilitatorsSupports: string[];
}

export interface RiskAssessment {
  suicidalIdeation: 'none' | 'passive' | 'active_no_plan' | 'active_with_plan' | 'imminent';
  selfHarmRisk: 'low' | 'moderate' | 'high' | 'imminent';
  substanceUse: 'none' | 'minimal' | 'moderate' | 'concerning' | 'severe';
  relationshipViolence: 'none' | 'emotional' | 'physical' | 'severe';
  psychosisRisk: 'none' | 'mild_symptoms' | 'moderate_symptoms' | 'severe_symptoms';
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  interventionsRequired: string[];
  referralsNeeded: string[];
}

export interface CounselingConfiguration {
  // Process timelines (in days)
  assessmentDuration: number;
  interventionCycleDuration: number;
  monitoringFrequency: number;
  followUpDuration: number;
  
  // Cost configuration (in INR)
  treatmentCostRanges: {
    basic: { min: number; max: number };
    standard: { min: number; max: number };
    premium: { min: number; max: number };
  };
  
  // Protocol customization
  defaultApproach: 'CBT' | 'mindfulness' | 'integrated' | 'culturally_adapted';
  sessionFrequency: 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
  groupSessionsEnabled: boolean;
  coupleTherapyEnabled: boolean;
  
  // Cultural settings
  primaryLanguages: string[];
  culturalAdaptationsEnabled: boolean;
  religiousConsiderationsEnabled: boolean;
  
  // Compliance requirements
  artActCompliance: boolean;
  eshreGuidelinesCompliance: boolean;
  dpdpActCompliance: boolean;
  informedConsentRequired: boolean;
  
  // Technology settings
  pwaEnabled: boolean;
  offlineCapabilityEnabled: boolean;
  pushNotificationsEnabled: boolean;
  multilingualSupport: boolean;
}

export interface CounselingAnalytics {
  patientOutcomes: {
    symptomReduction: number; // percentage
    treatmentCompletion: number; // percentage
    patientSatisfaction: number; // 1-10 scale
    qualityOfLifeImprovement: number; // percentage
  };
  
  operationalMetrics: {
    averageSessionsPerPatient: number;
    treatmentDuration: number; // days
    adherenceRate: number; // percentage
    noShowRate: number; // percentage
  };
  
  clinicalMetrics: {
    riskReduction: number; // percentage
    copingSkillsImprovement: number; // percentage
    relationshipSatisfactionImprovement: number; // percentage
    stressLevelReduction: number; // percentage
  };
  
  complianceMetrics: {
    artActCompliance: number; // percentage
    eshreCompliance: number; // percentage
    informedConsentRate: number; // percentage
    dataProtectionCompliance: number; // percentage
  };
}
