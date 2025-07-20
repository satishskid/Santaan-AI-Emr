import { Patient, UserRole, TaskStatus, PatientPathwayStep, Task, NewPatientOnboardingInfo } from '../types';
import { createPatientPathway } from './ivfDataService';

// Test Clinic Configuration
export const TEST_CLINIC_CONFIG = {
  name: "Santaan Fertility Center - Demo Clinic",
  location: "Mumbai, Maharashtra, India",
  established: "2024",
  specialties: ["IVF", "ICSI", "IUI", "Fertility Preservation", "Male Infertility"],
  languages: ["Hindi", "English", "Marathi", "Gujarati"],
  staff_count: 25,
  success_rate: "68%",
  accreditation: ["NABH", "ISO 15189", "CAP"]
};

// Patient Group Categories for Comprehensive Testing
export enum PatientCategory {
  FIRST_TIME_IVF = "first_time_ivf",
  REPEAT_IVF = "repeat_ivf", 
  MALE_FACTOR = "male_factor",
  FEMALE_FACTOR = "female_factor",
  UNEXPLAINED = "unexplained",
  ADVANCED_AGE = "advanced_age",
  PCOS = "pcos",
  ENDOMETRIOSIS = "endometriosis",
  LOW_AMH = "low_amh",
  DONOR_EGG = "donor_egg",
  FROZEN_TRANSFER = "frozen_transfer",
  IUI_TO_IVF = "iui_to_ivf"
}

// Test User Profiles
export interface TestUser {
  id: string;
  name: string;
  role: UserRole;
  specialization?: string;
  experience_years: number;
  languages: string[];
  email: string;
  phone: string;
  shift: 'morning' | 'evening' | 'night' | 'full_day';
}

export const TEST_USERS: TestUser[] = [
  // Doctors
  {
    id: 'dr_001',
    name: 'Dr. Priya Mehta',
    role: UserRole.Doctor,
    specialization: 'Reproductive Endocrinology',
    experience_years: 12,
    languages: ['Hindi', 'English', 'Gujarati'],
    email: 'priya.mehta@santaan.com',
    phone: '+91 98765 43210',
    shift: 'morning'
  },
  {
    id: 'dr_002', 
    name: 'Dr. Rajesh Kumar',
    role: UserRole.Doctor,
    specialization: 'Male Infertility & Andrology',
    experience_years: 15,
    languages: ['Hindi', 'English'],
    email: 'rajesh.kumar@santaan.com',
    phone: '+91 98765 43211',
    shift: 'full_day'
  },
  {
    id: 'dr_003',
    name: 'Dr. Anita Sharma',
    role: UserRole.Doctor,
    specialization: 'Laparoscopic Surgery',
    experience_years: 8,
    languages: ['Hindi', 'English', 'Punjabi'],
    email: 'anita.sharma@santaan.com',
    phone: '+91 98765 43212',
    shift: 'evening'
  },

  // Nurses
  {
    id: 'nurse_001',
    name: 'Sister Kavita Patel',
    role: UserRole.Nurse,
    specialization: 'IVF Coordinator',
    experience_years: 6,
    languages: ['Hindi', 'English', 'Marathi'],
    email: 'kavita.patel@santaan.com',
    phone: '+91 98765 43213',
    shift: 'morning'
  },
  {
    id: 'nurse_002',
    name: 'Sister Meera Singh',
    role: UserRole.Nurse,
    specialization: 'Patient Care',
    experience_years: 4,
    languages: ['Hindi', 'English'],
    email: 'meera.singh@santaan.com',
    phone: '+91 98765 43214',
    shift: 'evening'
  },

  // Embryologists
  {
    id: 'embryo_001',
    name: 'Dr. Suresh Reddy',
    role: UserRole.Embryologist,
    specialization: 'Clinical Embryology',
    experience_years: 10,
    languages: ['Hindi', 'English', 'Telugu'],
    email: 'suresh.reddy@santaan.com',
    phone: '+91 98765 43215',
    shift: 'full_day'
  },
  {
    id: 'embryo_002',
    name: 'Dr. Neha Agarwal',
    role: UserRole.Embryologist,
    specialization: 'Andrology Lab',
    experience_years: 7,
    languages: ['Hindi', 'English'],
    email: 'neha.agarwal@santaan.com',
    phone: '+91 98765 43216',
    shift: 'morning'
  },

  // Counselors
  {
    id: 'counselor_001',
    name: 'Ms. Ritu Joshi',
    role: UserRole.Counselor,
    specialization: 'Fertility Counseling',
    experience_years: 5,
    languages: ['Hindi', 'English', 'Marathi'],
    email: 'ritu.joshi@santaan.com',
    phone: '+91 98765 43217',
    shift: 'full_day'
  }
];

