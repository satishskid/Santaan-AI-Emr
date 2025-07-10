
import React from 'react';
import { Task, UserRole, Patient } from '../types';

// Import all the new form components
import DefaultForm from './forms/DefaultForm';
import HistoryForm from './forms/HistoryForm';
import FollicleScanForm from './forms/FollicleScanForm';
import SpermAnalysisForm from './forms/SpermAnalysisForm';
import PsychologicalAssessmentForm from './forms/PsychologicalAssessmentForm';
import OnboardingForm from './forms/OnboardingForm';
import MedicationForm from './forms/MedicationForm';
import EmbryoGradingForm from './forms/EmbryoGradingForm';
import HcgTestForm from './forms/HcgTestForm';

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
      case 'Psychological Assessment': return <PsychologicalAssessmentForm {...props} />;
      case 'Prescribe Medication': return <MedicationForm {...props} />;
      case 'Follicle Scan #1':
      case 'Follicle Scan #2': return <FollicleScanForm {...props} />;
      case 'hCG Blood Test': return <HcgTestForm {...props} />;

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
