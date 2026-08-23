import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from '../common/CustomSelect';
import { X, Flame, Plus, Trash2, Pencil, CheckCircle2, Circle } from 'lucide-react';

export const HabitManageModal = ({ isOpen, onClose }) => {
  const { habits, addHabit, addHabitApi, deleteHabit, deleteHabitApi, toggleHabit, toggleHabitApi } = useData();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      title: name.trim(),
      category
    };

    if (addHabitApi) {
      await addHabitApi(payload);
    } else if (addHabit) {
      addHabit(payload);
    }

    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-theme-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-theme-main">Manage Daily Habits</h3>
              <p className="text-xs text-theme-muted">Create, edit, or delete daily routine check-ins</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-surface transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add New Habit Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-theme-surface/60 border-b border-theme-border space-y-3">
          <span className="text-xs font-extrabold text-theme-main block uppercase tracking-wider">
            + Create New Habit
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Read 20 mins, Drink 2L water..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 h-9 px-3.5 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
              required
            />

            <div className="w-full sm:w-[140px] shrink-0">
              <CustomSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={['DSA', 'Learning', 'Projects', 'Career', 'Personal']}
                variant="default"
                size="sm"
                fullWidth
              />
            </div>

            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Existing Habits List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          <span className="text-xs font-bold text-theme-muted block mb-1">
            Active Habits ({habits.length})
          </span>

          {habits.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-theme-border bg-theme-surface/50 text-xs text-theme-muted">
              No daily habits added yet. Create one above!
            </div>
          ) : (
            habits.map((h) => {
              const hId = h.id || h._id;
              const todayStr = new Date().toISOString().split('T')[0];
              const logs = h.completedDates || h.completionLog || [];
              const isCompletedToday = h.completedToday !== undefined ? h.completedToday : logs.includes(todayStr);

              return (
                <div
                  key={hId}
                  className="p-3 rounded-xl border border-theme-border bg-theme-surface hover:border-theme-accent/40 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (toggleHabitApi) {
                          toggleHabitApi(hId);
                        } else {
                          toggleHabit(hId);
                        }
                      }}
                      className="text-theme-muted hover:text-theme-accent transition cursor-pointer shrink-0"
                    >
                      {isCompletedToday ? (
                        <CheckCircle2 className="h-5 w-5 text-theme-accent fill-theme-accent/20" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs font-bold text-theme-main truncate">{h.name || h.title}</h4>
                      <span className="text-[10px] text-theme-muted font-medium bg-theme-card px-2 py-0.5 rounded-full border border-theme-border inline-block">
                        {h.category}
                      </span>
                    </div>
                  </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="flex items-center space-x-1 text-xs font-extrabold text-theme-accent">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{h.streak || 0}d</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const hId = h.id || h._id;
                      if (window.confirm(`Delete habit "${h.name || h.title}"?`)) {
                        if (deleteHabitApi) {
                          await deleteHabitApi(hId);
                        } else {
                          deleteHabit(hId);
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Delete habit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border bg-theme-card flex items-center justify-between text-xs text-theme-muted">
          <span>Click checkboxes to check-in for today</span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-theme-surface border border-theme-border font-bold text-xs text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitManageModal;