// Patient Archetypes with Indian Demographics
export interface PatientArchetype {
  category: PatientCategory;
  name: string;
  age: number;
  partnerName: string;
  partnerAge: number;
  location: string;
  occupation: string;
  partnerOccupation: string;
  monthlyIncome: number; // in INR
  languages: string[];
  religion: string;
  medicalHistory: string[];
  diagnosis: string;
  protocol: string;
  cycleNumber: number;
  previousTreatments: string[];
  challenges: string[];
  culturalConsiderations: string[];
  journey_stage: 'consultation' | 'treatment' | 'monitoring' | 'procedure' | 'result';
}

export const PATIENT_ARCHETYPES: PatientArchetype[] = [
  {
    category: PatientCategory.FIRST_TIME_IVF,
    name: 'Priya Sharma',
    age: 32,
    partnerName: 'Rajesh Sharma',
    partnerAge: 35,
    location: 'Mumbai, Maharashtra',
    occupation: 'Software Engineer',
    partnerOccupation: 'Business Analyst',
    monthlyIncome: 150000,
    languages: ['Hindi', 'English'],
    religion: 'Hindu',
    medicalHistory: ['Regular menstrual cycles', 'No major surgeries'],
    diagnosis: 'Unexplained Infertility',
    protocol: 'Antagonist Protocol',
    cycleNumber: 1,
    previousTreatments: ['Ovulation induction (6 months)', 'IUI (3 cycles)'],
    challenges: ['First-time anxiety', 'Work-life balance'],
    culturalConsiderations: ['Joint family pressure', 'Religious ceremonies timing'],
    journey_stage: 'consultation'
  },
  {
    category: PatientCategory.PCOS,
    name: 'Meera Patel',
    age: 28,
    partnerName: 'Arjun Patel',
    partnerAge: 31,
    location: 'Ahmedabad, Gujarat',
    occupation: 'Teacher',
    partnerOccupation: 'Chartered Accountant',
    monthlyIncome: 120000,
    languages: ['Gujarati', 'Hindi', 'English'],
    religion: 'Hindu',
    medicalHistory: ['PCOS diagnosed at 24', 'Insulin resistance', 'Weight management issues'],
    diagnosis: 'PCOS with Anovulation',
    protocol: 'Long Agonist Protocol',
    cycleNumber: 1,
    previousTreatments: ['Metformin therapy', 'Lifestyle modifications', 'Ovulation induction'],
    challenges: ['Weight management', 'Irregular cycles', 'OHSS risk'],
    culturalConsiderations: ['Vegetarian diet preferences', 'Festival fasting concerns'],
    journey_stage: 'treatment'
  },
  {
    category: PatientCategory.ADVANCED_AGE,
    name: 'Sunita Kapoor',
    age: 41,
    partnerName: 'Vikram Kapoor',
    partnerAge: 44,
    location: 'Delhi, NCR',
    occupation: 'Marketing Director',
    partnerOccupation: 'Investment Banker',
    monthlyIncome: 300000,
    languages: ['Hindi', 'English', 'Punjabi'],
    religion: 'Sikh',
    medicalHistory: ['Late marriage at 38', 'One miscarriage at 39', 'Diminished ovarian reserve'],
    diagnosis: 'Advanced Maternal Age with Low AMH',
    protocol: 'Mild Stimulation Protocol',
    cycleNumber: 2,
    previousTreatments: ['IVF cycle 1 (poor response)', 'Vitamin D supplementation', 'DHEA therapy'],
    challenges: ['Low egg quality', 'Time pressure', 'Career demands'],
    culturalConsiderations: ['Extended family expectations', 'Religious observances'],
    journey_stage: 'monitoring'
  },
  {
    category: PatientCategory.MALE_FACTOR,
    name: 'Kavya Reddy',
    age: 30,
    partnerName: 'Suresh Reddy',
    partnerAge: 33,
    location: 'Hyderabad, Telangana',
    occupation: 'Physiotherapist',
    partnerOccupation: 'IT Manager',
    monthlyIncome: 180000,
    languages: ['Telugu', 'Hindi', 'English'],
    religion: 'Hindu',
    medicalHistory: ['Normal female fertility workup', 'Partner has oligospermia'],
    diagnosis: 'Male Factor Infertility (Severe Oligospermia)',
    protocol: 'Antagonist Protocol with ICSI',
    cycleNumber: 1,
    previousTreatments: ['Partner lifestyle modifications', 'Antioxidant therapy', 'Varicocele repair'],
    challenges: ['Male partner stress', 'ICSI procedure anxiety'],
    culturalConsiderations: ['South Indian customs', 'Joint family dynamics'],
    journey_stage: 'procedure'
  },
  {
    category: PatientCategory.ENDOMETRIOSIS,
    name: 'Anjali Singh',
    age: 35,
    partnerName: 'Rohit Singh',
    partnerAge: 37,
    location: 'Pune, Maharashtra',
    occupation: 'Marketing Manager',
    partnerOccupation: 'Civil Engineer',
    monthlyIncome: 200000,
    languages: ['Hindi', 'English', 'Marathi'],
    religion: 'Hindu',
    medicalHistory: ['Endometriosis Grade III', 'Laparoscopic surgery 2 years ago', 'Chronic pelvic pain'],
    diagnosis: 'Endometriosis with Tubal Factor',
    protocol: 'Long Agonist Protocol',
    cycleNumber: 1,
    previousTreatments: ['Laparoscopic surgery', 'GnRH agonist therapy', 'Pain management'],
    challenges: ['Chronic pain management', 'Reduced ovarian reserve', 'Adhesions'],
    culturalConsiderations: ['Working woman challenges', 'Family support system'],
    journey_stage: 'result'
  },
  {
    category: PatientCategory.REPEAT_IVF,
    name: 'Deepika Agarwal',
    age: 36,
    partnerName: 'Amit Agarwal',
    partnerAge: 39,
    location: 'Jaipur, Rajasthan',
    occupation: 'Bank Manager',
    partnerOccupation: 'Businessman',
    monthlyIncome: 250000,
    languages: ['Hindi', 'English', 'Rajasthani'],
    religion: 'Hindu',
    medicalHistory: ['Previous IVF failure', 'Recurrent implantation failure', 'Thyroid disorder'],
    diagnosis: 'Recurrent Implantation Failure',
    protocol: 'Modified Natural Cycle',
    cycleNumber: 3,
    previousTreatments: ['IVF cycle 1 & 2 (failed)', 'Endometrial biopsy', 'Immunological workup'],
    challenges: ['Emotional exhaustion', 'Financial strain', 'Family pressure'],
    culturalConsiderations: ['Traditional Rajasthani family', 'Religious rituals'],
    journey_stage: 'treatment'
  }
];

