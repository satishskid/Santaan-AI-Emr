
import { ClinicalAuditData, MetricGroup, QualityMetric } from '../types';

const inputQualityMetrics: QualityMetric[] = [
    { metric: 'Mean Age (CPU)', value: '34.5', progress: 0, target: '-' },
    { metric: 'Total OPU Cycles', value: '150', progress: 0, target: '-' },
    { metric: 'Degenerate Rate', value: '4.2%', progress: (4.2/5)*100, target: '5%' },
    { metric: 'Cycle Cancellation Rate', value: '8.5%', progress: (8.5/10)*100, target: '10%' },
];

const processQualityMetrics: QualityMetric[] = [
    { metric: 'Oocyte Damage Rate', value: '3.8%', progress: (3.8/5)*100, target: '5%' },
    { metric: 'Fertilization Rate', value: '75.5%', progress: (75.5/70)*100, target: '70%' },
    { metric: 'Failed Fertilization Rate', value: '8.2%', progress: (8.2/10)*100, target: '10%' },
    { metric: 'Embryo Cleavage Rate', value: '92.3%', progress: (92.3/90)*100, target: '90%' },
    { metric: 'Blastocyst Formation Rate', value: '56.8%', progress: (56.8/50)*100, target: '50%' },
    { metric: 'Embryo Vitrification Rate', value: '96.5%', progress: (96.5/95)*100, target: '95%' },
    { metric: 'Embryo Cryo-survival Rate', value: '97.1%', progress: (97.1/95)*100, target: '95%' },
];

const outputQualityMetrics: QualityMetric[] = [
    { metric: 'Total ET/FET Done', value: '200', progress: 0, target: '-' },
    { metric: 'Average Age (ET Patients)', value: '35.2', progress: 0, target: '-' },
    { metric: 'Positive ß-HCG Rate', value: '48.5%', progress: (48.5/50)*100, target: '50%' },
    { metric: 'Biochemical Pregnancy Rate', value: '42.3%', progress: (42.3/45)*100, target: '45%' },
    { metric: 'Missed Abortion Rate', value: '12.5%', progress: (12.5/15)*100, target: '15%' },
    { metric: 'Ectopic Pregnancy Rate', value: '2.8%', progress: (2.8/5)*100, target: '5%' },
    { metric: 'OHSS Rate', value: '3.2%', progress: (3.2/5)*100, target: '5%' },
];


const MOCK_AUDIT_DATA: ClinicalAuditData = {
    centerName: 'Global View',
    dateRange: 'Apr 20, 2025 - Apr 29, 2025',
    groups: [
        { title: 'Input Quality Metrics', metrics: inputQualityMetrics },
        { title: 'Process Quality Metrics', metrics: processQualityMetrics },
        { title: 'Output Quality Metrics', metrics: outputQualityMetrics },
    ]
};


export const getClinicalAuditData = (): Promise<ClinicalAuditData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_AUDIT_DATA);
    }, 300);
  });
};
