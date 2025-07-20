
import React from 'react';
import { Task, UserRole, Patient } from '../types';

// Import all the form components
import DefaultForm from './forms/DefaultForm';
import HistoryForm from './forms/HistoryForm';
import FollicleScanForm from './forms/FollicleScanForm';
import SpermAnalysisForm from './forms/SpermAnalysisForm';
import PsychologicalAssessmentForm from './forms/PsychologicalAssessmentForm';
import OnboardingForm from './forms/OnboardingForm';
import MedicationForm from './forms/MedicationForm';
import EmbryoGradingForm from './forms/EmbryoGradingForm';
import HcgTestForm from './forms/HcgTestForm';
import FertilityHistoryTask from './Patients/FertilityHistoryTask';

// Prep-Action-Post Forms
import OpuPrepForm from './forms/OpuPrepForm';
import OpuForm from './forms/OpuForm';
import OpuPostOpForm from './forms/OpuPostOpForm';
import FertilizationPrepForm from './forms/FertilizationPrepForm';
import FertilizationForm from './forms/FertilizationForm';
import PostFertilizationCheckForm from './forms/PostFertilizationCheckForm';
import OocyteIdentificationForm from './forms/OocyteIdentificationForm';
import Day3CheckForm from './forms/Day3CheckForm';
import EmbryoLabPrepForm from './forms/EmbryoLabPrepForm';
import TransferPrepForm from './forms/TransferPrepForm';
import EmbryoTransferForm from './forms/EmbryoTransferForm';
import TransferPostCareForm from './forms/TransferPostCareForm';


interface InlineTaskDetailProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  currentUserRole: UserRole;
  patient: Patient;
}

const InlineTaskDetail: React.FC<InlineTaskDetailProps> = (props) => {
  const { task, patient } = props;

  const renderForm = () => {
    const formProps = { ...props, patientProtocol: patient.protocol };
    switch (task.title) {
      // --- Clinical / Nursing Forms ---
      case 'Patient Onboarding': return <OnboardingForm {...formProps} />;
      case 'Review Patient History': return <HistoryForm {...props} />;
      case 'Fertility History Assessment': return <FertilityHistoryTask {...props} />;
      case 'Psychological Assessment': return <PsychologicalAssessmentForm {...props} />;
      case 'Prescribe Medication': return <MedicationForm {...props} />;
      case 'Follicle Scan #1':
      case 'Follicle Scan #2': return <FollicleScanForm {...props} />;
      case 'hCG Blood Test': return <HcgTestForm {...props} />;

      // --- COMPREHENSIVE PROCEDURE FORMS ---
      case 'IUI Procedure':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-xl border border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">🏥 IUI Procedure Form</h3>
              <p className="text-blue-700 dark:text-blue-300 mt-2">Comprehensive Intrauterine Insemination Documentation</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This comprehensive form includes patient information, counselling documentation,
                doctor assessments, nursing care, embryologist procedures, and post-care instructions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Includes:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Patient demographics & medical history</li>
                    <li>• Counselling session documentation</li>
                    <li>• Doctor assessment & procedure notes</li>
                    <li>• Nursing care and monitoring</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Features:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Multi-section tabbed interface</li>
                    <li>• Real-time validation</li>
                    <li>• AI-powered insights</li>
                    <li>• Comprehensive reporting</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => onSave({ ...task, data: { completed: true, comprehensive_form: 'iui' }, status: 'Completed' })}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Complete IUI Procedure Documentation
              </button>
            </div>
          </div>
        );

      case 'Counselling Session':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-xl border border-purple-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">💜 Comprehensive Counselling Session</h3>
              <p className="text-purple-700 dark:text-purple-300 mt-2">Patient Support & Emotional Wellness</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Complete counselling documentation including stress assessment, emotional support,
                coping strategies, and follow-up planning with cultural sensitivity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Assessment Areas:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Stress level evaluation</li>
                    <li>• Emotional state assessment</li>
                    <li>• Coping mechanism review</li>
                    <li>• Support system analysis</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Interventions:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Stress reduction techniques</li>
                    <li>• Mindfulness exercises</li>
                    <li>• Communication strategies</li>
                    <li>• Resource recommendations</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => onSave({ ...task, data: { completed: true, comprehensive_form: 'counselling' }, status: 'Completed' })}
                className="mt-6 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Complete Counselling Session
              </button>
            </div>
          </div>
        );

      case 'IVF Lab KPI Review':
        return (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-xl border border-emerald-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">🧪 IVF Lab KPI Dashboard</h3>
              <p className="text-emerald-700 dark:text-emerald-300 mt-2">Laboratory Quality Metrics & Performance Analysis</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comprehensive laboratory performance dashboard with real-time KPIs, quality metrics,
                trend analysis, and automated reporting for continuous improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Key Metrics:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Fertilization rates</li>
                    <li>• Blastocyst development</li>
                    <li>• Embryo quality grades</li>
                    <li>• Cryopreservation success</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Analytics:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Trend analysis & forecasting</li>
                    <li>• Comparative benchmarking</li>
                    <li>• Quality control alerts</li>
                    <li>• Performance optimization</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => onSave({ ...task, data: { completed: true, comprehensive_form: 'lab_kpi' }, status: 'Completed' })}
                className="mt-6 w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Complete Lab KPI Review
              </button>
            </div>
          </div>
        );

      // --- OPU Workflow ---
      case 'OPU Preparation': return <OpuPrepForm {...props} />;
      case 'Perform OPU': return <OpuForm {...props} />;
      case 'Post-OPU Recovery': return <OpuPostOpForm {...props} />;

      // --- Fertilization Workflow ---
      case 'Fertilization Preparation': return <FertilizationPrepForm {...props} />;
      case 'Sperm Analysis': return <SpermAnalysisForm {...props} />
      case 'Perform ICSI/IVF': return <FertilizationForm {...props} />;
      case 'Post-Fertilization Check (Day 1)': return <PostFertilizationCheckForm {...props} />;

      // --- Embryology Forms ---
      case 'Identify & Count Oocytes': return <OocyteIdentificationForm {...props} />;
      case 'Day 3 Check': return <Day3CheckForm {...props} />;
      case 'Day 5 Check & Grading': return <EmbryoGradingForm {...props} />;

      // --- Transfer Workflow ---
      case 'Embryo Lab Preparation': return <EmbryoLabPrepForm {...props} />;
      case 'Clinical Transfer Preparation': return <TransferPrepForm {...props} />;
      case 'Perform Transfer': return <EmbryoTransferForm {...props} />;
      case 'Post-Transfer Care': return <TransferPostCareForm {...props} />;

      default:
        // Render a generic form for tasks without a custom one
        return <DefaultForm {...props} />;
    }
  };

  return (
    <div className="mt-2 rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-800 shadow-lg animate-fade-in">
        {renderForm()}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default InlineTaskDetail;
