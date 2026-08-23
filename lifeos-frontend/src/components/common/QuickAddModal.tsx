import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CustomSelect } from './CustomSelect';
import { CustomDatePicker } from './CustomDatePicker';
import { X, CheckCircle2, Clock, DollarSign, Briefcase } from 'lucide-react';

export interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, defaultTab = 'task' }) => {
  const {
    addTaskApi,
    addTask,
    addStudySessionApi,
    addStudySession,
    addExpenseApi,
    addExpense,
    addJobApplicationApi,
    addJobApi,
  } = useData();

  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab || 'task');
    }
  }, [isOpen, defaultTab]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskCategory, setTaskCategory] = useState('DSA');
  const [taskDeadlineDate, setTaskDeadlineDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [taskEstMinutes, setTaskEstMinutes] = useState<number | string>(60);

  const [studySubject, setStudySubject] = useState('');
  const [studyHours, setStudyHours] = useState('2');
  const [studyNotes, setStudyNotes] = useState('');

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Software & Subscriptions');

  const [jobCompany, setJobCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobStatus, setJobStatus] = useState('Applied');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'task') {
      if (!taskTitle) return;
      const targetDate = taskDeadlineDate || new Date().toISOString().split('T')[0];
      const payload = {
        title: taskTitle,
        priority: taskPriority as any,
        category: taskCategory,
        dueDate: targetDate,
        deadline: targetDate,
        estimatedMinutes: typeof taskEstMinutes === 'number' ? taskEstMinutes : parseInt(taskEstMinutes, 10) || 60,
      };
      if (addTaskApi) {
        await addTaskApi(payload);
      } else if (addTask) {
        addTask(payload);
      }
      setTaskTitle('');
    } else if (tab === 'study') {
      if (!studySubject) return;
      const payload = {
        subject: studySubject,
        durationHours: parseFloat(studyHours) || 1,
        notes: studyNotes,
        date: new Date().toISOString().split('T')[0],
      };
      if (addStudySessionApi) {
        await addStudySessionApi(payload);
      } else if (addStudySession) {
        addStudySession(payload);
      }
      setStudySubject('');
      setStudyNotes('');
    } else if (tab === 'expense') {
      if (!expenseDesc || !expenseAmount) return;
      const payload = {
        description: expenseDesc,
        amount: parseFloat(expenseAmount) || 0,
        category: expenseCat,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
      };
      if (addExpenseApi) {
        await addExpenseApi(payload);
      } else if (addExpense) {
        addExpense(payload);
      }
      setExpenseDesc('');
      setExpenseAmount('');
    } else if (tab === 'job') {
      if (!jobCompany || !jobRole) return;
      const jobData = {
        company: jobCompany,
        role: jobRole,
        position: jobRole,
        status: jobStatus,
        stage: jobStatus,
        salaryRange: '$140k - $170k',
        location: 'Remote',
      };
      if (addJobApplicationApi) {
        await addJobApplicationApi(jobData);
      } else if (addJobApi) {
        await addJobApi(jobData);
      }
      setJobCompany('');
      setJobRole('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-theme-border bg-theme-card shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border">
          <h2 className="text-lg font-bold text-theme-main">Quick Create Entry</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-2 my-4 p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-medium">
          <button
            onClick={() => setTab('task')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
              tab === 'task' ? 'bg-theme-accent text-white font-bold shadow' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Task</span>
          </button>
          <button
            onClick={() => setTab('study')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
              tab === 'study' ? 'bg-theme-accent text-white font-bold shadow' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Study</span>
          </button>
          <button
            onClick={() => setTab('expense')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
              tab === 'expense' ? 'bg-theme-accent text-white font-bold shadow' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Expense</span>
          </button>
          <button
            onClick={() => setTab('job')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
              tab === 'job' ? 'bg-theme-accent text-white font-bold shadow' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Job</span>
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Implement Graph BFS problem"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Priority</label>
                  <CustomSelect
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value)}
                    options={['High', 'Medium', 'Low']}
                    variant="status"
                    size="sm"
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Category</label>
                  <CustomSelect
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    options={['DSA', 'Career', 'Projects', 'Personal']}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Target Date</label>
                  <CustomDatePicker
                    value={taskDeadlineDate}
                    onChange={e => setTaskDeadlineDate(e.value)}
                    fullWidth
                    size="sm"
                    position="top"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskEstMinutes}
                    onChange={e => setTaskEstMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {tab === 'study' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Subject / Module</label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Programming - 0/1 Knapsack"
                  value={studySubject}
                  onChange={e => setStudySubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={studyHours}
                  onChange={e => setStudyHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Notes</label>
                <textarea
                  placeholder="Key insights learned..."
                  value={studyNotes}
                  onChange={e => setStudyNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent resize-none"
                />
              </div>
            </>
          )}

          {tab === 'expense' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Hosting / Book purchase"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Category</label>
                  <CustomSelect
                    value={expenseCat}
                    onChange={e => setExpenseCat(e.target.value)}
                    options={[
                      'Software & Subscriptions',
                      'Learning & Books',
                      'Hosting & Infrastructure',
                      'Coffee & Productivity'
                    ]}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>
              </div>
            </>
          )}

          {tab === 'job' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. OpenAI / Vercel"
                    value={jobCompany}
                    onChange={e => setJobCompany(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-sm text-theme-main outline-none focus:border-theme-accent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Initial Status Stage</label>
                <CustomSelect
                  value={jobStatus}
                  onChange={e => setJobStatus(e.target.value)}
                  options={['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected']}
                  variant="status"
                  size="sm"
                  fullWidth
                />
              </div>
            </>
          )}

          <div className="pt-3 flex justify-end space-x-2 border-t border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-medium text-xs shadow transition"
            >
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

