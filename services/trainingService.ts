import { UserRole, Patient, TaskWithPatientInfo } from '../types';

// Training module interfaces
export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  sections: TrainingSection[];
  quiz?: Quiz;
  certification?: boolean;
}

export interface TrainingSection {
  id: string;
  title: string;
  content: TrainingContent[];
  interactiveElements: InteractiveElement[];
  practiceExercises?: PracticeExercise[];
}

export interface TrainingContent {
  type: 'text' | 'image' | 'video' | 'diagram' | 'code' | 'table';
  title?: string;
  content: string;
  metadata?: {
    dataType?: string;
    fieldType?: string;
    semantics?: string;
    correlations?: string[];
    derivedValues?: string[];
  };
}

export interface InteractiveElement {
  type: 'tooltip' | 'highlight' | 'annotation' | 'simulation' | 'form';
  target: string;
  content: string;
  trigger: 'hover' | 'click' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  type: 'form-filling' | 'data-entry' | 'workflow' | 'decision-making';
  scenario: string;
  expectedActions: string[];
  hints: string[];
  solution: any;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // minutes
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export enum TrainingCategory {
  DataTypes = 'data-types',
  FieldSemantics = 'field-semantics',
  Workflow = 'workflow',
  Correlations = 'correlations',
  DerivedValues = 'derived-values',
  SystemNavigation = 'system-navigation',
  RoleBasedAccess = 'role-based-access',
  ResourceOptimization = 'resource-optimization'
}

// Comprehensive training modules
export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'emr-fundamentals',
    title: 'IVF EMR Fundamentals',
    description: 'Complete introduction to the IVF EMR system, data types, and core concepts',
    category: TrainingCategory.SystemNavigation,
    difficulty: 'beginner',
    estimatedDuration: 45,
    prerequisites: [],
    learningObjectives: [
      'Understand the IVF EMR system architecture',
      'Navigate the user interface effectively',
      'Identify key data types and their purposes',
      'Recognize field relationships and correlations'
    ],
    sections: [
      {
        id: 'system-overview',
        title: 'System Overview',
        content: [
          {
            type: 'text',
            title: 'Welcome to IVF EMR',
            content: 'The IVF EMR is a comprehensive electronic medical record system designed specifically for fertility clinics. It manages patient data, treatment protocols, laboratory results, and resource optimization.',
            metadata: {
              dataType: 'System Introduction',
              semantics: 'Provides context and purpose of the EMR system'
            }
          },
          {
            type: 'diagram',
            title: 'System Architecture',
            content: 'Patient Management → Treatment Planning → Laboratory Tracking → Resource Optimization → Analytics & Reporting',
            metadata: {
              dataType: 'System Flow',
              semantics: 'Shows the logical flow of data through the system',
              correlations: ['Patient Data', 'Treatment Data', 'Lab Data', 'Resource Data']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'highlight',
            target: 'navigation-menu',
            content: 'This is the main navigation menu. Different roles see different options based on their access level.',
            trigger: 'hover'
          }
        ]
      },
      {
        id: 'data-types',
        title: 'Core Data Types',
        content: [
          {
            type: 'table',
            title: 'Primary Data Types',
            content: `
| Data Type | Purpose | Key Fields | Relationships |
|-----------|---------|------------|---------------|
| Patient | Core demographic and medical info | ID, Name, DOB, Medical History | Links to all other data |
| Treatment Cycle | IVF cycle information | Cycle Number, Protocol, Dates | Patient → Cycle → Tasks |
| Laboratory Results | Test results and values | Test Type, Value, Reference Range | Patient → Cycle → Lab Results |
| Tasks | Workflow items and procedures | Title, Due Date, Assigned Role | Patient → Cycle → Tasks |
| Resources | Staff, equipment, rooms | Type, Availability, Capacity | Tasks → Resources |
            `,
            metadata: {
              dataType: 'Data Schema',
              semantics: 'Defines the core entities and their relationships in the system',
              correlations: ['Patient-Cycle', 'Cycle-Tasks', 'Tasks-Resources', 'Patient-LabResults']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'tooltip',
            target: 'patient-id',
            content: 'Patient ID is the unique identifier that links all data across the system. Format: P-YYYY-NNNN',
            trigger: 'hover'
          }
        ]
      }
    ],
    quiz: {
      id: 'fundamentals-quiz',
      title: 'EMR Fundamentals Quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'What is the primary purpose of the Patient ID?',
          options: [
            'To identify the patient\'s age',
            'To link all patient data across the system',
            'To determine treatment protocol',
            'To calculate costs'
          ],
          correctAnswer: 'To link all patient data across the system',
          explanation: 'Patient ID serves as the unique identifier that connects all patient-related data throughout the EMR system.',
          points: 10
        }
      ],
      passingScore: 80,
      timeLimit: 15
    },
    certification: true
  },
  {
    id: 'field-semantics',
    title: 'Field Types and Semantics',
    description: 'Deep dive into field types, their meanings, validation rules, and semantic relationships',
    category: TrainingCategory.FieldSemantics,
    difficulty: 'intermediate',
    estimatedDuration: 60,
    prerequisites: ['emr-fundamentals'],
    learningObjectives: [
      'Understand different field types and their constraints',
      'Learn field validation rules and error handling',
      'Master semantic relationships between fields',
      'Apply proper data entry techniques'
    ],
    sections: [
      {
        id: 'field-types',
        title: 'Field Types and Validation',
        content: [
          {
            type: 'table',
            title: 'Field Types Reference',
            content: `
| Field Type | Format | Validation Rules | Examples |
|------------|--------|------------------|----------|
| Patient ID | P-YYYY-NNNN | Required, Unique, Auto-generated | P-2024-0001 |
| Date | MM/DD/YYYY | Valid date, Not future (for historical) | 03/15/2024 |
| Age | Number | 18-65 for patients | 32 |
| Phone | (XXX) XXX-XXXX | Valid US format | (555) 123-4567 |
| Email | text@domain.com | Valid email format | patient@email.com |
| Medical Code | ICD-10/CPT | Valid medical coding | N97.0, 58970 |
| Dosage | Number + Unit | Positive number with unit | 150 IU, 5mg |
| Test Result | Number + Range | Within reference range or flagged | 15.2 mIU/mL (Normal: 5-25) |
            `,
            metadata: {
              dataType: 'Field Specifications',
              semantics: 'Defines data entry rules and validation constraints for each field type',
              correlations: ['Data Validation', 'Error Prevention', 'Data Quality']
            }
          },
          {
            type: 'text',
            title: 'Semantic Relationships',
            content: 'Fields in the EMR are interconnected through semantic relationships. For example, a patient\'s age affects medication dosing calculations, cycle day determines which tests are appropriate, and BMI influences treatment protocols.',
            metadata: {
              dataType: 'Business Logic',
              semantics: 'Explains how field values influence other system behaviors',
              correlations: ['Age-Dosing', 'CycleDay-Tests', 'BMI-Protocol'],
              derivedValues: ['Calculated dosages', 'Test schedules', 'Protocol recommendations']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'simulation',
            target: 'patient-form',
            content: 'Try entering different values to see validation in action',
            trigger: 'click'
          }
        ],
        practiceExercises: [
          {
            id: 'field-validation-exercise',
            title: 'Field Validation Practice',
            description: 'Practice entering data with proper validation',
            type: 'form-filling',
            scenario: 'A new patient, Sarah Johnson, age 34, needs to be registered. Her phone is (555) 123-4567 and email is sarah.j@email.com.',
            expectedActions: [
              'Enter patient name: Sarah Johnson',
              'Enter age: 34',
              'Enter phone: (555) 123-4567',
              'Enter email: sarah.j@email.com',
              'Verify all fields pass validation'
            ],
            hints: [
              'Patient ID is auto-generated',
              'Age must be between 18-65',
              'Phone format must include area code',
              'Email must contain @ symbol and domain'
            ],
            solution: {
              name: 'Sarah Johnson',
              age: 34,
              phone: '(555) 123-4567',
              email: 'sarah.j@email.com'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'data-correlations',
    title: 'Data Correlations and Derived Values',
    description: 'Understanding how data fields relate to each other and how derived values are calculated',
    category: TrainingCategory.Correlations,
    difficulty: 'advanced',
    estimatedDuration: 75,
    prerequisites: ['emr-fundamentals', 'field-semantics'],
    learningObjectives: [
      'Identify key data correlations in IVF treatment',
      'Understand derived value calculations',
      'Apply correlation knowledge to improve data quality',
      'Troubleshoot data inconsistencies'
    ],
    sections: [
      {
        id: 'correlation-patterns',
        title: 'Key Correlation Patterns',
        content: [
          {
            type: 'diagram',
            title: 'Data Correlation Map',
            content: 'Patient Age → Protocol Selection → Medication Dosing → Expected Response → Monitoring Schedule → Success Probability',
            metadata: {
              dataType: 'Correlation Chain',
              semantics: 'Shows how patient characteristics influence treatment decisions and outcomes',
              correlations: ['Age-Protocol', 'Protocol-Dosing', 'Dosing-Response', 'Response-Monitoring'],
              derivedValues: ['Calculated dosages', 'Monitoring schedules', 'Success predictions']
            }
          },
          {
            type: 'table',
            title: 'Derived Value Calculations',
            content: `
| Derived Value | Calculation | Input Fields | Business Logic |
|---------------|-------------|--------------|----------------|
| BMI | Weight(kg) / Height(m)² | Weight, Height | Affects protocol selection |
| Cycle Day | Current Date - Cycle Start Date | Current Date, Cycle Start | Determines appropriate tests |
| Medication Dosage | Base Dose × Age Factor × Weight Factor | Age, Weight, Protocol | Personalized dosing |
| Success Probability | Algorithm based on Age, AMH, Previous Cycles | Age, AMH, History | Counseling and expectations |
| Next Appointment | Last Appointment + Protocol Interval | Last Visit, Protocol | Automated scheduling |
            `,
            metadata: {
              dataType: 'Calculation Rules',
              semantics: 'Defines how derived values are computed from base data',
              correlations: ['Multiple field dependencies', 'Real-time calculations'],
              derivedValues: ['All calculated fields update automatically when inputs change']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'annotation',
            target: 'bmi-calculation',
            content: 'BMI is automatically calculated when height and weight are entered. Values outside normal range trigger protocol recommendations.',
            trigger: 'hover'
          }
        ]
      }
    ]
  },
  {
    id: 'workflow-management',
    title: 'Clinical Workflow Management',
    description: 'Master the complete IVF workflow from patient registration to outcome tracking',
    category: TrainingCategory.Workflow,
    difficulty: 'intermediate',
    estimatedDuration: 90,
    prerequisites: ['emr-fundamentals'],
    learningObjectives: [
      'Navigate complete IVF treatment workflows',
      'Understand workflow dependencies and timing',
      'Master task management and scheduling',
      'Apply workflow optimization techniques'
    ],
    sections: [
      {
        id: 'patient-workflow',
        title: 'Patient Journey Workflow',
        content: [
          {
            type: 'diagram',
            title: 'Complete IVF Workflow',
            content: 'Registration → Consultation → Testing → Protocol Selection → Cycle Start → Monitoring → Procedures → Outcome → Follow-up',
            metadata: {
              dataType: 'Workflow Process',
              semantics: 'Shows the complete patient journey through IVF treatment',
              correlations: ['Patient Status', 'Task Dependencies', 'Timeline Management'],
              derivedValues: ['Next appointment dates', 'Protocol milestones', 'Outcome predictions']
            }
          },
          {
            type: 'table',
            title: 'Workflow Stage Dependencies',
            content: `
| Stage | Prerequisites | Duration | Next Stage Trigger | Derived Actions |
|-------|--------------|----------|-------------------|-----------------|
| Registration | None | 30 min | Complete forms | Create patient record, assign ID |
| Consultation | Registration | 60 min | Medical clearance | Generate treatment plan |
| Baseline Testing | Consultation | 2-3 days | Normal results | Schedule cycle start |
| Cycle Start | Testing complete | 1 day | Medication start | Create monitoring schedule |
| Monitoring | Cycle active | 8-12 days | Trigger criteria | Adjust medications, schedule OPU |
| OPU | Trigger given | 1 day | Oocyte retrieval | Laboratory procedures |
| Transfer | Embryos ready | 3-5 days | Embryo selection | Schedule transfer |
| Pregnancy Test | 14 days post-transfer | 1 day | Result available | Outcome documentation |
            `,
            metadata: {
              dataType: 'Workflow Dependencies',
              semantics: 'Defines the logical flow and dependencies between workflow stages',
              correlations: ['Stage completion triggers next stage', 'Timeline calculations', 'Resource allocation'],
              derivedValues: ['Automatic scheduling', 'Progress tracking', 'Milestone alerts']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'simulation',
            target: 'workflow-demo',
            content: 'Interactive workflow simulation showing patient progression',
            trigger: 'click'
          }
        ]
      },
      {
        id: 'task-management',
        title: 'Task Management and Scheduling',
        content: [
          {
            type: 'text',
            title: 'Task Lifecycle Management',
            content: 'Tasks in the IVF EMR follow a structured lifecycle: Creation → Assignment → Scheduling → Execution → Completion → Documentation. Each stage has specific requirements and triggers automated actions.',
            metadata: {
              dataType: 'Task Management',
              semantics: 'Defines how tasks are created, managed, and completed within the system',
              correlations: ['Task status', 'Resource availability', 'Patient timeline'],
              derivedValues: ['Task priorities', 'Resource allocation', 'Schedule optimization']
            }
          },
          {
            type: 'table',
            title: 'Task Types and Characteristics',
            content: `
| Task Type | Duration | Resources Required | Scheduling Rules | Dependencies |
|-----------|----------|-------------------|------------------|--------------|
| Consultation | 30-60 min | Doctor, Room | Business hours | Patient registration |
| Ultrasound | 15-20 min | Doctor, Ultrasound, Room | Any time | Cycle day appropriate |
| Blood Draw | 5-10 min | Nurse, Lab | Morning preferred | Fasting if required |
| OPU | 30-45 min | Doctor, Nurse, OR, Anesthesia | Morning block | Trigger criteria met |
| Transfer | 15-30 min | Doctor, Embryologist, Room | Any time | Embryos ready |
| Counseling | 45-60 min | Counselor, Room | Business hours | As needed |
            `,
            metadata: {
              dataType: 'Task Specifications',
              semantics: 'Defines the characteristics and requirements for different task types',
              correlations: ['Resource requirements', 'Scheduling constraints', 'Workflow dependencies'],
              derivedValues: ['Optimal scheduling times', 'Resource utilization', 'Conflict detection']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'highlight',
            target: 'task-list',
            content: 'This shows the current task list with priorities and assignments',
            trigger: 'hover'
          }
        ]
      }
    ]
  },
  {
    id: 'derived-values-advanced',
    title: 'Advanced Derived Values and Calculations',
    description: 'Deep dive into how the system calculates derived values and automated decisions',
    category: TrainingCategory.DerivedValues,
    difficulty: 'advanced',
    estimatedDuration: 120,
    prerequisites: ['emr-fundamentals', 'field-semantics', 'data-correlations'],
    learningObjectives: [
      'Understand complex derived value calculations',
      'Master automated decision algorithms',
      'Apply predictive analytics concepts',
      'Troubleshoot calculation discrepancies'
    ],
    sections: [
      {
        id: 'calculation-algorithms',
        title: 'Core Calculation Algorithms',
        content: [
          {
            type: 'text',
            title: 'Medication Dosing Algorithm',
            content: 'The system uses a sophisticated algorithm to calculate personalized medication dosages based on patient characteristics, response patterns, and protocol requirements. The base calculation considers age, weight, AMH levels, and previous cycle responses.',
            metadata: {
              dataType: 'Algorithm Logic',
              semantics: 'Explains how medication dosages are automatically calculated',
              correlations: ['Patient age', 'Weight', 'AMH', 'Previous responses', 'Protocol type'],
              derivedValues: ['Starting dose', 'Adjustment factors', 'Maximum safe dose', 'Monitoring frequency']
            }
          },
          {
            type: 'table',
            title: 'Dosing Calculation Components',
            content: `
| Factor | Weight | Calculation | Impact | Example |
|--------|--------|-------------|--------|---------|
| Age | 30% | Base dose × age factor | Younger = higher dose | Age 28: 1.2x, Age 40: 0.8x |
| Weight | 25% | Dose per kg × weight | Linear relationship | 60kg = 150 IU, 80kg = 200 IU |
| AMH | 25% | Response predictor | Higher AMH = lower dose | AMH 5.0 = 0.8x, AMH 1.0 = 1.3x |
| Previous Response | 20% | Historical data | Poor response = higher dose | No response = 1.5x |
            `,
            metadata: {
              dataType: 'Calculation Matrix',
              semantics: 'Shows how different factors contribute to final dosage calculations',
              correlations: ['Multi-factor analysis', 'Weighted calculations', 'Safety limits'],
              derivedValues: ['Final dose recommendation', 'Adjustment schedule', 'Monitoring plan']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'annotation',
            target: 'dosing-calculator',
            content: 'Interactive dosing calculator showing real-time calculations',
            trigger: 'click'
          }
        ]
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics and Success Probability',
        content: [
          {
            type: 'text',
            title: 'Success Probability Algorithm',
            content: 'The system calculates treatment success probability using machine learning algorithms trained on thousands of cycles. The model considers patient demographics, medical history, laboratory values, and treatment parameters to provide accurate predictions.',
            metadata: {
              dataType: 'Predictive Model',
              semantics: 'Explains how success probabilities are calculated and used',
              correlations: ['Age', 'AMH', 'Diagnosis', 'Previous cycles', 'Protocol type'],
              derivedValues: ['Success percentage', 'Confidence intervals', 'Risk factors', 'Optimization suggestions']
            }
          },
          {
            type: 'table',
            title: 'Success Probability Factors',
            content: `
| Factor | Impact Weight | Calculation Method | Typical Range | Clinical Significance |
|--------|---------------|-------------------|---------------|----------------------|
| Age | 40% | Exponential decline after 35 | 20-80% | Primary predictor |
| AMH | 25% | Ovarian reserve indicator | 10-90% | Response predictor |
| Diagnosis | 20% | Condition-specific modifiers | 50-120% | Treatment complexity |
| Previous Cycles | 10% | Diminishing returns | 70-100% | Experience factor |
| Protocol | 5% | Optimization factor | 95-105% | Fine-tuning |
            `,
            metadata: {
              dataType: 'Predictive Factors',
              semantics: 'Defines how different factors contribute to success probability calculations',
              correlations: ['Multi-variable analysis', 'Statistical modeling', 'Clinical validation'],
              derivedValues: ['Probability score', 'Risk stratification', 'Treatment recommendations']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'simulation',
            target: 'probability-calculator',
            content: 'Interactive success probability calculator with real-time updates',
            trigger: 'click'
          }
        ]
      }
    ]
  },
  {
    id: 'role-based-access-training',
    title: 'Role-Based Access Control and Security',
    description: 'Comprehensive training on system security, access levels, and data protection',
    category: TrainingCategory.RoleBasedAccess,
    difficulty: 'intermediate',
    estimatedDuration: 75,
    prerequisites: ['emr-fundamentals'],
    learningObjectives: [
      'Understand role-based access hierarchy',
      'Master security best practices',
      'Apply appropriate data access controls',
      'Ensure HIPAA compliance'
    ],
    sections: [
      {
        id: 'access-hierarchy',
        title: 'Access Level Hierarchy',
        content: [
          {
            type: 'diagram',
            title: 'Role-Based Access Pyramid',
            content: 'Executive (Level 5) → Clinic Head (Level 4) → Doctor (Level 3) → Embryologist (Level 2) → Nurse (Level 1)',
            metadata: {
              dataType: 'Access Control',
              semantics: 'Defines the hierarchical access control system',
              correlations: ['Role permissions', 'Data access', 'Feature availability'],
              derivedValues: ['Menu visibility', 'Action permissions', 'Data filtering']
            }
          },
          {
            type: 'table',
            title: 'Role Permissions Matrix',
            content: `
| Feature | Nurse | Embryologist | Doctor | Clinic Head | Executive |
|---------|-------|--------------|--------|-------------|-----------|
| Patient Data | Read/Write | Lab Data Only | Full Access | Full Access | Full Access |
| Scheduling | Limited | Lab Schedule | Full Access | Full Access | Full Access |
| Quality Metrics | View Only | Lab Metrics | Full Access | Full Access | Full Access |
| Financial Data | No Access | No Access | View Only | Full Access | Full Access |
| System Config | No Access | No Access | No Access | Limited | Full Access |
| User Management | No Access | No Access | No Access | Limited | Full Access |
            `,
            metadata: {
              dataType: 'Permission Matrix',
              semantics: 'Defines specific permissions for each role level',
              correlations: ['Role hierarchy', 'Feature access', 'Data security'],
              derivedValues: ['UI customization', 'Menu filtering', 'Action validation']
            }
          }
        ],
        interactiveElements: [
          {
            type: 'highlight',
            target: 'role-indicator',
            content: 'Your current role determines what features and data you can access',
            trigger: 'hover'
          }
        ]
      }
    ]
  }
];

export class TrainingService {
  private static completedModules: Set<string> = new Set();
  private static currentProgress: Map<string, number> = new Map();

  // Get all available training modules
  static getTrainingModules(userRole?: UserRole): TrainingModule[] {
    // Filter modules based on user role if needed
    return TRAINING_MODULES;
  }

  // Get specific training module
  static getTrainingModule(moduleId: string): TrainingModule | null {
    return TRAINING_MODULES.find(module => module.id === moduleId) || null;
  }

  // Get modules by category
  static getModulesByCategory(category: TrainingCategory): TrainingModule[] {
    return TRAINING_MODULES.filter(module => module.category === category);
  }

  // Track module completion
  static markModuleCompleted(moduleId: string, userId: string): void {
    this.completedModules.add(`${userId}-${moduleId}`);
  }

  // Check if module is completed
  static isModuleCompleted(moduleId: string, userId: string): boolean {
    return this.completedModules.has(`${userId}-${moduleId}`);
  }

  // Update progress
  static updateProgress(moduleId: string, userId: string, progress: number): void {
    this.currentProgress.set(`${userId}-${moduleId}`, progress);
  }

  // Get progress
  static getProgress(moduleId: string, userId: string): number {
    return this.currentProgress.get(`${userId}-${moduleId}`) || 0;
  }

  // Get user's training summary
  static getTrainingSummary(userId: string): {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    certificationsEarned: number;
    totalHoursSpent: number;
  } {
    const totalModules = TRAINING_MODULES.length;
    const completedModules = TRAINING_MODULES.filter(module => 
      this.isModuleCompleted(module.id, userId)
    ).length;
    const inProgressModules = TRAINING_MODULES.filter(module => {
      const progress = this.getProgress(module.id, userId);
      return progress > 0 && progress < 100;
    }).length;
    const certificationsEarned = TRAINING_MODULES.filter(module => 
      module.certification && this.isModuleCompleted(module.id, userId)
    ).length;
    const totalHoursSpent = TRAINING_MODULES.reduce((total, module) => {
      if (this.isModuleCompleted(module.id, userId)) {
        return total + module.estimatedDuration;
      }
      const progress = this.getProgress(module.id, userId);
      return total + (module.estimatedDuration * progress / 100);
    }, 0);

    return {
      totalModules,
      completedModules,
      inProgressModules,
      certificationsEarned,
      totalHoursSpent: Math.round(totalHoursSpent / 60 * 10) / 10 // Convert to hours
    };
  }

  // Generate training recommendations
  static getTrainingRecommendations(userId: string, userRole: UserRole): string[] {
    const recommendations: string[] = [];
    const summary = this.getTrainingSummary(userId);

    if (summary.completedModules === 0) {
      recommendations.push('Start with "IVF EMR Fundamentals" to learn the basics');
    }

    if (summary.completedModules < 3) {
      recommendations.push('Complete core modules to build foundational knowledge');
    }

    // Role-specific recommendations
    if (userRole === UserRole.Doctor && !this.isModuleCompleted('data-correlations', userId)) {
      recommendations.push('Complete "Data Correlations" module to understand clinical decision support');
    }

    if (userRole === UserRole.Nurse && !this.isModuleCompleted('field-semantics', userId)) {
      recommendations.push('Complete "Field Semantics" module to improve data entry accuracy');
    }

    if (summary.certificationsEarned === 0) {
      recommendations.push('Earn your first certification by completing a module with certification');
    }

    return recommendations;
  }

  // Validate quiz answers
  static validateQuizAnswers(moduleId: string, answers: Record<string, string>): {
    score: number;
    passed: boolean;
    feedback: Record<string, { correct: boolean; explanation: string }>;
  } {
    const module = this.getTrainingModule(moduleId);
    if (!module?.quiz) {
      return { score: 0, passed: false, feedback: {} };
    }

    const quiz = module.quiz;
    let totalPoints = 0;
    let earnedPoints = 0;
    const feedback: Record<string, { correct: boolean; explanation: string }> = {};

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.includes(userAnswer)
        : question.correctAnswer === userAnswer;

      if (isCorrect) {
        earnedPoints += question.points;
      }

      feedback[question.id] = {
        correct: isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    return { score, passed, feedback };
  }

  // Generate interactive demo data for training
  static generateDemoPatient(): Patient {
    return {
      id: 'P-2024-DEMO',
      name: 'Demo Patient',
      age: 32,
      dateOfBirth: '1992-03-15',
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'demo@example.com',
        address: '123 Demo Street, Training City, TC 12345'
      },
      medicalHistory: {
        conditions: ['Unexplained Infertility'],
        medications: ['Prenatal Vitamins'],
        allergies: ['None Known'],
        surgicalHistory: []
      },
      insuranceInfo: {
        provider: 'Demo Insurance',
        policyNumber: 'DEMO123456',
        groupNumber: 'GRP789'
      },
      emergencyContact: {
        name: 'Demo Contact',
        relationship: 'Spouse',
        phone: '(555) 987-6543'
      },
      currentCycle: {
        cycleNumber: 1,
        startDate: '2024-03-01',
        protocol: 'Long Agonist Protocol',
        status: 'active'
      },
      treatmentHistory: [],
      notes: 'This is a demo patient for training purposes. All data is fictional.'
    };
  }

  // Generate demo tasks for training
  static generateDemoTasks(): TaskWithPatientInfo[] {
    return [
      {
        id: 'DEMO-001',
        title: 'Review Patient History',
        description: 'Review medical history and previous treatments',
        dueDate: new Date().toISOString(),
        priority: 'medium',
        status: 'pending',
        assignedTo: UserRole.Doctor,
        patientId: 'P-2024-DEMO',
        patientName: 'Demo Patient',
        estimatedDuration: 30,
        durationMinutes: 30,
        conflict: false,
        category: 'consultation'
      },
      {
        id: 'DEMO-002',
        title: 'Follicle Scan',
        description: 'Transvaginal ultrasound to assess follicle development',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
        assignedTo: UserRole.Doctor,
        patientId: 'P-2024-DEMO',
        patientName: 'Demo Patient',
        estimatedDuration: 15,
        durationMinutes: 15,
        conflict: false,
        category: 'monitoring'
      }
    ];
  }
}
