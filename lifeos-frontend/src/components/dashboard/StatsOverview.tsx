import React from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckSquare, Flame, Briefcase, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const StatsOverview = () => {
  const { user, tasks, studySessions, jobApplications } = useData();

  const studyTodayHours = studySessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.durationHours, 0) || 2.5;

  const tasksDoneCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionPct = Math.round((tasksDoneCount / totalTasksCount) * 100);

  const activeJobAppsCount = jobApplications.filter(
    j => ['Applied', 'OA', 'Interview'].includes(j.status)
  ).length;

  const interviewCount = jobApplications.filter(j => j.status === 'Interview').length;
  const oaCount = jobApplications.filter(j => j.status === 'OA').length;

  const userStreak = user?.streak ?? 0;
  const longestStreak = user?.longestStreak || Math.max(userStreak, 1);

  const stats = [
    {
      title: 'Study Time Today',
      value: `${studyTodayHours} hrs`,
      target: `/ ${user.dailyStudyGoalHours}h daily goal`,
      trend: '+18% vs yesterday',
      icon: Clock,
      color: 'amber',
      accentBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      progress: Math.min(100, Math.round((studyTodayHours / user.dailyStudyGoalHours) * 100))
    },
    {
      title: 'Tasks Completed',
      value: `${tasksDoneCount} of ${totalTasksCount}`,
      target: `${taskCompletionPct}% completed`,
      trend: 'On track',
      icon: CheckSquare,
      color: 'emerald',
      accentBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      progress: taskCompletionPct
    },
    {
      title: 'Daily Streak',
      value: `${userStreak} Days`,
      target: `Personal record: ${longestStreak} days`,
      trend: 'Keep momentum!',
      icon: Flame,
      color: 'orange',
      accentBg: 'bg-theme-accent-light text-theme-accent border-theme-border',
      progress: Math.min(100, Math.round((userStreak / longestStreak) * 100))
    },
    {
      title: 'Active Job Pipeline',
      value: `${activeJobAppsCount} Active`,
      target: `${interviewCount} Interviews · ${oaCount} OA`,
      trend: '1 Offer pending',
      icon: Briefcase,
      color: 'purple',
      accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      progress: 65
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-3xl border border-theme-border bg-theme-card p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-theme-accent cursor-pointer flex flex-col justify-between"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-dual opacity-80 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-2xl border ${stat.accentBg} transition-transform group-hover:scale-110 shadow-sm`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-theme-main tracking-tight">
                    {stat.value}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-theme-surface border border-theme-border text-theme-accent">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-theme-muted mt-1 font-medium">{stat.target}</p>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <ProgressBar progress={stat.progress} height="h-1.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
