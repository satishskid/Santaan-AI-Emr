import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui/DesignSystem';
import {
  DatabaseIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  SettingsIcon,
  TrendingUpIcon,
  ClipboardListIcon,
  BrainIcon
} from './icons';

interface DataTypesProps {
  currentUserRole: string;
}

interface DataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'calculated' | 'derived';
  category: 'patient' | 'clinical' | 'laboratory' | 'financial' | 'administrative';
  required: boolean;
  validation: ValidationRule[];
  relationships: FieldRelationship[];
  derivedFrom?: string[];
  calculationFormula?: string;
  referenceRanges?: ReferenceRange[];
  description: string;
  examples: string[];
  dataQuality: number; // 0-100
  completionRate: number; // 0-100
  errorRate: number; // 0-100
}

interface ValidationRule {
  type: 'range' | 'format' | 'required' | 'custom' | 'cross_field';
  rule: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

interface FieldRelationship {
  relatedField: string;
  relationshipType: 'depends_on' | 'calculates' | 'validates_against' | 'triggers';
  description: string;
}

interface ReferenceRange {
  ageGroup: string;
  gender?: 'male' | 'female';
  unit: string;
  normalMin: number;
  normalMax: number;
  criticalMin?: number;
  criticalMax?: number;
  source: string;
}

interface DataCorrelation {
  field1: string;
  field2: string;
  correlationType: 'positive' | 'negative' | 'complex';
  strength: number; // 0-1
  clinicalSignificance: string;
  evidenceBase: string;
}

const DataTypes: React.FC<DataTypesProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'validation' | 'relationships' | 'quality' | 'correlations'>('overview');
  const [dataFields, setDataFields] = useState<DataField[]>([]);
  const [correlations, setCorrelations] = useState<DataCorrelation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDataTypes();
  }, []);

  const loadDataTypes = () => {
    // Mock data for demonstration
    setDataFields([
      {
        id: 'patient_age',
        name: 'Patient Age',
        type: 'number',
        category: 'patient',
        required: true,
        validation: [
          { type: 'range', rule: '18-50', errorMessage: 'Age must be between 18 and 50 years', severity: 'error' },
          { type: 'custom', rule: 'age_fertility_check', errorMessage: 'Age may affect treatment success rates', severity: 'warning' }
        ],
        relationships: [
          { relatedField: 'amh_level', relationshipType: 'validates_against', description: 'Age correlates with AMH levels' },
          { relatedField: 'success_probability', relationshipType: 'calculates', description: 'Age is primary factor in success calculation' }
        ],
        description: 'Patient age at time of treatment initiation',
        examples: ['32', '28', '35'],
        dataQuality: 98,
        completionRate: 100,
        errorRate: 2
      },
      {
        id: 'amh_level',
        name: 'Anti-Müllerian Hormone (AMH)',
        type: 'number',
        category: 'clinical',
        required: true,
        validation: [
          { type: 'range', rule: '0.1-15.0', errorMessage: 'AMH level outside normal range', severity: 'warning' },
          { type: 'format', rule: 'decimal_2', errorMessage: 'AMH must be decimal with 2 places', severity: 'error' }
        ],
        relationships: [
          { relatedField: 'ovarian_reserve', relationshipType: 'calculates', description: 'AMH determines ovarian reserve category' },
          { relatedField: 'medication_dosage', relationshipType: 'calculates', description: 'AMH influences FSH dosing' }
        ],
        referenceRanges: [
          { ageGroup: '20-29', unit: 'ng/mL', normalMin: 2.0, normalMax: 6.8, source: 'ASRM Guidelines 2023' },
          { ageGroup: '30-34', unit: 'ng/mL', normalMin: 1.7, normalMax: 5.3, source: 'ASRM Guidelines 2023' },
          { ageGroup: '35-39', unit: 'ng/mL', normalMin: 1.0, normalMax: 3.5, source: 'ASRM Guidelines 2023' },
          { ageGroup: '40+', unit: 'ng/mL', normalMin: 0.5, normalMax: 2.0, source: 'ASRM Guidelines 2023' }
        ],
        description: 'Hormone indicating ovarian reserve and response to stimulation',
        examples: ['3.2', '1.8', '5.1'],
        dataQuality: 95,
        completionRate: 98,
        errorRate: 5
      },
      {
        id: 'success_probability',
        name: 'Success Probability',
        type: 'calculated',
        category: 'clinical',
        required: false,
        validation: [
          { type: 'range', rule: '0-100', errorMessage: 'Probability must be between 0 and 100', severity: 'error' }
        ],
        relationships: [
          { relatedField: 'patient_age', relationshipType: 'depends_on', description: 'Age is primary factor' },
          { relatedField: 'amh_level', relationshipType: 'depends_on', description: 'AMH affects success rates' },
          { relatedField: 'bmi', relationshipType: 'depends_on', description: 'BMI influences outcomes' }
        ],
        derivedFrom: ['patient_age', 'amh_level', 'bmi', 'previous_cycles'],
        calculationFormula: 'AI_MODEL(age, amh, bmi, history) * clinical_factors',
        description: 'AI-calculated probability of live birth per cycle',
        examples: ['68%', '45%', '72%'],
        dataQuality: 92,
        completionRate: 85,
        errorRate: 8
      },
      {
        id: 'medication_dosage',
        name: 'FSH Starting Dose',
        type: 'calculated',
        category: 'clinical',
        required: true,
        validation: [
          { type: 'range', rule: '75-450', errorMessage: 'FSH dose outside safe range', severity: 'error' },
          { type: 'cross_field', rule: 'age_amh_validation', errorMessage: 'Dose inconsistent with age/AMH', severity: 'warning' }
        ],
        relationships: [
          { relatedField: 'amh_level', relationshipType: 'depends_on', description: 'AMH determines dosing strategy' },
          { relatedField: 'patient_weight', relationshipType: 'depends_on', description: 'Weight affects dosing' },
          { relatedField: 'previous_response', relationshipType: 'depends_on', description: 'Previous response guides dosing' }
        ],
        derivedFrom: ['amh_level', 'patient_age', 'patient_weight', 'previous_response'],
        calculationFormula: 'BASE_DOSE + AMH_FACTOR + AGE_FACTOR + WEIGHT_FACTOR',
        description: 'Personalized FSH starting dose based on patient characteristics',
        examples: ['225 IU', '150 IU', '300 IU'],
        dataQuality: 94,
        completionRate: 100,
        errorRate: 6
      },
      {
        id: 'cycle_cost',
        name: 'Cycle Cost',
        type: 'calculated',
        category: 'financial',
        required: true,
        validation: [
          { type: 'range', rule: '50000-500000', errorMessage: 'Cost outside expected range', severity: 'warning' },
          { type: 'custom', rule: 'insurance_validation', errorMessage: 'Insurance coverage needs verification', severity: 'info' }
        ],
        relationships: [
          { relatedField: 'medication_dosage', relationshipType: 'depends_on', description: 'Higher doses increase cost' },
          { relatedField: 'procedure_complexity', relationshipType: 'depends_on', description: 'Complex procedures cost more' },
          { relatedField: 'insurance_coverage', relationshipType: 'depends_on', description: 'Insurance affects final cost' }
        ],
        derivedFrom: ['medication_dosage', 'procedure_complexity', 'lab_tests', 'insurance_coverage'],
        calculationFormula: 'BASE_COST + MEDICATION_COST + PROCEDURE_COST - INSURANCE_COVERAGE',
        description: 'Total estimated cost for IVF cycle in INR',
        examples: ['₹1,25,000', '₹2,50,000', '₹1,80,000'],
        dataQuality: 88,
        completionRate: 95,
        errorRate: 12
      }
    ]);

    setCorrelations([
      {
        field1: 'patient_age',
        field2: 'amh_level',
        correlationType: 'negative',
        strength: 0.72,
        clinicalSignificance: 'Strong negative correlation - AMH decreases with age',
        evidenceBase: 'Seifer et al. (2011) - Age-related decline in AMH'
      },
      {
        field1: 'amh_level',
        field2: 'success_probability',
        correlationType: 'positive',
        strength: 0.68,
        clinicalSignificance: 'Higher AMH associated with better outcomes',
        evidenceBase: 'La Marca et al. (2010) - AMH predictive value'
      },
      {
        field1: 'patient_age',
        field2: 'success_probability',
        correlationType: 'negative',
        strength: 0.85,
        clinicalSignificance: 'Age is strongest predictor of IVF success',
        evidenceBase: 'SART National Summary (2023) - Age-specific success rates'
      }
    ]);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'text': 'bg-blue-100 text-blue-800',
      'number': 'bg-green-100 text-green-800',
      'date': 'bg-purple-100 text-purple-800',
      'boolean': 'bg-yellow-100 text-yellow-800',
      'select': 'bg-indigo-100 text-indigo-800',
      'calculated': 'bg-orange-100 text-orange-800',
      'derived': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'patient': 'bg-blue-100 text-blue-800',
      'clinical': 'bg-green-100 text-green-800',
      'laboratory': 'bg-purple-100 text-purple-800',
      'financial': 'bg-yellow-100 text-yellow-800',
      'administrative': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredFields = dataFields.filter(field => {
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-green-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <DatabaseIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Types & Field Semantics</h1>
            <p className="text-gray-600">Comprehensive data validation, relationships, and quality monitoring</p>
            <p className="text-sm text-blue-600 mt-1">
              {dataFields.length} fields • 98% data quality • AI-powered validation
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-3xl font-bold text-gray-900">{dataFields.length}</p>
            </div>
            <DatabaseIcon className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Across 5 categories</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Quality</p>
              <p className="text-3xl font-bold text-gray-900">94%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 8% improvement</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">96%</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Average across fields</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-3xl font-bold text-gray-900">6%</p>
            </div>
            <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↓ 3% reduction</p>
        </Card>
      </div>

      {/* Field Categories */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { category: 'patient', count: 12, color: 'blue', description: 'Demographics, history' },
            { category: 'clinical', count: 18, color: 'green', description: 'Medical data, assessments' },
            { category: 'laboratory', count: 15, color: 'purple', description: 'Lab results, tests' },
            { category: 'financial', count: 8, color: 'yellow', description: 'Costs, insurance' },
            { category: 'administrative', count: 6, color: 'gray', description: 'Scheduling, workflow' }
          ].map((cat) => (
            <div key={cat.category} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold text-${cat.color}-600`}>{cat.count}</div>
              <div className="text-sm font-medium text-gray-900 capitalize">{cat.category}</div>
              <div className="text-xs text-gray-500">{cat.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Relationships */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Data Relationships</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <BrainIcon className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Age → AMH Level → Success Probability</p>
              <p className="text-xs text-gray-600">Primary calculation chain for treatment planning</p>
            </div>
            <Badge variant="info" size="sm">85% correlation</Badge>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AMH Level → Medication Dosage → Cycle Cost</p>
              <p className="text-xs text-gray-600">Dosing algorithm affects treatment cost</p>
            </div>
            <Badge variant="success" size="sm">72% correlation</Badge>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Previous Response → Current Protocol → Expected Outcome</p>
              <p className="text-xs text-gray-600">Historical data improves future predictions</p>
            </div>
            <Badge variant="secondary" size="sm">68% correlation</Badge>
          </div>
        </div>
      </Card>

      {/* Validation Summary */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation & Quality Assurance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Real-time Validation</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Range checking for all numeric fields</li>
              <li>• Format validation for dates and text</li>
              <li>• Cross-field dependency validation</li>
              <li>• Clinical reference range checking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered Insights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Anomaly detection for outlier values</li>
              <li>• Pattern recognition for data quality</li>
              <li>• Predictive validation suggestions</li>
              <li>• Automated error correction</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quality Monitoring</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Continuous data quality scoring</li>
              <li>• Completion rate tracking</li>
              <li>• Error rate monitoring</li>
              <li>• Trend analysis and alerts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DatabaseIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Types & Field Semantics</h1>
            <p className="text-gray-600">Comprehensive data validation, relationships, and quality monitoring</p>
          </div>
        </div>
        <Badge variant="success">
          AI Validation Active
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: DatabaseIcon },
            { id: 'fields', label: 'Field Details', icon: ClipboardListIcon },
            { id: 'validation', label: 'Validation Rules', icon: CheckCircleIcon },
            { id: 'relationships', label: 'Relationships', icon: TrendingUpIcon },
            { id: 'quality', label: 'Data Quality', icon: BrainIcon },
            { id: 'correlations', label: 'Correlations', icon: InfoIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'fields' && (
        <div className="text-center py-12">
          <ClipboardListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Field Details</h3>
          <p className="text-gray-600">Detailed field specifications, validation rules, and examples</p>
        </div>
      )}
      {activeTab === 'validation' && (
        <div className="text-center py-12">
          <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Validation Rules</h3>
          <p className="text-gray-600">Comprehensive validation rules and error handling</p>
        </div>
      )}
      {activeTab === 'relationships' && (
        <div className="text-center py-12">
          <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Field Relationships</h3>
          <p className="text-gray-600">Data dependencies and calculation chains</p>
        </div>
      )}
      {activeTab === 'quality' && (
        <div className="text-center py-12">
          <BrainIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Data Quality</h3>
          <p className="text-gray-600">Quality metrics, completion rates, and error analysis</p>
        </div>
      )}
      {activeTab === 'correlations' && (
        <div className="text-center py-12">
          <InfoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Data Correlations</h3>
          <p className="text-gray-600">Statistical correlations and clinical significance</p>
        </div>
      )}
    </div>
  );
};

export default DataTypes;