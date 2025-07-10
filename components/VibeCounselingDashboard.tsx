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
  BookOpenIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  AlertTriangleIcon,
  InfoIcon
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

  const renderAssessmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Patient Assessments</h2>
        <Button variant="primary">
          <ClipboardListIcon className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Assessment Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Beck Anxiety Inventory (BAI)</h3>
              <p className="text-sm text-gray-600">21-item anxiety assessment</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed this month:</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average score:</span>
              <span className="font-medium">18.5 (Mild)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Evidence base:</span>
              <span className="text-blue-600">Beck et al. (1988)</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-4">
            Start BAI Assessment
          </Button>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">DASS-21</h3>
              <p className="text-sm text-gray-600">Depression, Anxiety, Stress Scale</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed this month:</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg Depression:</span>
              <span className="font-medium">12.3 (Mild)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Evidence base:</span>
              <span className="text-blue-600">Lovibond (1995)</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-4">
            Start DASS-21
          </Button>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HeartIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">FertiQoL</h3>
              <p className="text-sm text-gray-600">Fertility Quality of Life</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed this month:</span>
              <span className="font-medium">6</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average score:</span>
              <span className="font-medium">68.2/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Evidence base:</span>
              <span className="text-blue-600">Boivin et al. (2011)</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-4">
            Start FertiQoL
          </Button>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
        <div className="space-y-4">
          {[
            {
              patient: 'Priya Sharma',
              assessment: 'BAI',
              score: '22 (Moderate)',
              date: '2 hours ago',
              status: 'completed',
              persona: 'Anxious Perfectionist'
            },
            {
              patient: 'Meera Patel',
              assessment: 'DASS-21',
              score: 'D:8, A:6, S:12',
              date: '1 day ago',
              status: 'completed',
              persona: 'Resilient Optimist'
            },
            {
              patient: 'Lakshmi Reddy',
              assessment: 'FertiQoL',
              score: '45.2/100',
              date: '2 days ago',
              status: 'completed',
              persona: 'Experienced Veteran'
            }
          ].map((assessment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{assessment.patient}</div>
                  <div className="text-sm text-gray-600">{assessment.assessment} - {assessment.score}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success" size="sm" className="mb-1">
                  {assessment.persona}
                </Badge>
                <div className="text-sm text-gray-500">{assessment.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center space-x-3 mb-4">
          <BrainIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Assessment Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pattern Recognition</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 65% of patients show elevated anxiety during ovarian stimulation</li>
              <li>• Financial stress correlates with 40% higher DASS scores</li>
              <li>• Cultural conflicts peak during family decision-making phases</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Implement pre-cycle anxiety screening for all patients</li>
              <li>• Offer financial counseling for patients with income &lt; ₹50,000</li>
              <li>• Provide family counseling sessions for cultural conflicts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderInterventionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Intervention Planning</h2>
        <Button variant="primary">
          <BrainIcon className="h-4 w-4 mr-2" />
          Create Intervention Plan
        </Button>
      </div>

      {/* Evidence-Based Interventions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Cognitive Behavioral Therapy (CBT)',
            description: 'Gold standard for anxiety and depression treatment',
            evidence: 'Hofmann et al. (2012) - Meta-analysis',
            sessions: '12-16 sessions',
            effectiveness: '85%',
            culturalAdaptation: 'Indian family dynamics integration',
            color: 'blue'
          },
          {
            title: 'Mindfulness-Based Stress Reduction',
            description: 'Reduces cortisol and improves emotional regulation',
            evidence: 'Goyal et al. (2014) - Systematic review',
            sessions: '8 sessions',
            effectiveness: '78%',
            culturalAdaptation: 'Traditional Indian meditation practices',
            color: 'green'
          },
          {
            title: 'Culturally Adapted Therapy',
            description: 'Addresses cultural conflicts and values',
            evidence: 'Bernal & Sáez-Santiago (2006)',
            sessions: '10-12 sessions',
            effectiveness: '82%',
            culturalAdaptation: 'Hindu/Jain religious integration',
            color: 'purple'
          },
          {
            title: 'Solution-Focused Brief Therapy',
            description: 'Practical problem-solving approach',
            evidence: 'de Shazer et al. (2007)',
            sessions: '6-8 sessions',
            effectiveness: '75%',
            culturalAdaptation: 'Financial stress focus for India',
            color: 'orange'
          },
          {
            title: 'Psychoeducation',
            description: 'Knowledge-based anxiety reduction',
            evidence: 'Boivin (2003) - Fertility-specific',
            sessions: '4-6 sessions',
            effectiveness: '70%',
            culturalAdaptation: 'Hindi/Tamil language materials',
            color: 'indigo'
          },
          {
            title: 'Couples Therapy',
            description: 'Relationship strengthening during treatment',
            evidence: 'Schmidt et al. (2005)',
            sessions: '8-10 sessions',
            effectiveness: '80%',
            culturalAdaptation: 'Indian marriage dynamics',
            color: 'pink'
          }
        ].map((intervention, index) => (
          <Card key={index} variant="elevated" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 bg-${intervention.color}-100 rounded-lg`}>
                <BrainIcon className={`h-6 w-6 text-${intervention.color}-600`} />
              </div>
              <Badge variant="success" size="sm">{intervention.effectiveness} effective</Badge>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{intervention.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{intervention.description}</p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Evidence:</span>
                <span className="text-blue-600">{intervention.evidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{intervention.sessions}</span>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <span className="text-yellow-800 text-xs">
                  <strong>Cultural Adaptation:</strong> {intervention.culturalAdaptation}
                </span>
              </div>
            </div>

            <Button variant="secondary" size="sm" className="w-full mt-4">
              View Protocol Details
            </Button>
          </Card>
        ))}
      </div>

      {/* Active Intervention Plans */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Intervention Plans</h3>
        <div className="space-y-4">
          {[
            {
              patient: 'Priya Sharma',
              intervention: 'CBT + Mindfulness',
              progress: 75,
              sessions: '9/12 completed',
              nextSession: 'Tomorrow 2:00 PM',
              status: 'on_track',
              culturalNotes: 'Integrating Hindu meditation practices'
            },
            {
              patient: 'Meera Patel',
              intervention: 'Psychoeducation + Support',
              progress: 40,
              sessions: '2/6 completed',
              nextSession: 'Friday 10:00 AM',
              status: 'on_track',
              culturalNotes: 'Gujarati language materials provided'
            },
            {
              patient: 'Lakshmi Reddy',
              intervention: 'Grief Processing + CBT',
              progress: 60,
              sessions: '6/10 completed',
              nextSession: 'Monday 3:00 PM',
              status: 'needs_attention',
              culturalNotes: 'Telugu cultural grief practices included'
            }
          ].map((plan, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.patient}</h4>
                  <p className="text-sm text-gray-600">{plan.intervention}</p>
                </div>
                <Badge
                  variant={plan.status === 'on_track' ? 'success' : 'warning'}
                  size="sm"
                >
                  {plan.status === 'on_track' ? 'On Track' : 'Needs Attention'}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Sessions:</span>
                  <span className="ml-2 font-medium">{plan.sessions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Next:</span>
                  <span className="ml-2 font-medium">{plan.nextSession}</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                <strong>Cultural Adaptation:</strong> {plan.culturalNotes}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Intervention Effectiveness Analytics */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervention Effectiveness</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">23%</div>
            <div className="text-sm text-gray-600">Average Stress Reduction</div>
            <div className="text-xs text-gray-500 mt-1">Target: 20%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">87%</div>
            <div className="text-sm text-gray-600">Treatment Completion Rate</div>
            <div className="text-xs text-gray-500 mt-1">Industry avg: 65%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">4.2/5</div>
            <div className="text-sm text-gray-600">Patient Satisfaction</div>
            <div className="text-xs text-gray-500 mt-1">Cultural adaptation score</div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Counseling Analytics & Outcomes</h2>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
          <div className="text-sm font-medium text-gray-900">Stress Reduction</div>
          <div className="text-xs text-gray-500">Average across all patients</div>
          <div className="mt-2">
            <Badge variant="success" size="sm">↗ 5% from last month</Badge>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
          <div className="text-sm font-medium text-gray-900">Completion Rate</div>
          <div className="text-xs text-gray-500">Patients completing treatment</div>
          <div className="mt-2">
            <Badge variant="success" size="sm">↗ 12% from baseline</Badge>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">4.2/5</div>
          <div className="text-sm font-medium text-gray-900">Satisfaction Score</div>
          <div className="text-xs text-gray-500">Cultural adaptation rating</div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Target: 4.0</Badge>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">82%</div>
          <div className="text-sm font-medium text-gray-900">Weekly Engagement</div>
          <div className="text-xs text-gray-500">PWA usage rate</div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Target: 80%</Badge>
          </div>
        </Card>
      </div>

      {/* Outcome Trends */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Outcome Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Anxiety Reduction by Intervention Type</h4>
            <div className="space-y-3">
              {[
                { intervention: 'CBT', reduction: 28, patients: 15 },
                { intervention: 'Mindfulness', reduction: 22, patients: 12 },
                { intervention: 'Cultural Therapy', reduction: 25, patients: 8 },
                { intervention: 'Psychoeducation', reduction: 18, patients: 10 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{item.intervention}</span>
                    <span className="text-xs text-gray-500">({item.patients} patients)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.reduction * 3}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{item.reduction}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cultural Adaptation Effectiveness</h4>
            <div className="space-y-3">
              {[
                { culture: 'North Indian Hindu', satisfaction: 4.3, patients: 18 },
                { culture: 'South Indian Hindu', satisfaction: 4.1, patients: 12 },
                { culture: 'Gujarati Jain', satisfaction: 4.5, patients: 6 },
                { culture: 'Bengali', satisfaction: 4.0, patients: 8 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{item.culture}</span>
                    <span className="text-xs text-gray-500">({item.patients} patients)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${item.satisfaction * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{item.satisfaction}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Metrics */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm font-medium text-gray-900">ESHRE Compliance</div>
            <div className="text-xs text-gray-500">European guidelines adherence</div>
            <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mt-2" />
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm font-medium text-gray-900">ART Act 2021</div>
            <div className="text-xs text-gray-500">Indian regulatory compliance</div>
            <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mt-2" />
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm font-medium text-gray-900">DPDP Act 2023</div>
            <div className="text-xs text-gray-500">Data protection compliance</div>
            <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mt-2" />
          </div>
        </div>
      </Card>

      {/* Financial Impact */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cost Effectiveness (INR)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average counseling cost per patient:</span>
                <span className="font-medium">₹8,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reduced cycle cancellations:</span>
                <span className="font-medium text-green-600">₹2,50,000 saved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Improved success rates value:</span>
                <span className="font-medium text-green-600">₹5,00,000 additional</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Net ROI per month:</span>
                <span className="text-green-600">₹7,41,500</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Efficiency Gains</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Manual data entry reduction:</span>
                <span className="font-medium text-green-600">52%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Counselor time saved per patient:</span>
                <span className="font-medium text-green-600">45 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Patient adherence improvement:</span>
                <span className="font-medium text-green-600">34%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">No-show rate reduction:</span>
                <span className="font-medium text-green-600">28%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Evidence-Based Outcomes */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence-Based Outcome Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Scientific Validation</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                <span>BAI scores show 23% average reduction (Beck et al. validation)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                <span>DASS-21 improvements align with Lovibond norms</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                <span>FertiQoL scores exceed international benchmarks</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Cultural adaptations show superior outcomes</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Clinical Significance</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>15% improvement in IVF success rates with counseling</span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>40% reduction in treatment discontinuation</span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>Relationship satisfaction improved by 25%</span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>Long-term mental health outcomes positive</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Counseling Platform Configuration</h2>

      {/* Process Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Timelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Duration (days)
              </label>
              <input
                type="number"
                defaultValue="7"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Time allowed for initial assessment completion</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervention Cycle Duration (days)
              </label>
              <input
                type="number"
                defaultValue="84"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Standard intervention cycle length (12 weeks)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring Frequency (days)
              </label>
              <input
                type="number"
                defaultValue="14"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">How often to check patient progress</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Duration (days)
              </label>
              <input
                type="number"
                defaultValue="180"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Post-treatment follow-up period (6 months)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cost Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Cost Ranges (INR)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Basic Package</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Minimum Cost</label>
                <input
                  type="number"
                  defaultValue="15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Maximum Cost</label>
                <input
                  type="number"
                  defaultValue="25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Standard Package</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Minimum Cost</label>
                <input
                  type="number"
                  defaultValue="25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Maximum Cost</label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Premium Package</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Minimum Cost</label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Maximum Cost</label>
                <input
                  type="number"
                  defaultValue="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Protocol Configuration */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Therapeutic Approach
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="integrated">Integrated Approach</option>
                <option value="CBT">Cognitive Behavioral Therapy</option>
                <option value="mindfulness">Mindfulness-Based</option>
                <option value="culturally_adapted">Culturally Adapted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="group-sessions" defaultChecked className="rounded" />
              <label htmlFor="group-sessions" className="text-sm font-medium text-gray-700">
                Enable Group Sessions
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="couple-therapy" defaultChecked className="rounded" />
              <label htmlFor="couple-therapy" className="text-sm font-medium text-gray-700">
                Enable Couple Therapy
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="cultural-adaptations" defaultChecked className="rounded" />
              <label htmlFor="cultural-adaptations" className="text-sm font-medium text-gray-700">
                Cultural Adaptations Enabled
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="religious-considerations" defaultChecked className="rounded" />
              <label htmlFor="religious-considerations" className="text-sm font-medium text-gray-700">
                Religious Considerations
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Language & Cultural Settings */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Cultural Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Languages Supported
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Hindi', 'English', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'].map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <input type="checkbox" id={lang} defaultChecked={['Hindi', 'English', 'Tamil', 'Bengali', 'Telugu'].includes(lang)} className="rounded" />
                  <label htmlFor={lang} className="text-sm text-gray-700">{lang}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Settings */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance & Regulatory Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">ART Act 2021 Compliance</span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">ESHRE Guidelines</span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">DPDP Act 2023</span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Informed Consent Required</span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary">Reset to Defaults</Button>
        <Button variant="primary">Save Configuration</Button>
      </div>
    </div>
  );

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
      {activeTab === 'assessments' && renderAssessmentsTab()}
      {activeTab === 'interventions' && renderInterventionsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'config' && renderConfigurationTab()}
    </div>
  );
};

export default VibeCounselingDashboard;
