import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';
import { CheckCircle2, Circle, Clock, CheckSquare, Plus } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { TaskCreateModal } from '../common/TaskCreateModal';

export const TodaysTasksWidget = () => {
  const { tasks = [], toggleTask, toggleTaskApi } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const taskList = tasks || [];

  const getPriorityVariant = (p?: string) => {
    switch (p) {
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'default';
    }
  };

  const formatCountdown = (deadlineStr?: string) => {
    if (!deadlineStr) return 'No deadline';
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    if (isNaN(diff)) return 'No deadline';
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const handleToggle = (task: any) => {
    const tId = task.id || task._id;
    if (toggleTaskApi) {
      toggleTaskApi(tId);
    } else if (toggleTask) {
      toggleTask(tId);
    }
  };

  const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const sortedTasks = [...taskList].sort((a: any, b: any) => {
    const dateARaw = a.dueDate || a.deadline;
    const dateBRaw = b.dueDate || b.deadline;
    const dateA = dateARaw ? new Date(dateARaw).getTime() : Infinity;
    const dateB = dateBRaw ? new Date(dateBRaw).getTime() : Infinity;
    if (dateA !== dateB) return dateA - dateB;
    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
  });

  return (
    <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-theme-accent" />
            <h2 className="text-base font-bold text-theme-main">Today's Tasks</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-theme-card-hover text-theme-muted">
              {taskList.filter(t => t.completed).length} / {taskList.length} Done
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer"
              title="Add New Task"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {sortedTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks scheduled for today"
            description="Your daily task list is clear! Log your priorities to start tracking progress."
            actionLabel="Add Task"
            onAction={() => setIsModalOpen(true)}
            className="py-6"
          />
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {sortedTasks.map((task) => {
              const taskId = task.id || task._id;
              const countdown = formatCountdown(task.deadline || task.dueDate);
              const isOverdue = countdown === 'Overdue' && !task.completed;

              return (
                <div
                  key={taskId}
                  onClick={() => handleToggle(task)}
                  className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                    task.completed
                      ? 'bg-theme-card-hover border-theme-border opacity-60'
                      : 'bg-theme-surface border-theme-border hover:border-theme-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button className="text-theme-muted group-hover:text-theme-accent transition">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="truncate">
                      <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-theme-muted' : 'text-theme-main'}`}>
                        {task.title}
                      </p>
                      <span className="text-[11px] text-theme-muted font-medium">
                        {task.category} • ~{task.estimatedMinutes || 30} mins
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <Badge variant={getPriorityVariant(task.priority)} size="sm">
                      {task.priority || 'Medium'}
                    </Badge>
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isOverdue
                          ? 'text-rose-500 animate-pulse'
                          : 'text-theme-muted'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {countdown}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

