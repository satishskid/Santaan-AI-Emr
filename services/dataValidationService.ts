import { TaskData, Patient, TaskStatus } from '../types';

// Validation Rule Types
export interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'pattern' | 'custom';
  message: string;
  params?: any;
  validator?: (value: any, context?: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
  completeness: number; // 0-100%
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overall: number;
}

// SART/ESHRE Compliance Rules
export const COMPLIANCE_RULES = {
  patientHistory: [
    { field: 'age', type: 'required', message: 'Patient age is required for SART reporting' },
    { field: 'age', type: 'range', params: { min: 18, max: 55 }, message: 'Patient age must be between 18-55 years' },
    { field: 'diagnoses', type: 'required', message: 'Primary diagnosis is required for outcome tracking' },
    { field: 'previousIVFCycles', type: 'required', message: 'Previous IVF cycle count required for prognosis' }
  ],
  
  stimulationProtocol: [
    { field: 'medication', type: 'required', message: 'Medication type required for protocol tracking' },
    { field: 'dosage', type: 'required', message: 'Dosage information required for safety monitoring' },
    { field: 'duration', type: 'required', message: 'Treatment duration required for outcome analysis' }
  ],
  
  follicleMonitoring: [
    { field: 'measurements', type: 'required', message: 'Follicle measurements required for cycle monitoring' },
    { field: 'endometriumThickness', type: 'range', params: { min: 4, max: 20 }, message: 'Endometrial thickness must be 4-20mm' },
    { field: 'endometriumPattern', type: 'required', message: 'Endometrial pattern assessment required' }
  ],
  
  oocyteRetrieval: [
    { field: 'totalOocytes', type: 'required', message: 'Total oocyte count required for SART reporting' },
    { field: 'matureOocytes', type: 'required', message: 'Mature oocyte count required for fertilization planning' },
    { field: 'totalOocytes', type: 'custom', message: 'Mature oocytes cannot exceed total oocytes',
      validator: (value, context) => context?.matureOocytes <= value }
  ],
  
  fertilization: [
    { field: 'fertilizationMethod', type: 'required', message: 'Fertilization method required for outcome tracking' },
    { field: 'normalFertilization', type: 'required', message: 'Normal fertilization count required for SART reporting' },
    { field: 'spermParameters', type: 'required', message: 'Sperm analysis required for male factor assessment' }
  ],
  
  embryoCulture: [
    { field: 'embryos', type: 'required', message: 'Embryo development data required for quality assessment' },
    { field: 'gradingSystem', type: 'required', message: 'Grading system specification required for standardization' }
  ],
  
  embryoTransfer: [
    { field: 'embryosTransferred', type: 'required', message: 'Number of embryos transferred required for SART reporting' },
    { field: 'embryosTransferred', type: 'range', params: { min: 1, max: 3 }, message: 'Number of embryos should be 1-3 per guidelines' },
    { field: 'transferDifficulty', type: 'required', message: 'Transfer difficulty assessment required for outcome correlation' }
  ],
  
  pregnancyOutcome: [
    { field: 'hcgValue', type: 'required', message: 'hCG value required for pregnancy confirmation' },
    { field: 'testDate', type: 'required', message: 'Test date required for timeline tracking' }
  ]
};

// Data Quality Indicators
export class DataQualityService {
  
  // Validate task data against compliance rules
  static validateTaskData(taskTitle: string, data: TaskData, patient?: Patient): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    
    // Get applicable rules based on task type
    const rules = this.getRulesForTask(taskTitle);
    let requiredFields = 0;
    let completedFields = 0;
    
    rules.forEach(rule => {
      if (rule.type === 'required') requiredFields++;
      
      const fieldValue = this.getFieldValue(data, rule.field);
      const isFieldComplete = this.isFieldComplete(fieldValue);
      
      if (isFieldComplete) completedFields++;
      
      const validationError = this.validateField(rule, fieldValue, data);
      if (validationError) {
        if (rule.type === 'required') {
          errors.push({
            field: rule.field,
            message: rule.message,
            severity: 'error'
          });
        } else {
          warnings.push({
            field: rule.field,
            message: rule.message
          });
        }
      }
    });
    
    // Calculate completeness
    const completeness = requiredFields > 0 ? (completedFields / requiredFields) * 100 : 100;
    
