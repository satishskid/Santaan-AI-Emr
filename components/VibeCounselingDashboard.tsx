import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { CounselingPatient, PsychometricAssessment, PatientPersona, InterventionPlan } from '../types/counseling';
import { CounselingService } from '../services/counselingService';
import { Card, Badge, Button } from './ui/DesignSystem';
import {
  UserIcon,
  ClipboardListIcon,
  BarChart3Icon,
  SettingsIcon,
  HeartIcon,
  BrainIcon,
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon,
  BookOpenIcon
} from './icons';

interface VibeCounselingDashboardProps {
  currentUserRole: UserRole;
  onPatientSelect?: (patientId: string) => void;
}

interface DashboardStats {
  totalPatients: number;
  activeInterventions: number;
  completedAssessments: number;
  averageStressReduction: number;
  weeklyEngagement: number;
  complianceRate: number;
}

const VibeCounselingDashboard: React.FC<VibeCounselingDashboardProps> = ({
  currentUserRole,
  onPatientSelect
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'assessments' | 'interventions' | 'analytics' | 'config'>('overview');
  const [patients, setPatients] = useState<CounselingPatient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeInterventions: 0,
    completedAssessments: 0,
    averageStressReduction: 0,
    weeklyEngagement: 0,
    complianceRate: 0
  });
  const [selectedPatient, setSelectedPatient] = useState<CounselingPatient | null>(null);
  const [loading, setLoading] = useState(true);

  const counselingService = CounselingService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load mock data for demonstration
      const mockPatients = generateMockPatients();
      setPatients(mockPatients);
      
      const mockStats = calculateMockStats(mockPatients);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading counseling dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPatients = (): CounselingPatient[] => {
    return [
      {
        id: 'cp_001',
        name: 'Priya Sharma',
        age: 32,
        partnerId: 'cp_001_partner',
        partnerName: 'Raj Sharma',
        partnerAge: 35,
        primaryLanguage: 'hindi',
        secondaryLanguage: 'english',
        culturalBackground: 'North Indian Hindu',
        religiousConsiderations: 'Hindu traditions important',
        educationLevel: 'graduate',
        occupation: 'Software Engineer',
        monthlyIncome: 85000,
        insuranceCoverage: 'partial',
        treatmentHistory: [
          { cycleNumber: 1, outcome: 'negative', duration: 3, emotionalImpact: 'high' }
        ],
        currentCycleStage: 'ovarian_stimulation',
        referralSource: 'doctor'
      },
      {
        id: 'cp_002',
        name: 'Meera Patel',
        age: 28,
        partnerId: 'cp_002_partner',
        partnerName: 'Arjun Patel',
        partnerAge: 30,
        primaryLanguage: 'gujarati',
        secondaryLanguage: 'english',
        culturalBackground: 'Gujarati Jain',
        religiousConsiderations: 'Jain dietary restrictions',
        educationLevel: 'postgraduate',
        occupation: 'Doctor',
        monthlyIncome: 120000,
        insuranceCoverage: 'comprehensive',
        treatmentHistory: [],
        currentCycleStage: 'pre_treatment',
        referralSource: 'self'
      },
      {
        id: 'cp_003',
        name: 'Lakshmi Reddy',
        age: 35,
        partnerId: 'cp_003_partner',
        partnerName: 'Venkat Reddy',
        partnerAge: 38,
        primaryLanguage: 'telugu',
        secondaryLanguage: 'english',
        culturalBackground: 'South Indian Hindu',
        religiousConsiderations: 'Traditional Telugu customs',
        educationLevel: 'graduate',
        occupation: 'Teacher',
        monthlyIncome: 45000,
        insuranceCoverage: 'none',
        treatmentHistory: [
          { cycleNumber: 1, outcome: 'miscarriage', duration: 4, emotionalImpact: 'severe' },
          { cycleNumber: 2, outcome: 'negative', duration: 3, emotionalImpact: 'high' }
        ],
        currentCycleStage: 'two_week_wait',
        referralSource: 'doctor'
      }
    ];
  };

  const calculateMockStats = (patients: CounselingPatient[]): DashboardStats => {
    return {
      totalPatients: patients.length,
      activeInterventions: patients.filter(p => p.currentCycleStage !== 'pre_treatment').length,
      completedAssessments: Math.floor(patients.length * 0.8),
      averageStressReduction: 23, // percentage
      weeklyEngagement: 82, // percentage
      complianceRate: 95 // percentage
    };
  };

  const getPersonaColor = (persona: string) => {
    const colors = {
      'anxious_perfectionist': 'bg-red-100 text-red-800',
      'resilient_optimist': 'bg-green-100 text-green-800',
      'overwhelmed_newcomer': 'bg-yellow-100 text-yellow-800',
      'experienced_veteran': 'bg-blue-100 text-blue-800',
      'financially_stressed': 'bg-orange-100 text-orange-800',
      'culturally_conflicted': 'bg-purple-100 text-purple-800',
      'relationship_strained': 'bg-pink-100 text-pink-800',
      'spiritually_seeking': 'bg-indigo-100 text-indigo-800'
    };
    return colors[persona as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCycleStageDisplay = (stage: string) => {
    const stages = {
      'pre_treatment': 'Pre-Treatment',
      'ovarian_stimulation': 'Ovarian Stimulation',
      'monitoring': 'Monitoring',
      'trigger': 'Trigger',
      'opu': 'OPU',
      'fertilization': 'Fertilization',
      'embryo_culture': 'Embryo Culture',
      'transfer': 'Transfer',
      'two_week_wait': 'Two Week Wait',
      'pregnancy_test': 'Pregnancy Test',
      'early_pregnancy': 'Early Pregnancy',
      'post_treatment': 'Post Treatment'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <HeartIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vibe Counseling Platform</h1>
            <p className="text-gray-600">Evidence-based psychological support for IVF patients</p>
            <p className="text-sm text-blue-600 mt-1">
              Compliant with ESHRE Guidelines & Indian ART Act 2021
            </p>
          </div>
        </div>
      </Card>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 12% from last month</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Interventions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeInterventions}</p>
            </div>
            <BrainIcon className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 8% from last week</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stress Reduction</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageStressReduction}%</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 5% improvement</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Engagement</p>
              <p className="text-3xl font-bold text-gray-900">{stats.weeklyEngagement}%</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">Target: 80%</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.complianceRate}%</p>
            </div>
            <ClipboardListIcon className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">ART Act & ESHRE</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedAssessments}</p>
            </div>
            <BarChart3Icon className="h-8 w-8 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Completed this month</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New patient assessment completed</p>
              <p className="text-xs text-gray-600">Priya Sharma - Beck Anxiety Inventory: Moderate</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Intervention milestone achieved</p>
              <p className="text-xs text-gray-600">Meera Patel - Stress management skills improved</p>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <BrainIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AI persona generated</p>
              <p className="text-xs text-gray-600">Lakshmi Reddy - Experienced Veteran persona</p>
            </div>
            <span className="text-xs text-gray-500">2 days ago</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPatientsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Patient Management</h2>
        <Button variant="primary">
          <UserIcon className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card key={patient.id} variant="elevated" className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPatient(patient)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">Age: {patient.age}</p>
                <p className="text-sm text-gray-600">Income: ₹{patient.monthlyIncome.toLocaleString()}/month</p>
              </div>
              <Badge variant="info" size="sm">
                {patient.primaryLanguage}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cycle Stage:</span>
                <Badge variant="secondary" size="sm">
                  {getCycleStageDisplay(patient.currentCycleStage)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Treatment History:</span>
                <span className="text-sm font-medium">
                  {patient.treatmentHistory.length} cycle(s)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Insurance:</span>
                <Badge 
                  variant={patient.insuranceCoverage === 'comprehensive' ? 'success' : 
                          patient.insuranceCoverage === 'partial' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {patient.insuranceCoverage}
                </Badge>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Cultural Background:</p>
              <p className="text-sm text-gray-700">{patient.culturalBackground}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HeartIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vibe Counseling Platform</h1>
            <p className="text-gray-600">Evidence-based psychological support for IVF patients</p>
          </div>
        </div>
        <Badge variant="success">
          ESHRE & ART Act Compliant
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3Icon },
            { id: 'patients', label: 'Patients', icon: UserIcon },
            { id: 'assessments', label: 'Assessments', icon: ClipboardListIcon },
            { id: 'interventions', label: 'Interventions', icon: BrainIcon },
            { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon },
            { id: 'config', label: 'Configuration', icon: SettingsIcon }
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
      {activeTab === 'patients' && renderPatientsTab()}
      {activeTab === 'assessments' && (
        <div className="text-center py-12">
          <ClipboardListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Module</h3>
          <p className="text-gray-600">Psychometric assessments with BAI, DASS-21, and FertiQoL</p>
        </div>
      )}
      {activeTab === 'interventions' && (
        <div className="text-center py-12">
          <BrainIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Intervention Planning</h3>
          <p className="text-gray-600">Evidence-based CBT, mindfulness, and culturally adapted therapies</p>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Analytics</h3>
          <p className="text-gray-600">Real-time tracking of patient progress and intervention effectiveness</p>
        </div>
      )}
      {activeTab === 'config' && (
        <div className="text-center py-12">
          <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration</h3>
          <p className="text-gray-600">Customize protocols, timelines, and cultural adaptations</p>
        </div>
      )}
    </div>
  );
};

export default VibeCounselingDashboard;
