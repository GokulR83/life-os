import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  Flame,
  AlertTriangle,
  Pencil,
  Trash2,
  Filter
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { CustomSelect } from '../common/CustomSelect';
import { formatDateDisplay } from '../../utils/dateUtils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarView = ({
  tasks,
  onToggleTask,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(today.toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Build calendar grid days for current month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create grid cells array (42 slots: 6 rows of 7 days)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === today.toISOString().split('T')[0]
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === today.toISOString().split('T')[0]
    });
  }

  // Next month leading days to complete grid
  const remainingSlots = 42 - calendarCells.length;
  for (let d = 1; d <= remainingSlots; d++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === today.toISOString().split('T')[0]
    });
  }

  // Group tasks by ISO date string (YYYY-MM-DD)
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return;
    const taskDate = t.deadline || t.dueDate;
    if (taskDate) {
      try {
        const dStr = new Date(taskDate).toISOString().split('T')[0];
        if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
        tasksByDate[dStr].push(t);
      } catch (e) {}
    }
  });

  // Selected date's tasks
  const selectedDayTasks = tasksByDate[selectedDateStr] || [];
  const formattedSelectedDate = formatDateDisplay(selectedDateStr);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default: return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-theme-accent">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-main tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <p className="text-xs text-theme-muted">
              Select any day to manage scheduled tasks or schedule new deliverables
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end gap-y-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-4 w-4 text-theme-muted hidden sm:inline" />
            <CustomSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={['All', 'DSA', 'Career', 'Projects', 'Learning', 'Personal']}
              variant="default"
              size="sm"
            />
          </div>

          {/* Month Switcher Controls */}
          <div className="h-9 flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold shrink-0">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="h-7 px-3 flex items-center justify-center rounded-lg text-xs font-bold text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Add on Date Button */}
          <button
            onClick={() => onOpenCreateModal('Todo', selectedDateStr)}
            className="h-9 flex items-center space-x-1.5 px-3.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add on Date</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Selected Day Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container (Span 2) */}
        <div className="lg:col-span-2 p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-3">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-theme-border pb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-xs font-extrabold text-theme-muted uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const isSelected = cell.dateStr === selectedDateStr;
              const pendingCount = dayTasks.filter((t) => !t.completed).length;

              return (
                <div
                  key={cell.dateStr + idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`group relative min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isSelected
                        ? 'bg-theme-accent/10 border-theme-accent shadow-sm'
                        : cell.isToday
                        ? 'bg-theme-surface border-theme-accent/50'
                        : 'bg-theme-surface/50 border-theme-border hover:border-theme-accent/40'
                      : 'bg-theme-surface/20 border-theme-border/40 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Top Bar inside cell: Day Number + Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        cell.isToday
                          ? 'bg-theme-accent text-white font-black'
                          : cell.isCurrentMonth
                          ? 'text-theme-main'
                          : 'text-theme-muted'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                          pendingCount > 0
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {pendingCount > 0 ? `${pendingCount} active` : '✓'}
                      </span>
                    )}
                  </div>

                  {/* Task Mini Pills inside Cell */}
                  <div className="space-y-1 my-1 overflow-hidden max-h-[46px]">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border flex items-center justify-between gap-1 ${
                          t.completed
                            ? 'line-through text-theme-muted bg-theme-card/40 border-theme-border/50'
                            : 'bg-theme-card text-theme-main border-theme-border'
                        }`}
                      >
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-theme-muted font-bold pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Cell Hover Quick Add Action */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateModal('Todo', cell.dateStr);
                      }}
                      title="Add task on this date"
                      className="p-1 rounded-md bg-theme-accent text-white hover:bg-theme-accent-hover transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Inspector Panel (Span 1) */}
        <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div>
                <span className="text-[11px] font-bold text-theme-accent uppercase tracking-wider">
                  Selected Date
                </span>
                <h4 className="text-base font-extrabold text-theme-main">{formattedSelectedDate}</h4>
              </div>
              <button
                onClick={() => onOpenCreateModal('Todo', selectedDateStr)}
                className="p-2 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-theme-accent hover:bg-theme-accent hover:text-white transition cursor-pointer"
                title="Add Task to Selected Date"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* List of Tasks for Selected Date */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-theme-border bg-theme-surface/50 space-y-2">
                  <CalendarIcon className="h-8 w-8 text-theme-muted mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-theme-muted">No tasks scheduled for this day.</p>
                  <button
                    onClick={() => onOpenCreateModal('Todo', selectedDateStr)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-theme-accent text-white text-xs font-bold hover:bg-theme-accent-hover transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Task</span>
                  </button>
                </div>
              ) : (
                selectedDayTasks.map((t) => {
                  const tId = t.id || t._id;
                  return (
                    <div
                      key={tId}
                      className={`p-3 rounded-xl border transition space-y-2 ${
                        t.completed
                          ? 'bg-theme-surface/40 border-theme-border opacity-70'
                          : 'bg-theme-surface border-theme-border hover:border-theme-accent/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2 min-w-0">
                          <button
                            onClick={() => onToggleTask(tId)}
                            className="mt-0.5 text-theme-muted hover:text-theme-accent transition cursor-pointer shrink-0"
                          >
                            {t.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </button>
                          <p
                            className={`text-xs font-bold ${
                              t.completed ? 'line-through text-theme-muted' : 'text-theme-main'
                            }`}
                          >
                            {t.title}
                          </p>
                        </div>

                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${getPriorityBadge(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="flex items-center justify-between text-[10px] text-theme-muted pt-1 border-t border-theme-border/50">
                        <span className="font-semibold text-theme-muted">{t.category}</span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onEditTask(t)}
                            className="p-1 rounded text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
                            title="Edit Task"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this task?')) onDeleteTask(tId);
                            }}
                            className="p-1 rounded text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-theme-border text-center">
            <span className="text-[11px] text-theme-muted">
              {selectedDayTasks.filter((t) => t.completed).length} of {selectedDayTasks.length} tasks completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
