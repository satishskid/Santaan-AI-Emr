import { UserRole } from '../types';

// Complexity levels for procedures
export enum ComplexityLevel {
  Simple = 'simple',
  Standard = 'standard',
  Complex = 'complex'
}

// Procedure categories
export enum ProcedureCategory {
  Consultation = 'consultation',
  Monitoring = 'monitoring',
  Laboratory = 'laboratory',
  Surgical = 'surgical',
  Transfer = 'transfer',
  Administrative = 'administrative'
}

// Base procedure definition
export interface ProcedureDefinition {
  id: string;
  name: string;
  category: ProcedureCategory;
  requiredRole: UserRole;
  requiredEquipment?: string[];
  requiredRoom?: string;
  baseDuration: number; // minutes
  complexityModifiers: {
    [ComplexityLevel.Simple]: number;
    [ComplexityLevel.Standard]: number;
    [ComplexityLevel.Complex]: number;
  };
  bufferTime: {
    before: number; // minutes
    after: number; // minutes
  };
  fatigueScore: number; // 1-10 scale for emotional/physical demand
  canRunConcurrently: boolean;
  maxConcurrentInstances: number;
}

// Standard IVF procedure definitions
export const PROCEDURE_DEFINITIONS: Record<string, ProcedureDefinition> = {
  'Review Patient History': {
    id: 'review-history',
    name: 'Review Patient History',
    category: ProcedureCategory.Consultation,
    requiredRole: UserRole.Doctor,
    baseDuration: 30,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.5
    },
    bufferTime: { before: 5, after: 5 },
    fatigueScore: 3,
    canRunConcurrently: true,
    maxConcurrentInstances: 2
  },
  
  'Prescribe Medication': {
    id: 'prescribe-medication',
    name: 'Prescribe Medication',
    category: ProcedureCategory.Consultation,
    requiredRole: UserRole.Doctor,
    baseDuration: 20,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.7,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.3
    },
    bufferTime: { before: 5, after: 5 },
    fatigueScore: 2,
    canRunConcurrently: true,
    maxConcurrentInstances: 3
  },

  'Follicle Scan': {
    id: 'follicle-scan',
    name: 'Follicle Scan',
    category: ProcedureCategory.Monitoring,
    requiredRole: UserRole.Doctor,
    requiredEquipment: ['Ultrasound Machine'],
    requiredRoom: 'Ultrasound Room',
    baseDuration: 15,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.4
    },
    bufferTime: { before: 5, after: 10 },
    fatigueScore: 4,
    canRunConcurrently: false,
    maxConcurrentInstances: 1
  },

  'Perform OPU': {
    id: 'perform-opu',
    name: 'Oocyte Pickup (OPU)',
    category: ProcedureCategory.Surgical,
    requiredRole: UserRole.Doctor,
    requiredEquipment: ['Ultrasound Machine', 'Aspiration System', 'Anesthesia Equipment'],
    requiredRoom: 'Operating Theater',
    baseDuration: 45,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.6
    },
    bufferTime: { before: 15, after: 20 },
    fatigueScore: 8,
    canRunConcurrently: false,
    maxConcurrentInstances: 1
  },

  'Identify & Count Oocytes': {
    id: 'identify-oocytes',
    name: 'Identify & Count Oocytes',
    category: ProcedureCategory.Laboratory,
    requiredRole: UserRole.Embryologist,
    requiredEquipment: ['Microscope', 'Incubator'],
    requiredRoom: 'Laboratory',
    baseDuration: 30,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.7,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.4
    },
    bufferTime: { before: 10, after: 10 },
    fatigueScore: 6,
    canRunConcurrently: true,
    maxConcurrentInstances: 2
  },

  'Perform Fertilization': {
    id: 'perform-fertilization',
    name: 'Perform Fertilization',
    category: ProcedureCategory.Laboratory,
    requiredRole: UserRole.Embryologist,
    requiredEquipment: ['Microscope', 'Micromanipulator', 'Incubator'],
    requiredRoom: 'Laboratory',
    baseDuration: 60,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.5
    },
    bufferTime: { before: 15, after: 15 },
    fatigueScore: 7,
    canRunConcurrently: true,
    maxConcurrentInstances: 2
  },

  'Day 3 Check': {
    id: 'day-3-check',
    name: 'Day 3 Embryo Check',
    category: ProcedureCategory.Laboratory,
    requiredRole: UserRole.Embryologist,
    requiredEquipment: ['Microscope', 'Incubator'],
    requiredRoom: 'Laboratory',
    baseDuration: 20,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.3
    },
    bufferTime: { before: 5, after: 10 },
    fatigueScore: 4,
    canRunConcurrently: true,
    maxConcurrentInstances: 3
  },

  'Day 5 Check & Grading': {
    id: 'day-5-grading',
    name: 'Day 5 Check & Grading',
    category: ProcedureCategory.Laboratory,
    requiredRole: UserRole.Embryologist,
    requiredEquipment: ['Microscope', 'Incubator'],
    requiredRoom: 'Laboratory',
    baseDuration: 25,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.4
    },
    bufferTime: { before: 5, after: 10 },
    fatigueScore: 5,
    canRunConcurrently: true,
    maxConcurrentInstances: 2
  },

  'Embryo Transfer Procedure': {
    id: 'embryo-transfer',
    name: 'Embryo Transfer',
    category: ProcedureCategory.Transfer,
    requiredRole: UserRole.Doctor,
    requiredEquipment: ['Ultrasound Machine', 'Transfer Catheter'],
    requiredRoom: 'Transfer Room',
    baseDuration: 30,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.5
    },
    bufferTime: { before: 10, after: 15 },
    fatigueScore: 6,
    canRunConcurrently: false,
    maxConcurrentInstances: 1
  },

  'hCG Blood Test': {
    id: 'hcg-test',
    name: 'hCG Blood Test',
    category: ProcedureCategory.Monitoring,
    requiredRole: UserRole.Nurse,
    requiredEquipment: ['Blood Collection Kit'],
    baseDuration: 10,
    complexityModifiers: {
      [ComplexityLevel.Simple]: 0.8,
      [ComplexityLevel.Standard]: 1.0,
      [ComplexityLevel.Complex]: 1.2
    },
    bufferTime: { before: 5, after: 5 },
    fatigueScore: 2,
    canRunConcurrently: true,
    maxConcurrentInstances: 4
  }
};

