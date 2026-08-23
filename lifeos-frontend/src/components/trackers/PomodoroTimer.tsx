import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from '../common/CustomSelect';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Plus, Minus, Target } from 'lucide-react';

export const PomodoroTimer = () => {
  const { tasks, addStudySession, updateTask } = useData();
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [subject, setSubject] = useState('DSA & System Design');
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Filter active (uncompleted) tasks for task selection dropdown
  const activeTasks = (tasks || []).filter((t) => t.status !== 'Done');
  const taskOptions = [
    { value: '', label: '🎯 Custom Subject / General Focus' },
    ...activeTasks.map((t) => ({
      value: t.id,
      label: `[${t.category}] ${t.title} (${t.status})`
    }))
  ];

  const selectedTask = (tasks || []).find((t) => t.id === selectedTaskId);

  const handleTaskChange = (taskId) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setSubject(found.title);
      }
    }
  };

  const presets = mode === 'focus' ? [15, 25, 45, 60] : [5, 10, 15];

  const handleDurationChange = (newMinutes, targetMode = mode) => {
    const validMins = Math.max(1, Math.min(240, Number(newMinutes) || 1));
    if (targetMode === 'focus') {
      setFocusMinutes(validMins);
      if (!isActive && mode === 'focus') {
        setSecondsLeft(validMins * 60);
      }
    } else {
      setBreakMinutes(validMins);
      if (!isActive && mode === 'break') {
        setSecondsLeft(validMins * 60);
      }
    }
  };

  const handleModeSwitch = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft((newMode === 'focus' ? focusMinutes : breakMinutes) * 60);
    setSessionCompleted(false);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setSessionCompleted(true);
      if (mode === 'focus') {
        const durationHours = Math.round((focusMinutes / 60) * 100) / 100;
        addStudySession({
          subject,
          durationHours,
          notes: selectedTask
            ? `Completed ${focusMinutes}m Focus Session on Task: "${selectedTask.title}"`
            : `Completed ${focusMinutes}m Focus Session on "${subject}"`
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode, focusMinutes, subject, selectedTaskId, selectedTask, addStudySession]);

  const toggleTimer = () => {
    if (!isActive && selectedTaskId) {
      const found = tasks.find((t) => t.id === selectedTaskId);
      if (found && found.status === 'Todo') {
        updateTask(selectedTaskId, { status: 'In Progress' });
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft((mode === 'focus' ? focusMinutes : breakMinutes) * 60);
    setSessionCompleted(false);
  };

  const currentTotal = (mode === 'focus' ? focusMinutes : breakMinutes) * 60;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = currentTotal > 0 ? Math.round(((currentTotal - secondsLeft) / currentTotal) * 100) : 0;

  return (
    <div className="p-5 rounded-3xl border border-theme-border bg-theme-card shadow-lg space-y-4">
      {/* Header & Minimal Duration Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-theme-accent-light text-theme-accent border border-theme-border">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-theme-main">Focus Pomodoro Timer</h3>
            <p className="text-xs text-theme-muted">Auto-logs completed focus blocks directly to study analytics</p>
          </div>
        </div>

        {/* Minimal Integrated Header Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold">
            <button
              onClick={() => handleModeSwitch('focus')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                mode === 'focus' ? 'bg-theme-accent text-white shadow-sm font-bold' : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => handleModeSwitch('break')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                mode === 'break' ? 'bg-theme-accent text-white shadow-sm font-bold' : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              Break
            </button>
          </div>

          {/* Quick Presets */}
          <div className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-theme-surface border border-theme-border text-[11px] font-bold">
            {presets.map((m) => (
              <button
                key={m}
                onClick={() => handleDurationChange(m)}
                disabled={isActive}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  (mode === 'focus' ? focusMinutes : breakMinutes) === m
                    ? 'bg-theme-accent-light text-theme-accent font-extrabold'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Sleek Minimal Stepper Input */}
          <div className="flex items-center space-x-1 p-1 px-2.5 rounded-xl bg-theme-surface border border-theme-border text-xs font-bold">
            <button
              onClick={() => handleDurationChange((mode === 'focus' ? focusMinutes : breakMinutes) - 5)}
              disabled={isActive}
              className="text-theme-muted hover:text-theme-accent transition disabled:opacity-30 cursor-pointer"
              title="Decrease 5m"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max="240"
                disabled={isActive}
                value={mode === 'focus' ? focusMinutes : breakMinutes}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-7 text-center text-xs font-extrabold text-theme-main bg-transparent outline-none font-mono"
              />
              <span className="text-xs font-extrabold text-theme-accent">m</span>
            </div>

            <button
              onClick={() => handleDurationChange((mode === 'focus' ? focusMinutes : breakMinutes) + 5)}
              disabled={isActive}
              className="text-theme-muted hover:text-theme-accent transition disabled:opacity-30 cursor-pointer"
              title="Increase 5m"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Timer Display & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-1">
        <div className="flex items-center space-x-6">
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" className="text-theme-card-hover" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="var(--accent)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progressPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-2xl font-extrabold text-theme-main font-mono tracking-tight">{timeString}</span>
          </div>

          <div className="space-y-2 min-w-[260px] sm:min-w-[340px]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-theme-muted uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-theme-accent" />
                <span>Target Task / Focus Area</span>
              </label>
              {selectedTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaskId('');
                    setSubject('DSA & System Design');
                  }}
                  className="text-[10px] font-extrabold text-theme-accent hover:underline cursor-pointer"
                >
                  Clear Task
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {/* Task Selector Dropdown */}
              <CustomSelect
                value={selectedTaskId}
                onChange={(e) => handleTaskChange(e.target.value)}
                options={taskOptions}
                variant="default"
                size="sm"
                fullWidth
              />

              {/* Subject Text Input */}
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSelectedTaskId('');
                }}
                placeholder="Or type custom focus subject..."
                className="w-full px-3.5 py-1.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
              />
            </div>

            {selectedTask && (
              <div className="flex items-center space-x-2 pt-0.5">
                <span className="text-[10px] font-extrabold text-theme-accent bg-theme-accent/10 border border-theme-accent/20 px-2 py-0.5 rounded-md">
                  {selectedTask.category}
                </span>
                <span className="text-[10px] font-bold text-theme-muted bg-theme-surface px-2 py-0.5 rounded-md border border-theme-border">
                  Status: {selectedTask.status}
                </span>
                <span className="text-[10px] font-bold text-theme-muted bg-theme-surface px-2 py-0.5 rounded-md border border-theme-border">
                  Priority: {selectedTask.priority}
                </span>
              </div>
            )}

            {sessionCompleted && (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 pt-1 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4" /> {focusMinutes}m Focus Session Auto-Logged!
              </p>
            )}
          </div>
        </div>

        {/* Start / Pause / Reset Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTimer}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center space-x-2 ${
              isActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-gradient-dual text-white shadow-theme-accent/20'
            }`}
          >
            {isActive ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{isActive ? 'Pause Timer' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-2xl border border-theme-border bg-theme-surface text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
