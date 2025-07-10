
import { UserRole, TaskStatus } from './types';
import { DoctorIcon, NurseIcon, EmbryologistIcon, CounselorIcon } from './components/icons';
import React from 'react';

interface IconProps {
    className?: string;
}

export const USER_ROLES: UserRole[] = [
  UserRole.Doctor,
  UserRole.Nurse,
  UserRole.Embryologist,
  UserRole.Counselor,
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  [TaskStatus.InProgress]: 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
  [TaskStatus.Completed]: 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100',
  [TaskStatus.OnHold]: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    [UserRole.Doctor]: 'border-blue-500',
    [UserRole.Nurse]: 'border-teal-500',
    [UserRole.Embryologist]: 'border-purple-500',
    [UserRole.Counselor]: 'border-orange-500',
}

export const ROLE_BG_COLORS: Record<UserRole, string> = {
    [UserRole.Doctor]: 'bg-blue-50 dark:bg-blue-900/20',
    [UserRole.Nurse]: 'bg-teal-50 dark:bg-teal-900/20',
    [UserRole.Embryologist]: 'bg-purple-50 dark:bg-purple-900/20',
    [UserRole.Counselor]: 'bg-orange-50 dark:bg-orange-900/20',
}

export const ROLE_ICONS: Record<UserRole, React.FC<IconProps>> = {
    [UserRole.Doctor]: DoctorIcon,
    [UserRole.Nurse]: NurseIcon,
    [UserRole.Embryologist]: EmbryologistIcon,
    [UserRole.Counselor]: CounselorIcon,
};


export const MOCK_PATIENTS = [
    { id: 'patient-001', name: 'Jane Doe' },
    { id: 'patient-002', name: 'Emily Smith' },
];

export const PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.Doctor]: ['*'], // Wildcard for all access
  [UserRole.Nurse]: [
    'Patient Onboarding',
    'Review Patient History',
    'Prescribe Medication',
    'Follicle Scan #1',
    'Follicle Scan #2',
    'hCG Blood Test',
  ],
  [UserRole.Embryologist]: [
    'Identify & Count Oocytes',
    'Perform ICSI/IVF',
    'Sperm Analysis',
    'Day 3 Check',
    'Day 5 Check & Grading',
    'Prepare Embryo'
  ],
  [UserRole.Counselor]: [
    'Psychological Assessment'
  ],
};

export const DIAGNOSIS_HIERARCHY: Record<string, string[]> = {
  'Female Factor - Ovarian': [
    'PCOS (Polycystic Ovary Syndrome)',
    'Diminished Ovarian Reserve (DOR)',
    'Premature Ovarian Failure (POF)',
    'Luteal Phase Defect',
  ],
  'Female Factor - Tubal': [
    'Blocked Fallopian Tubes',
    'Hydrosalpinx',
  ],
  'Female Factor - Uterine': [
    'Fibroids',
    'Endometriosis',
    'Asherman\'s Syndrome',
    'Uterine Septum',
  ],
  'Male Factor': [
    'Azoospermia (No sperm)',
    'Oligozoospermia (Low sperm count)',
    'Asthenozoospermia (Poor motility)',
    'Teratozoospermia (Abnormal morphology)',
    'Varicocele',
  ],
  'Unexplained Infertility': [],
  'Recurrent Pregnancy Loss': [],
};


export const COMMON_ALLERGIES: string[] = [
    'Penicillin',
    'Sulfa',
    'Aspirin',
    'Latex',
    'Iodine'
];

export const PROTOCOL_DESCRIPTIONS: Record<string, {title: string, description: string}> = {
    'Antagonist Protocol': {
        title: 'Antagonist Protocol Overview',
        description: 'This is a common and shorter protocol. It involves starting stimulation injections early in your cycle and adding an "antagonist" medication a few days later to prevent premature ovulation. This gives us precise control over when the eggs are ready for retrieval.'
    },
    'Long Agonist Protocol': {
        title: 'Long Agonist Protocol Overview',
        description: 'This protocol starts in the cycle *before* your stimulation cycle, using an "agonist" medication to suppress your natural hormones. This prevents premature ovulation and can sometimes lead to a more synchronized growth of follicles. It\'s a longer but very effective protocol.'
    }
};