// Service for calculating procedure durations
export class ProcessDurationService {
  
  // Calculate total duration including complexity and buffers
  static calculateTotalDuration(
    procedureId: string, 
    complexity: ComplexityLevel = ComplexityLevel.Standard,
    includeBuffers: boolean = true
  ): number {
    const procedure = PROCEDURE_DEFINITIONS[procedureId];
    if (!procedure) {
      console.warn(`Procedure definition not found for: ${procedureId}`);
      return 30; // Default fallback
    }

    const baseDuration = procedure.baseDuration;
    const complexityModifier = procedure.complexityModifiers[complexity];
    const adjustedDuration = Math.round(baseDuration * complexityModifier);

    if (!includeBuffers) {
      return adjustedDuration;
    }

    return adjustedDuration + procedure.bufferTime.before + procedure.bufferTime.after;
  }

  // Get procedure definition
  static getProcedureDefinition(procedureId: string): ProcedureDefinition | null {
    return PROCEDURE_DEFINITIONS[procedureId] || null;
  }

  // Get all procedures by category
  static getProceduresByCategory(category: ProcedureCategory): ProcedureDefinition[] {
    return Object.values(PROCEDURE_DEFINITIONS).filter(proc => proc.category === category);
  }

  // Get procedures by required role
  static getProceduresByRole(role: UserRole): ProcedureDefinition[] {
    return Object.values(PROCEDURE_DEFINITIONS).filter(proc => proc.requiredRole === role);
  }

  // Estimate complexity based on patient factors
  static estimateComplexity(patientAge: number, previousCycles: number, diagnoses: string[]): ComplexityLevel {
    let complexityScore = 0;

    // Age factor
    if (patientAge > 40) complexityScore += 2;
    else if (patientAge > 35) complexityScore += 1;

    // Previous cycles factor
    if (previousCycles > 3) complexityScore += 2;
    else if (previousCycles > 1) complexityScore += 1;

    // Diagnosis complexity
    const complexDiagnoses = ['severe male factor', 'endometriosis', 'poor ovarian reserve'];
    const hasComplexDiagnosis = diagnoses.some(d => 
      complexDiagnoses.some(cd => d.toLowerCase().includes(cd))
    );
    if (hasComplexDiagnosis) complexityScore += 2;

    // Determine complexity level
    if (complexityScore >= 4) return ComplexityLevel.Complex;
    if (complexityScore >= 2) return ComplexityLevel.Standard;
    return ComplexityLevel.Simple;
  }

  // Get duration breakdown for display
  static getDurationBreakdown(procedureId: string, complexity: ComplexityLevel) {
    const procedure = PROCEDURE_DEFINITIONS[procedureId];
    if (!procedure) return null;

    const baseDuration = procedure.baseDuration;
    const complexityModifier = procedure.complexityModifiers[complexity];
    const adjustedDuration = Math.round(baseDuration * complexityModifier);

    return {
      baseDuration,
      complexityModifier,
      adjustedDuration,
      bufferBefore: procedure.bufferTime.before,
      bufferAfter: procedure.bufferTime.after,
      totalDuration: adjustedDuration + procedure.bufferTime.before + procedure.bufferTime.after,
      fatigueScore: procedure.fatigueScore
    };
  }
}
