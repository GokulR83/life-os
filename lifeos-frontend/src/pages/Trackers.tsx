import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudyTab } from '../components/trackers/StudyTab';
import { JobKanbanTab } from '../components/trackers/JobKanbanTab';
import { ExpensesTab } from '../components/trackers/ExpensesTab';
import { Clock, Briefcase, DollarSign } from 'lucide-react';

export const Trackers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'study';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName }, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Sub-nav Tab Selector */}
      <div className="flex items-center space-x-2 border-b border-theme-border pb-3">
        <button
          onClick={() => setActiveTab('study')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'study'
              ? 'bg-theme-accent text-white shadow-md'
              : 'text-theme-muted hover:bg-theme-card-hover'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Study Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-theme-accent text-white shadow-md'
              : 'text-theme-muted hover:bg-theme-card-hover'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job Applications Kanban</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-theme-accent text-white shadow-md'
              : 'text-theme-muted hover:bg-theme-card-hover'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Expenses Analytics</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'study' && <StudyTab />}
      {activeTab === 'jobs' && <JobKanbanTab />}
      {activeTab === 'expenses' && <ExpensesTab />}
    </div>
  );
};

export default Trackers;