// Generate comprehensive test patients
export const generateTestPatients = (): Patient[] => {
  const patients: Patient[] = [];
  
  PATIENT_ARCHETYPES.forEach((archetype, index) => {
    const patientId = `test-patient-${String(index + 1).padStart(3, '0')}`;
    const cycleStartDate = getDateForStage(archetype.journey_stage);
    
    const patient: Patient = {
      id: patientId,
      name: archetype.name,
      age: archetype.age,
      partnerName: archetype.partnerName,
      protocol: archetype.protocol,
      cycleStartDate: cycleStartDate,
      pathway: createPatientPathway(patientId, cycleStartDate)
    };
    
    // Customize pathway based on journey stage
    customizePatientJourney(patient, archetype);
    
    patients.push(patient);
  });
  
  return patients;
};

// Helper function to get appropriate date based on journey stage
const getDateForStage = (stage: string): string => {
  const today = new Date();
  switch (stage) {
    case 'consultation':
      return today.toISOString().split('T')[0]; // Today
    case 'treatment':
      return new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days ago
    case 'monitoring':
      return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 week ago
    case 'procedure':
      return new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 2 weeks ago
    case 'result':
      return new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 weeks ago
    default:
      return today.toISOString().split('T')[0];
  }
};

// Customize patient journey based on archetype
const customizePatientJourney = (patient: Patient, archetype: PatientArchetype) => {
  // This function will be expanded to set appropriate task statuses
  // based on the patient's journey stage and category
  
  switch (archetype.journey_stage) {
    case 'consultation':
      // Keep all tasks pending - fresh consultation
      break;
    case 'treatment':
      // Mark initial tasks as completed, current tasks in progress
      markTasksCompleted(patient, 2);
      break;
    case 'monitoring':
      // Mark more tasks as completed, monitoring tasks active
      markTasksCompleted(patient, 5);
      break;
    case 'procedure':
      // Most tasks completed, procedure tasks active
      markTasksCompleted(patient, 8);
      break;
    case 'result':
      // All tasks completed, result tasks active
      markTasksCompleted(patient, 12);
      break;
  }
};

