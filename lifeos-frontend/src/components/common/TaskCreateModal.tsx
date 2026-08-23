// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { X, Calendar, Clock, Tag, Sparkles, Plus } from 'lucide-react';

export const TaskCreateModal = ({ isOpen, onClose, initialStatus = 'Todo', initialDeadline = '' }) => {
  const { addTask, addTaskApi } = useData();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('DSA');
  const [status, setStatus] = useState('Todo');
  const [deadlineDate, setDeadlineDate] = useState(() =>
    initialDeadline ? initialDeadline.split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus || 'Todo');
      if (initialDeadline) {
        setDeadlineDate(initialDeadline.split('T')[0]);
      }
    }
  }, [isOpen, initialStatus, initialDeadline]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let deadlineIso = new Date(Date.now() + 86400000).toISOString();
    if (deadlineDate) {
      const parsed = new Date(`${deadlineDate}T18:00:00Z`);
      if (!isNaN(parsed.getTime())) {
        deadlineIso = parsed.toISOString();
      }
    }

    const payload = {
      title: title.trim(),
      priority,
      category,
      status,
      deadline: deadlineIso,
      dueDate: deadlineDate,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 60
    };

    if (addTaskApi) {
      await addTaskApi(payload);
    } else if (addTask) {
      addTask(payload);
    }

    // Reset fields & close
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-theme-border bg-theme-card shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-theme-accent" />
            <h2 className="text-base font-extrabold text-theme-main">Create New Sprint Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Implement graph traversal BFS algorithm..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent font-medium"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Priority</label>
              <CustomSelect
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={['High', 'Medium', 'Low']}
                variant="status"
                size="sm"
                fullWidth
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Category</label>
              <CustomSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={['DSA', 'Career', 'Projects', 'Learning', 'Personal']}
                variant="default"
                size="sm"
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Initial Status</label>
              <CustomSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={['Todo', 'In Progress', 'Done', 'Blocked']}
                variant="status"
                size="sm"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Est. Minutes
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-theme-accent" /> Target Deadline Date
            </label>
            <CustomDatePicker
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.value)}
              fullWidth
              size="md"
              position="top"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-theme-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

