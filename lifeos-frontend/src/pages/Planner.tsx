// @ts-nocheck
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { CustomSelect } from '../components/common/CustomSelect';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { TaskEditModal } from '../components/common/TaskEditModal';
import { TaskCreateModal } from '../components/common/TaskCreateModal';
import { CalendarView } from '../components/planner/CalendarView';
import { OverdueTaskModal } from '../components/planner/OverdueTaskModal';
import { HabitManageModal } from '../components/planner/HabitManageModal';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  Kanban,
  ListTodo,
  Plus,
  AlertTriangle,
  Search,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  RotateCcw,
  Loader2
} from 'lucide-react';

export const Planner = () => {
  const {
    tasks,
    fetchTasksApi,
    addTaskApi,
    updateTaskApi,
    deleteTaskApi,
    toggleTaskApi,
    moveAllOverdueToTodayApi,
    habits,
    fetchHabitsApi,
    addHabitApi,
    toggleHabitApi,
    updateHabitApi,
    deleteHabitApi,
    toggleTaskStatus,
    updateTaskStatus,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    clearCompletedTasks,
    toggleHabit,
    addHabit
  } = useData();

  React.useEffect(() => {
    if (fetchTasksApi) fetchTasksApi();
    if (fetchHabitsApi) fetchHabitsApi();
  }, []);

  const [viewMode, setViewMode] = useState('today'); // 'today' | 'calendar' | 'sprint'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'today', 'overdue', 'high', 'completed'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedListDate, setSelectedListDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced API Search Effect (300ms delay for search / category filter)
  React.useEffect(() => {
    if (!searchQuery.trim() && selectedCategory === 'All') return;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      if (fetchTasksApi) {
        const params: any = {};
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        await fetchTasksApi(params, true);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);
  
  // UI State
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialStatus, setCreateModalInitialStatus] = useState('Todo');
  const [createModalInitialDeadline, setCreateModalInitialDeadline] = useState('');

  const kanbanColumns = ['Todo', 'In Progress', 'Done', 'Blocked'];
  const categories = ['All', 'DSA', 'Career', 'Projects', 'Learning', 'Personal'];

  const getPriorityVariant = (p) => {
    switch (p) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'default';
    }
  };

  const getCategoryBadgeStyle = (cat) => {
    switch (cat) {
      case 'DSA':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Career':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Projects':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Learning':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Personal':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDeadline = (deadlineStr, completed) => {
    if (!deadlineStr) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const taskDateStr = deadlineStr.split('T')[0];

    if (completed) {
      return {
        text: 'Completed',
        isOverdue: false,
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }

    if (taskDateStr < todayStr) {
      const deadline = new Date(deadlineStr);
      const formattedDate = !isNaN(deadline.getTime())
        ? deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : taskDateStr;
      return {
        text: `Overdue (${formattedDate})`,
        isOverdue: true,
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }

    if (taskDateStr === todayStr) {
      return {
        text: 'Due Today',
        isOverdue: false,
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }

    const deadline = new Date(deadlineStr);
    const formattedDate = !isNaN(deadline.getTime())
      ? deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : taskDateStr;

    return {
      text: `Due ${formattedDate}`,
      isOverdue: false,
      className: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    };
  };

  const openCreateModal = (status = 'Todo', dateStr = '') => {
    setCreateModalInitialStatus(status);
    setCreateModalInitialDeadline(dateStr ? `${dateStr}T18:00` : '');
    setIsCreateModalOpen(true);
  };

  // Current Date Metrics Calculations (Based on selectedListDate / Today)
  const targetDateStr = selectedListDate || new Date().toISOString().split('T')[0];

  const todayDateTasks = tasks.filter((t) => {
    const rawDate = t.dueDate || t.deadline;
    if (!rawDate) return false;
    const taskDateStr = rawDate.split('T')[0];
    return taskDateStr === targetDateStr || (!t.completed && taskDateStr < targetDateStr);
  });

  const totalTasks = todayDateTasks.length;
  const completedTasks = todayDateTasks.filter((t) => t.completed).length;
  const pendingTasks = todayDateTasks.filter((t) => !t.completed);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstMinutesRemaining = pendingTasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 45),
    0
  );
  const remainingHours = Math.floor(totalEstMinutesRemaining / 60);
  const remainingMins = totalEstMinutesRemaining % 60;

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = pendingTasks.filter((t) => {
    const rawDate = t.dueDate || t.deadline;
    if (!rawDate) return false;
    const taskDateStr = rawDate.split('T')[0];
    return taskDateStr < todayStr;
  });
  const overdueCount = overdueTasks.length;

  // Overdue Rollover Handlers
  const handleMoveAllOverdueToToday = async () => {
    if (moveAllOverdueToTodayApi) {
      await moveAllOverdueToTodayApi();
    } else {
      const todayIso = new Date().toISOString();
      bulkUpdateTasks(
        overdueTasks.map((t) => t.id || t._id),
        { deadline: todayIso }
      );
    }
    setIsOverdueModalOpen(false);
  };

  const handleMoveAllOverdueToTomorrow = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString();
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    for (const t of overdueTasks) {
      const tId = t.id || t._id;
      if (updateTaskApi) {
        await updateTaskApi(tId, { deadline: tomorrowIso, dueDate: tomorrowDateStr });
      } else {
        updateTask(tId, { deadline: tomorrowIso, dueDate: tomorrowDateStr });
      }
    }
    setIsOverdueModalOpen(false);
  };

  const handleMoveTaskToToday = async (taskId) => {
    const todayIso = new Date().toISOString();
    const todayStr = todayIso.split('T')[0];
    if (updateTaskApi) {
      await updateTaskApi(taskId, { deadline: todayIso, dueDate: todayStr });
    } else {
      updateTask(taskId, { deadline: todayIso, dueDate: todayStr });
    }
  };

  const handleMoveTaskToTomorrow = async (taskId) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString();
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    if (updateTaskApi) {
      await updateTaskApi(taskId, { deadline: tomorrowIso, dueDate: tomorrowDateStr });
    } else {
      updateTask(taskId, { deadline: tomorrowIso, dueDate: tomorrowDateStr });
    }
  };

  const handleMoveAllOverdueToDate = async (targetDateStr) => {
    if (!targetDateStr) return;
    const targetIso = new Date(`${targetDateStr}T18:00:00Z`).toISOString();
    for (const t of overdueTasks) {
      const tId = t.id || t._id;
      if (updateTaskApi) {
        await updateTaskApi(tId, { deadline: targetIso, dueDate: targetDateStr });
      } else {
        updateTask(tId, { deadline: targetIso, dueDate: targetDateStr });
      }
    }
    setIsOverdueModalOpen(false);
  };

  const handleMoveTaskToDate = async (taskId, targetDateStr) => {
    if (!targetDateStr) return;
    const targetIso = new Date(`${targetDateStr}T18:00:00Z`).toISOString();
    if (updateTaskApi) {
      await updateTaskApi(taskId, { deadline: targetIso, dueDate: targetDateStr });
    } else {
      updateTask(taskId, { deadline: targetIso, dueDate: targetDateStr });
    }
  };

  const handleToggleTaskStatus = async (taskId) => {
    if (toggleTaskApi) {
      await toggleTaskApi(taskId);
    } else {
      toggleTaskStatus(taskId);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (updateTaskApi) {
      await updateTaskApi(taskId, { status: newStatus, completed: newStatus === 'Done' });
    } else {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (deleteTaskApi) {
      await deleteTaskApi(taskId);
    } else {
      deleteTask(taskId);
    }
  };

  const handleToggleHabit = async (habitId) => {
    if (toggleHabitApi) {
      await toggleHabitApi(habitId);
    } else {
      toggleHabit(habitId);
    }
  };

  // Date Navigation Helpers for Day Checklist View
  const handlePrevDay = () => {
    const d = new Date(selectedListDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedListDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedListDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedListDate(d.toISOString().split('T')[0]);
  };

  const handleResetToTodayDate = () => {
    setSelectedListDate(new Date().toISOString().split('T')[0]);
  };

  // Filter Tasks Logic
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'All' && t.category !== selectedCategory) {
      return false;
    }
    const rawDate = t.dueDate || t.deadline;
    const taskDateStr = rawDate ? rawDate.split('T')[0] : '';
    const isOverdue = taskDateStr ? taskDateStr < todayStr && !t.completed : false;
    const isToday = taskDateStr === todayStr;

    if (filterTab === 'today') return !t.completed && (isToday || isOverdue);
    if (filterTab === 'overdue') return isOverdue;
    if (filterTab === 'high') return t.priority === 'High';
    if (filterTab === 'completed') return t.completed;
    return true; // 'all'
  });

  // Separate Active vs Completed tasks & sort by Due Date then Priority
  const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  const sortTasks = (taskList: typeof tasks) => {
    return [...taskList].sort((a, b) => {
      const dateARaw = a.dueDate || a.deadline;
      const dateBRaw = b.dueDate || b.deadline;

      const dateA = dateARaw ? new Date(dateARaw).getTime() : Infinity;
      const dateB = dateBRaw ? new Date(dateBRaw).getTime() : Infinity;

      // 1. Primary Sort: Completion / Due Date (Earliest / Nearest Deadline First)
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // 2. Secondary Sort: Priority (High > Medium > Low)
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return weightB - weightA;
    });
  };

  const activeFilteredTasks = sortTasks(filteredTasks.filter((t) => !t.completed));
  const completedFilteredTasks = sortTasks(filteredTasks.filter((t) => t.completed));

  return (
    <div className="space-y-6">
      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialStatus={createModalInitialStatus}
        initialDeadline={createModalInitialDeadline}
      />

      {/* Overdue Rollover Interactive Modal */}
      <OverdueTaskModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
        overdueTasks={overdueTasks}
        onMoveAllToToday={handleMoveAllOverdueToToday}
        onMoveAllToTomorrow={handleMoveAllOverdueToTomorrow}
        onMoveAllToDate={handleMoveAllOverdueToDate}
        onMoveTaskToToday={handleMoveTaskToToday}
        onMoveTaskToTomorrow={handleMoveTaskToTomorrow}
        onMoveTaskToDate={handleMoveTaskToDate}
        onMarkTaskDone={(id) => handleUpdateTaskStatus(id, 'Done')}
        onDiscardTask={(id) => handleDeleteTask(id)}
      />

      {/* Daily Habits Management Modal */}
      <HabitManageModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />

      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-theme-border">
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-6 w-6 text-theme-accent" />
          <div>
            <h2 className="text-xl font-extrabold text-theme-main tracking-tight">
              Tasks & Sprint Planner
            </h2>
            <p className="text-xs text-theme-muted">
              Manage sprint deliverables, track target deadlines, and check in daily habits
            </p>
          </div>
        </div>

        {/* View Switcher Toggle & Top Add Task Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setViewMode('today')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewMode === 'today'
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <ListTodo className="h-4 w-4" />
              <span>Today Checklist</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewMode === 'calendar'
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Calendar View</span>
            </button>
            <button
              onClick={() => setViewMode('sprint')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewMode === 'sprint'
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>Sprint Board</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsHabitModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-card-hover text-theme-main font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
              title="Add, edit, or delete daily habits"
            >
              <Flame className="h-4 w-4 text-theme-accent" />
              <span>Manage Habits</span>
            </button>

            <button
              onClick={() => openCreateModal('Todo')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Minimal Header Control Panel */}
      <div className="p-3.5 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-3">
        {/* Top Row: Overdue Alert / Title + Compact Metrics Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-theme-border/60">
          {overdueCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 animate-bounce" />
                <span className="text-xs font-bold text-rose-400">
                  {overdueCount} Overdue Task{overdueCount > 1 ? 's' : ''} Require Attention
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleMoveAllOverdueToToday}
                  className="px-2.5 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Move All to Today</span>
                </button>
                <button
                  onClick={() => setIsOverdueModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-lg bg-theme-surface border border-theme-border text-theme-main text-[11px] font-bold hover:bg-theme-card-hover transition cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-extrabold text-theme-main">
              <Flame className="h-4 w-4 text-theme-accent" />
              <span>Sprint Routines & Metrics</span>
            </div>
          )}

          {/* Compact Metrics Bar */}
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
            {/* Completion Rate Pill */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-theme-surface border border-theme-border">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-extrabold text-theme-main">{completionPercentage}%</span>
              <span className="text-[10px] text-theme-muted">({completedTasks}/{totalTasks})</span>
              <div className="w-12 bg-theme-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Est. Time Remaining Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-theme-surface border border-theme-border">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-black text-theme-main">
                {remainingHours > 0 ? `${remainingHours}h ${remainingMins}m` : `${remainingMins}m`}
              </span>
              <span className="text-[10px] text-theme-muted">today's workload</span>
            </div>

            {/* Overdue Badge Trigger */}
            <button
              onClick={() => overdueCount > 0 && setIsOverdueModalOpen(true)}
              className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                overdueCount > 0
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{overdueCount > 0 ? `${overdueCount} Overdue` : 'On Track'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Habits Inline Checklist */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 shrink-0 bg-theme-surface/80 border border-theme-border px-3 py-1 rounded-xl">
            <Flame className="h-4 w-4 text-theme-accent animate-pulse" />
            <span className="text-xs font-black text-theme-main uppercase tracking-wider">
              Daily Habits ({habits.filter((h) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const logs = h.completedDates || h.completionLog || [];
                return h.completedToday !== undefined ? h.completedToday : logs.includes(todayStr);
              }).length}/{habits.length})
            </span>
            <button
              type="button"
              onClick={() => setIsHabitModalOpen(true)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
              title="Add, edit, or delete daily habits"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add / Manage Habits</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto py-0.5 flex-1 pr-1">
            {habits.map((habit) => {
              const hId = habit.id || habit._id;
              const todayStr = new Date().toISOString().split('T')[0];
              const logs = habit.completedDates || habit.completionLog || [];
              const isCompletedToday = habit.completedToday !== undefined ? habit.completedToday : logs.includes(todayStr);

              return (
                <div
                  key={hId}
                  onClick={() => handleToggleHabit(hId)}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                    isCompletedToday
                      ? 'bg-theme-accent/15 border-theme-accent text-theme-main font-bold shadow-xs'
                      : 'bg-theme-surface border-theme-border hover:border-theme-accent/50 text-theme-muted'
                  }`}
                >
                  {isCompletedToday ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-theme-accent fill-theme-accent/20" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate max-w-[140px] font-semibold">{habit.name || habit.title}</span>
                  <span className="text-[10px] font-extrabold text-theme-accent flex items-center gap-0.5">
                    <Flame className="h-3 w-3" />
                    {habit.streak || 0}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Switcher: Today Checklist vs Calendar View vs Sprint Board */}
      {viewMode === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          onToggleTask={handleToggleTaskStatus}
          onUpdateStatus={handleUpdateTaskStatus}
          onEditTask={setEditingTask}
          onDeleteTask={handleDeleteTask}
          onOpenCreateModal={openCreateModal}
        />
      ) : (
        <div className="space-y-5">
          {/* Interactive Day Date Navigator Bar (Available for both Today Checklist & Sprint Board) */}
          <div className="p-3.5 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Calendar className="h-4 w-4 text-theme-accent" />
              <span className="text-xs font-extrabold text-theme-main uppercase tracking-wider">
                Schedule Navigator
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedListDate === new Date().toISOString().split('T')[0]
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}
              >
                {selectedListDate === new Date().toISOString().split('T')[0]
                  ? "Showing Today's Workload"
                  : `Viewing ${new Date(selectedListDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {/* Connected Segmented Control */}
              <div className="h-9 flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold">
                <button
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center min-w-[140px] px-1.5">
                  <CustomDatePicker
                    value={selectedListDate}
                    onChange={(e) => setSelectedListDate(e.target.value)}
                    size="sm"
                    placeholder="Select Date"
                    fullWidth
                  />
                </div>

                <button
                  onClick={handleNextDay}
                  title="Next Day"
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Jump to Today Button */}
              <button
                onClick={handleResetToTodayDate}
                disabled={selectedListDate === new Date().toISOString().split('T')[0]}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                  selectedListDate === new Date().toISOString().split('T')[0]
                    ? 'bg-theme-surface/40 border-theme-border text-theme-muted/50 cursor-default'
                    : 'bg-theme-accent text-white border-theme-accent hover:bg-theme-accent-hover shadow-xs'
                }`}
                title="Return to Today's date"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Today</span>
              </button>
            </div>
          </div>

          {viewMode === 'today' ? (
            <div className="space-y-5">
              {/* Interactive Toolbar: Search, Filter Tabs, Category Dropdown & Add Task Button */}
          <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px]">
                {isSearching ? (
                  <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-accent animate-spin" />
                ) : (
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted" />
                )}
                <input
                  type="text"
                  placeholder="Search tasks by title, category, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent transition"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-theme-accent text-white shadow-xs font-bold'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilterTab('today')}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    filterTab === 'today'
                      ? 'bg-theme-accent text-white shadow-xs font-bold'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  Due Today / Pending
                </button>
                <button
                  onClick={() => setFilterTab('overdue')}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    filterTab === 'overdue'
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  Overdue ({overdueCount})
                </button>
                <button
                  onClick={() => setFilterTab('high')}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    filterTab === 'high'
                      ? 'bg-theme-accent text-white shadow-xs font-bold'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  High Priority
                </button>
                <button
                  onClick={() => setFilterTab('completed')}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    filterTab === 'completed'
                      ? 'bg-theme-accent text-white shadow-xs font-bold'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  Completed ({completedTasks})
                </button>
              </div>

              {/* Category Filter & Quick Add Trigger */}
              <div className="flex items-center space-x-2 shrink-0">
                <CustomSelect
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categories}
                  variant="default"
                  size="sm"
                />

                <button
                  onClick={() => openCreateModal('Todo')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Decluttered Task Checklist: Active (Pending) Tasks Section */}
          <div className="space-y-3">
            {activeFilteredTasks.length === 0 && (filterTab !== 'completed') ? (
              <div className="p-8 text-center rounded-2xl border border-theme-border bg-theme-card space-y-2">
                <ListTodo className="h-8 w-8 text-theme-muted mx-auto opacity-40" />
                <h4 className="text-sm font-bold text-theme-main">No pending tasks found</h4>
                <p className="text-xs text-theme-muted max-w-sm mx-auto">
                  {completedFilteredTasks.length > 0
                    ? 'All matching tasks are completed! Check the completed section below.'
                    : 'No active tasks match your filters.'}
                </p>
              </div>
            ) : (
              activeFilteredTasks.map((t) => {
                const deadlineInfo = formatDeadline(t.deadline || t.dueDate, t.completed);
                const taskId = t.id || t._id;

                return (
                  <div
                    key={taskId}
                    className="group relative p-4 rounded-2xl border border-theme-border bg-theme-card hover:border-theme-accent/50 shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Checkbox, Title, Category Pill & Priority Badge */}
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTaskStatus(taskId)}
                        className="shrink-0 text-theme-muted hover:text-theme-accent transition cursor-pointer"
                      >
                        <Circle className="h-5 w-5 hover:text-theme-accent" />
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <p className="text-xs font-extrabold text-theme-main">{t.title}</p>
                          <Badge variant={getPriorityVariant(t.priority)} size="sm">
                            {t.priority}
                          </Badge>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                              t.category
                            )}`}
                          >
                            {t.category}
                          </span>
                        </div>

                        {/* Metadata row: Deadline + Est. Time */}
                        <div className="flex items-center space-x-3 text-[11px] text-theme-muted pt-0.5 flex-wrap gap-y-1">
                          {deadlineInfo && (
                            <span
                              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border text-[10px] ${deadlineInfo.className}`}
                            >
                              <CalendarDays className="h-3 w-3" />
                              {deadlineInfo.text}
                            </span>
                          )}

                          {deadlineInfo?.isOverdue && (
                            <button
                              onClick={() => handleMoveTaskToToday(taskId)}
                              className="px-2 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 border border-rose-500/30 shadow-xs"
                              title="Move this overdue task to Today"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Move to Today</span>
                            </button>
                          )}

                          <span className="flex items-center gap-1 text-[10px] font-medium text-theme-muted">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {t.estimatedMinutes ? `${t.estimatedMinutes}m est` : '45m est'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Dropdown & Action Icons */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-theme-border">
                      <CustomSelect
                        value={t.status}
                        onChange={(e) => handleUpdateTaskStatus(taskId, e.target.value)}
                        options={kanbanColumns}
                        variant="status"
                        size="xs"
                      />

                      <div className="flex items-center space-x-1 border-l border-theme-border pl-2">
                        <button
                          onClick={() => setEditingTask(t)}
                          title="Edit Task"
                          className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this task?')) {
                              handleDeleteTask(taskId);
                            }
                          }}
                          title="Delete Task"
                          className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Decluttered UI: Collapsible Completed Tasks Accordion Container */}
          {completedFilteredTasks.length > 0 && (
            <div className="mt-6 rounded-2xl border border-theme-border bg-theme-card/60 shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                className="p-4 flex items-center justify-between cursor-pointer bg-theme-surface/50 hover:bg-theme-surface transition select-none"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-extrabold text-theme-main">
                    Completed Tasks ({completedFilteredTasks.length})
                  </span>
                  <span className="text-[10px] text-theme-muted font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-400">
                    Collapsed to reduce clutter
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Clear all completed tasks?')) {
                        clearCompletedTasks();
                      }
                    }}
                    className="text-[11px] font-bold text-rose-400/80 hover:text-rose-400 transition cursor-pointer"
                  >
                    Clear Completed
                  </button>

                  <button className="p-1 rounded-lg text-theme-muted hover:text-theme-main transition">
                    {isCompletedCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {(!isCompletedCollapsed || filterTab === 'completed') && (
                <div className="p-4 border-t border-theme-border space-y-2.5 bg-theme-card/40 animate-in fade-in duration-200">
                  {completedFilteredTasks.map((t) => {
                    const taskId = t.id || t._id;
                    return (
                      <div
                        key={taskId}
                        className="p-3 rounded-xl border border-theme-border/60 bg-theme-card/50 opacity-70 hover:opacity-100 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleToggleTaskStatus(taskId)}
                            className="shrink-0 text-emerald-500 cursor-pointer"
                            title="Click to uncheck"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                          </button>
                          <span className="text-xs font-bold line-through text-theme-muted truncate">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                              t.category
                            )}`}
                          >
                            {t.category}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => setEditingTask(t)}
                            className="p-1 rounded text-theme-muted hover:text-theme-main transition cursor-pointer"
                            title="Edit Task"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(taskId)}
                            className="p-1 rounded text-rose-400/70 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
          /* Sprint Board Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);

            return (
              <div
                key={col}
                className="p-4 rounded-2xl border border-theme-border bg-theme-surface flex flex-col min-h-[480px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-theme-main uppercase tracking-wider">
                      {col}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-theme-card-hover text-[10px] font-bold text-theme-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateModal(col)}
                    title={`Add task to ${col}`}
                    className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 text-theme-accent" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.map((t) => {
                    const deadlineInfo = formatDeadline(t.deadline || t.dueDate, t.completed);
                    const taskId = t.id || t._id;
                    const isSelectedDayTask = (t.deadline || t.dueDate) && (t.deadline || t.dueDate).startsWith(selectedListDate);

                    return (
                      <div
                        key={taskId}
                        className={`p-3.5 rounded-xl border bg-theme-card shadow-xs space-y-2.5 transition ${
                          isSelectedDayTask
                            ? 'border-theme-accent ring-1 ring-theme-accent/40 shadow-sm'
                            : 'border-theme-border hover:border-theme-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-theme-main leading-snug">{t.title}</p>
                          <div className="flex items-center space-x-1 shrink-0">
                            {isSelectedDayTask && (
                              <span className="text-[9px] font-black text-theme-accent bg-theme-accent/10 border border-theme-accent/30 px-1.5 py-0.5 rounded-md">
                                Scheduled
                              </span>
                            )}
                            <Badge variant={getPriorityVariant(t.priority)} size="sm">
                              {t.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between text-[10px] text-theme-muted pt-1 border-t border-theme-border/60">
                          <span
                            className={`font-extrabold px-1.5 py-0.5 rounded-md border ${getCategoryBadgeStyle(
                              t.category
                            )}`}
                          >
                            {t.category}
                          </span>

                          {deadlineInfo && (
                            <span className={`font-semibold ${deadlineInfo.isOverdue ? 'text-rose-400' : 'text-theme-muted'}`}>
                              {deadlineInfo.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <CustomSelect
                            value={t.status}
                            onChange={(e) => handleUpdateTaskStatus(taskId, e.target.value)}
                            options={kanbanColumns}
                            variant="status"
                            size="xs"
                          />

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setEditingTask(t)}
                              title="Edit Task"
                              className="p-1 rounded text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this task?')) {
                                  handleDeleteTask(taskId);
                                }
                              }}
                              title="Delete Task"
                              className="p-1 rounded text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default Planner;