// Helper to mark first N tasks as completed
const markTasksCompleted = (patient: Patient, count: number) => {
  let completed = 0;
  for (const step of patient.pathway) {
    for (const task of step.tasks) {
      if (completed < count) {
        task.status = TaskStatus.Completed;
        completed++;
      } else if (completed === count) {
        task.status = TaskStatus.InProgress;
        completed++;
        return;
      }
    }
  }
};

// Add more diverse patient archetypes
const ADDITIONAL_ARCHETYPES: PatientArchetype[] = [
  {
    category: PatientCategory.LOW_AMH,
    name: 'Ritu Jain',
    age: 33,
    partnerName: 'Nikhil Jain',
    partnerAge: 35,
    location: 'Bangalore, Karnataka',
    occupation: 'Software Architect',
    partnerOccupation: 'Product Manager',
    monthlyIncome: 220000,
    languages: ['Hindi', 'English', 'Kannada'],
    religion: 'Jain',
    medicalHistory: ['Low AMH (0.8 ng/ml)', 'Irregular cycles', 'Family history of early menopause'],
    diagnosis: 'Diminished Ovarian Reserve',
    protocol: 'Mild Stimulation with Corifollitropin',
    cycleNumber: 1,
    previousTreatments: ['DHEA supplementation', 'CoQ10 therapy', 'Acupuncture'],
    challenges: ['Poor ovarian response', 'Time pressure', 'Egg quality concerns'],
    culturalConsiderations: ['Jain dietary restrictions', 'Tech industry work culture'],
    journey_stage: 'monitoring'
  },
  {
    category: PatientCategory.IUI_TO_IVF,
    name: 'Pooja Gupta',
    age: 29,
    partnerName: 'Rahul Gupta',
    partnerAge: 32,
    location: 'Lucknow, Uttar Pradesh',
    occupation: 'Government Teacher',
    partnerOccupation: 'Bank Officer',
    monthlyIncome: 90000,
    languages: ['Hindi', 'English'],
    religion: 'Hindu',
    medicalHistory: ['Multiple failed IUI cycles', 'Mild male factor', 'Stress-related issues'],
    diagnosis: 'Failed IUI with Mild Male Factor',
    protocol: 'Antagonist Protocol',
    cycleNumber: 1,
    previousTreatments: ['IUI cycles (6 failed)', 'Stress counseling', 'Lifestyle modifications'],
    challenges: ['Financial constraints', 'IUI failure trauma', 'Family expectations'],
    culturalConsiderations: ['Middle-class family', 'Government job constraints'],
    journey_stage: 'consultation'
  },
  {
    category: PatientCategory.FROZEN_TRANSFER,
    name: 'Nisha Malhotra',
    age: 34,
    partnerName: 'Karan Malhotra',
    partnerAge: 36,
    location: 'Chandigarh, Punjab',
    occupation: 'Doctor (Pediatrician)',
    partnerOccupation: 'Lawyer',
    monthlyIncome: 280000,
    languages: ['Hindi', 'English', 'Punjabi'],
    religion: 'Sikh',
    medicalHistory: ['Previous fresh cycle with good embryos', 'Frozen embryos available', 'OHSS in fresh cycle'],
    diagnosis: 'FET Cycle (Previous OHSS)',
    protocol: 'Hormone Replacement Cycle',
    cycleNumber: 2,
    previousTreatments: ['Fresh IVF cycle (OHSS)', 'Embryo freezing', 'Recovery period'],
    challenges: ['OHSS trauma', 'Frozen embryo anxiety', 'Professional demands'],
    culturalConsiderations: ['Dual career couple', 'Sikh traditions'],
    journey_stage: 'treatment'
  }
];

