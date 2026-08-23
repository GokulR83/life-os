import React from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckSquare, Flame, TrendingUp, Sparkles, Zap, Award } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const HeroRingsCluster = () => {
  const { user, tasks, studySessions } = useData();

  const studyTodayHours = (studySessions || [])
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + (s.durationHours || Number(s.duration) || 0), 0);

  const dailyGoal = user?.dailyStudyGoalHours || 4;
  const studyPct = Math.min(100, Math.round((studyTodayHours / dailyGoal) * 100));

  const taskList = tasks || [];
  const tasksDoneCount = taskList.filter(t => t.completed).length;
  const totalTasksCount = taskList.length;
  const taskPct = totalTasksCount > 0 ? Math.round((tasksDoneCount / totalTasksCount) * 100) : 0;

  const userStreak = user?.streak || 1;
  const longestStreak = user?.longestStreak || userStreak;
  const streakPct = Math.min(100, Math.round(((userStreak) / Math.max(longestStreak, 1)) * 100));

  // Compute Overall Daily Velocity Score
  const velocityScore = Math.round((studyPct * 0.4) + (taskPct * 0.4) + (streakPct * 0.2));

  return (
    <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-lg relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* Top Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Overall Velocity Radial Score Gauge */}
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 p-4 rounded-2xl border border-theme-border bg-theme-surface/70 w-full lg:w-auto shrink-0">
        <div className="relative flex items-center justify-center w-28 h-28">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-theme-card-hover" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="url(#velocityGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * velocityScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-theme-main tracking-tight font-mono">{velocityScore}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-theme-muted">Velocity</span>
          </div>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1.5">
            <Zap className="h-4 w-4 text-theme-accent" />
            <span className="text-xs font-extrabold text-theme-main uppercase tracking-wider">Performance Index</span>
          </div>
          <p className="text-xs text-theme-muted font-medium">Combined daily output across study, tasks & streak</p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-dual text-white text-[10px] font-extrabold shadow-sm mt-1">
            <Sparkles className="h-3 w-3 fill-white" /> High Momentum
          </span>
        </div>
      </div>

      {/* Right: 3 Clean Metric Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
        {/* Metric 1: Study Time */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-theme-accent" />
                Study Hours
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-theme-accent-light text-theme-accent flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +18%
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xl font-extrabold text-theme-main">{studyTodayHours}h</span>
              <span className="text-xs text-theme-muted font-bold ml-1">/ {dailyGoal}h goal</span>
            </div>
          </div>
          <ProgressBar progress={studyPct} height="h-2" />
        </div>

        {/* Metric 2: Tasks Completed */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-theme-accent-secondary" />
                Tasks Done
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> On Track
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xl font-extrabold text-theme-main">{tasksDoneCount} of {totalTasksCount}</span>
              <span className="text-xs text-theme-muted font-bold ml-1">({taskPct}%)</span>
            </div>
          </div>
          <ProgressBar progress={taskPct} height="h-2" />
        </div>

        {/* Metric 3: Streak Target */}
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/70 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                Daily Streak
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 flex items-center gap-1">
                <Award className="h-3 w-3" /> Best: {longestStreak}d
              </span>
            </div>

              <span className="text-xl font-extrabold text-theme-main flex items-center gap-1">
                <span>{userStreak} Days</span>
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500/20 inline" />
              </span>
          </div>
          <ProgressBar progress={streakPct} height="h-2" />
        </div>
      </div>
    </div>
  );
};
