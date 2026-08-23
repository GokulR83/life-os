import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { HeroRingsCluster } from '../components/dashboard/HeroRingsCluster';
import { AIDailyBriefing } from '../components/dashboard/AIDailyBriefing';
import { StreakHeatmap } from '../components/dashboard/StreakHeatmap';
import { TodaysTasksWidget } from '../components/dashboard/TodaysTasksWidget';
import { UpcomingDeadlinesWidget } from '../components/dashboard/UpcomingDeadlinesWidget';
import { FlashcardWidget } from '../components/dashboard/FlashcardWidget';

export const Dashboard = () => {
  const {
    fetchTasksApi,
    fetchHabitsApi,
    fetchStudySessionsApi,
    fetchFlashcardsApi,
    fetchProjectsApi,
    fetchJobApplicationsApi,
    fetchExpensesApi,
    fetchHeatmapApi,
  } = useData();

  useEffect(() => {
    if (fetchTasksApi) fetchTasksApi();
    if (fetchHabitsApi) fetchHabitsApi();
    if (fetchStudySessionsApi) fetchStudySessionsApi();
    if (fetchFlashcardsApi) fetchFlashcardsApi();
    if (fetchProjectsApi) fetchProjectsApi();
    if (fetchJobApplicationsApi) fetchJobApplicationsApi();
    if (fetchExpensesApi) fetchExpensesApi();
    if (fetchHeatmapApi) fetchHeatmapApi();
  }, []);
  return (
    <div className="space-y-6">
      {/* Tier 1 — Hero Band */}
      <div className="space-y-3">
        <HeroRingsCluster />
        <AIDailyBriefing />
      </div>

      {/* Tier 2 — Momentum Row */}
      <StreakHeatmap />

      {/* Tier 3 — Actionable Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodaysTasksWidget />
        </div>
        <div className="space-y-6">
          <FlashcardWidget />
          <UpcomingDeadlinesWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
