import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Calendar,
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const OverdueTaskModal = ({
  isOpen,
  onClose,
  overdueTasks = [],
  onMoveAllToToday,
  onMoveAllToTomorrow,
  onMoveAllToDate,
  onMoveTaskToToday,
  onMoveTaskToTomorrow,
  onMoveTaskToDate,
  onMarkTaskDone,
  onDiscardTask
}) => {
  const [batchTargetDate, setBatchTargetDate] = useState('');

  if (!isOpen || overdueTasks.length === 0) return null;

  const handleBatchCustomDate = (e) => {
    const val = e.target.value;
    setBatchTargetDate(val);
    if (val && onMoveAllToDate) {
      onMoveAllToDate(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-theme-border bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-theme-main tracking-tight">
                Uncompleted Overdue Tasks ({overdueTasks.length})
              </h3>
              <p className="text-xs text-theme-muted">
                These tasks were missed on previous days. Choose a target day to reschedule them or discard them.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-surface transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Batch Actions Banner */}
        <div className="p-4 bg-theme-surface/70 border-b border-theme-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-theme-main flex items-center gap-1.5 shrink-0">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Quick Batch Rollover:
          </span>

          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-2">
            <button
              onClick={onMoveAllToToday}
              className="px-3 py-1.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>All to Today</span>
            </button>

            <button
              onClick={onMoveAllToTomorrow}
              className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>All to Tomorrow</span>
            </button>

            {/* Custom Date Batch Selector */}
            <div className="min-w-[140px] relative z-40">
              <CustomDatePicker
                value={batchTargetDate}
                onChange={handleBatchCustomDate}
                size="xs"
                placeholder="All to Picked Date..."
                align="right"
                position="top"
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {overdueTasks.map((t) => {
            const formattedDate = t.deadline
              ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Past Due';

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 transition space-y-3 relative"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-extrabold text-theme-main">{t.title}</span>
                      <Badge
                        variant={t.priority === 'High' ? 'high' : t.priority === 'Medium' ? 'medium' : 'low'}
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-theme-card border-theme-border text-theme-muted">
                        {t.category}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Original Due: {formattedDate}
                    </span>
                  </div>

                  {/* Per-task options with Custom Date Selector */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 shrink-0">
                    <button
                      onClick={() => onMoveTaskToToday(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-theme-accent text-white text-[11px] font-bold hover:bg-theme-accent-hover transition cursor-pointer"
                      title="Move task to Today"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => onMoveTaskToTomorrow(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 text-[11px] font-bold hover:bg-sky-500/30 transition cursor-pointer"
                      title="Move task to Tomorrow"
                    >
                      Tomorrow
                    </button>

                    {/* Per-Task Custom Date Picker */}
                    <div className="w-[125px] relative z-40">
                      <CustomDatePicker
                        value={t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : ''}
                        onChange={(e) => onMoveTaskToDate(t.id, e.target.value)}
                        size="xs"
                        placeholder="Pick Date"
                        align="right"
                        position="top"
                      />
                    </div>

                    <button
                      onClick={() => onMarkTaskDone(t.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
                      title="Mark Done"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDiscardTask(t.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition cursor-pointer"
                      title="Discard Task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border bg-theme-card flex items-center justify-between text-xs text-theme-muted">
          <span>{overdueTasks.length} task(s) awaiting your decision</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-surface border border-theme-border font-bold text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverdueTaskModal;
