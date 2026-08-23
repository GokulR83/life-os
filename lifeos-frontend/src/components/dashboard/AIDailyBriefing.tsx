import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';

export const AIDailyBriefing = () => {
  const { user, tasks, studySessions, jobApplications } = useData();
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const cacheKey = `lifeos_ai_briefing_${todayStr}`;

  const generateBriefing = () => {
    setLoading(true);
    
    // Evaluate metrics for daily summary context
    const studyHours = (studySessions || [])
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + (s.durationHours || Number(s.duration) || 0), 0);

    const userStreak = user?.streak || 0;
    const dailyGoal = user?.dailyStudyGoalHours || 4;

    const tasksDone = tasks.filter(t => t.completed).length;
    const interviewCount = jobApplications.filter(j => j.status === 'Interview').length;

    let text = '';
    if (studyHours >= dailyGoal && tasksDone >= 5) {
      text = `Exceptional focus today! You've logged ${studyHours}h study time, cleared ${tasksDone} priority tasks, and maintained your ${userStreak}-day streak.`;
    } else if (interviewCount > 0) {
      text = `High-impact day! You have ${interviewCount} active interview loop(s) underway; allocate your next 1.5h to System Design revision.`;
    } else {
      text = `Great momentum on your ${userStreak}-day streak — you're at ${studyHours}h study time today with ${(tasks || []).filter(t => !t.completed).length} open tasks remaining.`;
    }

    try {
      localStorage.setItem(cacheKey, text);
    } catch (e) {}

    setTimeout(() => {
      setBriefing(text);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setBriefing(cached);
    } else {
      generateBriefing();
    }
  }, []);

  return (
    <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="p-2 rounded-xl bg-gradient-dual text-white shadow-md shrink-0">
          <Bot className="h-4.5 w-4.5" />
        </div>
        <div className="truncate">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-accent flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Daily Briefing
            </span>
          </div>
          <p className="text-xs font-semibold text-theme-main truncate mt-0.5">
            {loading ? 'Synthesizing daily metrics...' : briefing}
          </p>
        </div>
      </div>

      <button
        onClick={generateBriefing}
        className="p-1.5 rounded-xl border border-theme-border text-theme-muted hover:text-theme-main hover:bg-theme-card transition shrink-0 cursor-pointer"
        title="Regenerate AI Briefing"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
