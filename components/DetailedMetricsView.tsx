
import React, { useState, useEffect } from 'react';
import { ClinicalAuditData, MetricGroup, QualityMetric } from '../types';
import { getClinicalAuditData } from '../services/qualityDataService';
import { LoadingIcon, CalendarDaysIcon } from './icons';
import ProgressBar from './ui/ProgressBar';

const MetricTable: React.FC<{ metrics: QualityMetric[] }> = ({ metrics }) => (
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Metric</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/3">Progress</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Target</th>
            </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-700">
            {metrics.map((metric) => (
                <tr key={metric.metric}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{metric.metric}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{metric.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {metric.progress > 0 ? <ProgressBar progress={metric.progress} /> : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{metric.target}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const MetricGroupCard: React.FC<{ group: MetricGroup }> = ({ group }) => (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
                {group.title}
            </h3>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700">
            <MetricTable metrics={group.metrics} />
        </div>
    </div>
);


const DetailedMetricsView: React.FC = () => {
    const [auditData, setAuditData] = useState<ClinicalAuditData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getClinicalAuditData().then(data => {
            setAuditData(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <LoadingIcon className="h-12 w-12 animate-spin" />
                <p className="ml-4 text-lg">Loading Audit Data...</p>
            </div>
        );
    }

    if (!auditData) {
        return <div className="text-center text-red-500">Failed to load audit data.</div>;
    }

    return (
        <div className="space-y-8 mt-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Clinical Audit Metrics</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>{auditData.dateRange}</span>
                </button>
            </div>
                {auditData.groups.map(group => (
                <MetricGroupCard key={group.title} group={group} />
            ))}
        </div>
    );
};

export default DetailedMetricsView;