    // Add contextual validations
    this.addContextualValidations(taskTitle, data, patient, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.round(completeness)
    };
  }
  
  // Get validation rules for specific task
  private static getRulesForTask(taskTitle: string): ValidationRule[] {
    const taskRuleMap: Record<string, keyof typeof COMPLIANCE_RULES> = {
      'Review Patient History': 'patientHistory',
      'Prescribe Medication': 'stimulationProtocol',
      'Follicle Scan': 'follicleMonitoring',
      'Identify & Count Oocytes': 'oocyteRetrieval',
      'Sperm Analysis': 'fertilization',
      'Perform Fertilization': 'fertilization',
      'Day 3 Check': 'embryoCulture',
      'Day 5 Check & Grading': 'embryoCulture',
      'Embryo Transfer Procedure': 'embryoTransfer',
      'hCG Blood Test': 'pregnancyOutcome'
    };
    
    const ruleKey = taskRuleMap[taskTitle];
    return ruleKey ? COMPLIANCE_RULES[ruleKey] : [];
  }
  
  // Extract field value from nested data structure
  private static getFieldValue(data: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
  }
  
  // Check if field has meaningful data
  private static isFieldComplete(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }
  
  // Validate individual field against rule
  private static validateField(rule: ValidationRule, value: any, context: any): boolean {
    switch (rule.type) {
      case 'required':
        return !this.isFieldComplete(value);
        
      case 'range':
        if (!this.isFieldComplete(value)) return false;
        const numValue = Number(value);
        return numValue < rule.params.min || numValue > rule.params.max;
        
      case 'pattern':
        if (!this.isFieldComplete(value)) return false;
        return !new RegExp(rule.params.pattern).test(String(value));
        
      case 'custom':
        return rule.validator ? !rule.validator(value, context) : false;
        
      default:
        return false;
    }
  }
  
  // Add contextual validations based on clinical logic
  private static addContextualValidations(
    taskTitle: string, 
    data: any, 
    patient: Patient | undefined,
    errors: ValidationResult['errors'],
    warnings: ValidationResult['warnings']
  ): void {
    
    // Age-based validations
    if (patient && patient.age > 42) {
      if (taskTitle === 'Prescribe Medication' && !data.explanation?.includes('age')) {
        warnings.push({
          field: 'explanation',
          message: 'Consider age-related protocol adjustments for patients >42 years'
        });
      }
    }
    
    // Protocol-specific validations
    if (taskTitle === 'Follicle Scan' && data.measurements) {
      const totalFollicles = data.measurements.reduce((sum: number, ovary: any) => sum + ovary.count, 0);
      if (totalFollicles < 3) {
        warnings.push({
          field: 'measurements',
          message: 'Low follicle count may indicate poor response - consider cycle review'
        });
      }
    }
    
    // Timeline validations
    if (patient) {
      const cycleDay = this.calculateCycleDay(patient.cycleStartDate);
      if (taskTitle === 'Embryo Transfer Procedure' && cycleDay < 15) {
        warnings.push({
          field: 'transferDate',
          message: 'Early transfer timing - verify embryo development stage'
        });
      }
    }
  }
  
  // Calculate cycle day from start date
  private static calculateCycleDay(startDate: string): number {
    const start = new Date(startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Calculate overall data quality metrics for patient
  static calculateDataQuality(patient: Patient): DataQualityMetrics {
    let totalTasks = 0;
    let completeTasks = 0;
    let totalFields = 0;
    let completeFields = 0;
    let timelyTasks = 0;
    
    patient.pathway.forEach(step => {
      step.tasks.forEach(task => {
        totalTasks++;
        
        if (task.status === TaskStatus.Completed) {
          completeTasks++;
          
          // Check timeliness (completed within 24 hours of due date)
          const dueDate = new Date(task.dueDate);
          const completedDate = new Date(); // Assume completed today for demo
          const timeDiff = completedDate.getTime() - dueDate.getTime();
          if (timeDiff <= 24 * 60 * 60 * 1000) { // 24 hours
            timelyTasks++;
          }
        }
        
        // Analyze field completeness
        const validation = this.validateTaskData(task.title, task.data, patient);
        const rules = this.getRulesForTask(task.title);
        const requiredFieldCount = rules.filter(r => r.type === 'required').length;
        
        totalFields += requiredFieldCount;
        completeFields += Math.round((validation.completeness / 100) * requiredFieldCount);
      });
    });
    
    const completeness = totalFields > 0 ? (completeFields / totalFields) * 100 : 100;
    const accuracy = totalTasks > 0 ? (completeTasks / totalTasks) * 100 : 100;
    const consistency = 95; // Simulated - would check data consistency rules
    const timeliness = totalTasks > 0 ? (timelyTasks / totalTasks) * 100 : 100;
    
    const overall = (completeness + accuracy + consistency + timeliness) / 4;
    
    return {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      consistency: Math.round(consistency),
      timeliness: Math.round(timeliness),
      overall: Math.round(overall)
    };
  }
  
  // Get data quality alerts for clinic
  static getDataQualityAlerts(patients: Patient[]): Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    patientId?: string;
    taskId?: string;
    action: string;
  }> {
    const alerts = [];
    
    patients.forEach(patient => {
      const quality = this.calculateDataQuality(patient);
      
      if (quality.completeness < 80) {
        alerts.push({
          type: 'warning' as const,
          message: `${patient.name}: Data completeness below 80% (${quality.completeness}%)`,
          patientId: patient.id,
          action: 'Review incomplete tasks and ensure all required fields are captured'
        });
      }
      
      if (quality.timeliness < 90) {
        alerts.push({
          type: 'info' as const,
          message: `${patient.name}: Some tasks completed late`,
          patientId: patient.id,
          action: 'Review workflow timing and staff allocation'
        });
      }
      
      // Check for specific validation errors
      patient.pathway.forEach(step => {
        step.tasks.forEach(task => {
          const validation = this.validateTaskData(task.title, task.data, patient);
          if (validation.errors.length > 0) {
            alerts.push({
              type: 'error' as const,
              message: `${patient.name}: ${task.title} has validation errors`,
              patientId: patient.id,
              taskId: task.id,
              action: 'Complete required fields to ensure compliance'
            });
          }
        });
      });
    });
    
    return alerts;
  }
}
