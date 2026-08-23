// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { X, Calendar, Clock, Tag, Trash2 } from 'lucide-react';

export const TaskEditModal = ({ task, isOpen, onClose }) => {
  const { updateTask, updateTaskApi, deleteTask, deleteTaskApi } = useData();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('Todo');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || 'Medium');
      setCategory(task.category || 'General');
      setStatus(task.status || (task.completed ? 'Done' : 'Todo'));
      setEstimatedMinutes(task.estimatedMinutes || 60);

      // Format ISO string to YYYY-MM-DD for date input
      if (task.deadline || task.dueDate) {
        try {
          const d = new Date(task.deadline || task.dueDate);
          if (!isNaN(d.getTime())) {
            setDeadlineDate(d.toISOString().split('T')[0]);
          } else {
            setDeadlineDate(new Date().toISOString().split('T')[0]);
          }
        } catch {
          setDeadlineDate(new Date().toISOString().split('T')[0]);
        }
      } else {
        setDeadlineDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert deadline YYYY-MM-DD back to ISO string
    let finalDeadline = task.deadline;
    if (deadlineDate) {
      const parsed = new Date(`${deadlineDate}T18:00:00Z`);
      if (!isNaN(parsed.getTime())) {
        finalDeadline = parsed.toISOString();
      }
    }

    const payload = {
      title: title.trim(),
      priority,
      category,
      status,
      deadline: finalDeadline,
      dueDate: deadlineDate,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 30,
      completed: status === 'Done'
    };

    const tId = task.id || task._id;
    if (updateTaskApi) {
      await updateTaskApi(tId, payload);
    } else if (updateTask) {
      updateTask(tId, payload);
    }

    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const tId = task.id || task._id;
      if (deleteTaskApi) {
        await deleteTaskApi(tId);
      } else if (deleteTask) {
        deleteTask(tId);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-theme-border bg-theme-card shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-theme-accent" />
            <h2 className="text-base font-extrabold text-theme-main">Edit Task</h2>
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
            <label className="block text-xs font-semibold text-theme-muted mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent font-medium"
              required
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
                options={['DSA', 'Career', 'Projects', 'Personal', 'Learning']}
                variant="default"
                size="sm"
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Status</label>
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
                <Clock className="h-3 w-3" /> Est. Minutes
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

          <div className="pt-3 flex items-center justify-between border-t border-theme-border mt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