// Complete patient archetypes list
const ALL_PATIENT_ARCHETYPES = [...PATIENT_ARCHETYPES, ...ADDITIONAL_ARCHETYPES];

// User Journey Scenarios
export interface UserJourneyScenario {
  id: string;
  title: string;
  description: string;
  patient_category: PatientCategory;
  duration_weeks: number;
  key_milestones: string[];
  staff_interactions: { role: UserRole; tasks: string[] }[];
  expected_outcomes: string[];
  learning_objectives: string[];
}

export const USER_JOURNEY_SCENARIOS: UserJourneyScenario[] = [
  {
    id: 'journey_001',
    title: 'First-Time IVF Success Story',
    description: 'Complete journey from consultation to positive pregnancy test',
    patient_category: PatientCategory.FIRST_TIME_IVF,
    duration_weeks: 8,
    key_milestones: [
      'Initial consultation and workup',
      'Protocol explanation and consent',
      'Stimulation start and monitoring',
      'Trigger and egg retrieval',
      'Fertilization and embryo culture',
      'Embryo transfer',
      'Two-week wait',
      'Positive pregnancy test'
    ],
    staff_interactions: [
      { role: UserRole.Doctor, tasks: ['Consultation', 'Protocol design', 'Monitoring', 'Procedures'] },
      { role: UserRole.Nurse, tasks: ['Patient education', 'Injection training', 'Emotional support'] },
      { role: UserRole.Embryologist, tasks: ['Lab procedures', 'Embryo assessment', 'Quality control'] },
      { role: UserRole.Counselor, tasks: ['Stress management', 'Expectation setting', 'Support'] }
    ],
    expected_outcomes: ['Successful pregnancy', 'Patient satisfaction', 'Smooth workflow'],
    learning_objectives: [
      'Understand complete IVF workflow',
      'Learn patient communication skills',
      'Practice multidisciplinary coordination',
      'Experience positive outcome management'
    ]
  },
  {
    id: 'journey_002',
    title: 'PCOS Management Challenge',
    description: 'Complex case requiring careful stimulation and OHSS prevention',
    patient_category: PatientCategory.PCOS,
    duration_weeks: 10,
    key_milestones: [
      'PCOS assessment and optimization',
      'Metformin and lifestyle preparation',
      'Careful stimulation protocol',
      'OHSS risk monitoring',
      'Modified trigger protocol',
      'Freeze-all strategy',
      'FET preparation',
      'Successful transfer'
    ],
    staff_interactions: [
      { role: UserRole.Doctor, tasks: ['PCOS management', 'Protocol modification', 'Risk assessment'] },
      { role: UserRole.Nurse, tasks: ['Patient monitoring', 'Symptom tracking', 'Education'] },
      { role: UserRole.Embryologist, tasks: ['Embryo freezing', 'Quality assessment'] },
      { role: UserRole.Counselor, tasks: ['Body image support', 'Lifestyle counseling'] }
    ],
    expected_outcomes: ['OHSS prevention', 'Good embryo yield', 'Successful FET'],
    learning_objectives: [
      'Master PCOS-specific protocols',
      'Learn OHSS prevention strategies',
      'Understand freeze-all benefits',
      'Practice risk management'
    ]
  }
];

// Demo mode integration
export const enableTestClinicMode = () => {
  // This function will integrate test clinic data with the main application
  console.log('🏥 Test Clinic Mode Enabled');
  console.log(`📊 Loaded ${ALL_PATIENT_ARCHETYPES.length} patient archetypes`);
  console.log(`👥 Configured ${TEST_USERS.length} test users`);
  console.log(`🎯 Available ${USER_JOURNEY_SCENARIOS.length} journey scenarios`);
};

// Export test clinic data
export const getTestClinicData = () => ({
  config: TEST_CLINIC_CONFIG,
  users: TEST_USERS,
  patients: generateTestPatients(),
  archetypes: ALL_PATIENT_ARCHETYPES,
  journeys: USER_JOURNEY_SCENARIOS,
  enableTestMode: enableTestClinicMode
});
