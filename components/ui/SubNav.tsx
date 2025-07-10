
import React from 'react';

interface SubNavProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SubNav;
