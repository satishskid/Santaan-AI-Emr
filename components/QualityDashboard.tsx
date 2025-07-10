
import React, { useState } from 'react';
import SubNav from './ui/SubNav';
import DetailedMetricsView from './DetailedMetricsView';

const QualityDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Detailed Metrics');
    
    const qualityTabs = ['Detailed Metrics', 'Counseling Quality', 'Staff Competency', 'KPI Settings'];

    const renderContent = () => {
        if (activeTab === 'Detailed Metrics') {
            return <DetailedMetricsView />;
        }
        
        return (
            <div className="mt-12 text-center text-slate-500">
                <p className="text-lg">Content for '{activeTab}' is not yet implemented.</p>
                <p className="text-sm mt-2">This section will contain analytics and reports for the selected quality area.</p>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Quality Management</h1>
            <SubNav tabs={qualityTabs} activeTab={activeTab} onTabClick={setActiveTab} />
            {renderContent()}
        </div>
    );
};

export default QualityDashboard;
