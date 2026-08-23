// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Clock, Plus, Target, Flame, Trash2, Calendar, Sparkles } from 'lucide-react';
import { PomodoroTimer } from './PomodoroTimer';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const StudyTab = () => {
  const { studySessions, addStudySession, fetchStudySessionsApi, deleteStudySessionApi, user } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; subject: string } | null>(null);

  useEffect(() => {
    if (fetchStudySessionsApi) fetchStudySessionsApi(true);
  }, []);

  // Form State
  const [subject, setSubject] = useState('');
  const [durationHours, setDurationHours] = useState('1.5');
  const [notes, setNotes] = useState('');

  const sessionsList = studySessions || [];

  // Calculate 7-day study graph data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((dateStr) => {
    const daySessions = sessionsList.filter((s) => s.date === dateStr);
    const totalHours = daySessions.reduce((sum, s) => {
      const hrs = typeof s.durationHours === 'number' ? s.durationHours : (s.durationMinutes ? s.durationMinutes / 60 : 0);
      return sum + hrs;
    }, 0);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: dateStr,
      day: dayName,
      hours: parseFloat(totalHours.toFixed(1))
    };
  });

  const totalWeeklyHours = parseFloat(chartData.reduce((sum, d) => sum + d.hours, 0).toFixed(1));
  const avgDailyHours = (totalWeeklyHours / 7).toFixed(1);
  const dailyTargetHours = user?.dailyStudyGoalHours || 4;
  const targetRatio = Math.min(100, Math.round((parseFloat(avgDailyHours) / dailyTargetHours) * 100));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    if (addStudySession) {
      await addStudySession({
        subject: subject.trim(),
        durationHours: parseFloat(durationHours) || 1,
        notes: notes.trim()
      });
    }
    setIsModalOpen(false);
    setSubject('');
    setNotes('');
  };

  const handleConfirmDeleteSession = async () => {
    if (deleteTarget && deleteStudySessionApi) {
      await deleteStudySessionApi(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Live Pomodoro Timer Component */}
      <PomodoroTimer />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">7-Day Total Hours</p>
            <p className="text-xl font-extrabold text-theme-main mt-0.5">{totalWeeklyHours} hrs</p>
          </div>
          <div className="p-3 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Daily Average Focus</p>
            <p className="text-xl font-extrabold text-theme-main mt-0.5">{avgDailyHours} hrs/day</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Daily Target Ratio</p>
            <p className="text-xl font-extrabold text-theme-main mt-0.5">
              {isNaN(targetRatio) ? 0 : targetRatio}%
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-theme-main">Daily Focus Intensity (Last 7 Days)</h3>
            <p className="text-xs text-theme-muted">Hours spent in deep focus across DSA, System Design, and Frontend builds</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-dual text-white font-extrabold text-xs shadow-md shadow-theme-accent/20 transition active:scale-95 cursor-pointer flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Log Study Session</span>
          </button>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="hours" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus History Table */}
      <div className="p-6 rounded-3xl border border-theme-border bg-theme-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-theme-main">Log History</h3>
          <span className="text-xs text-theme-muted">{sessionsList.length} Sessions Logged</span>
        </div>

        {sessionsList.length === 0 ? (
          <div className="py-12 px-4 border border-dashed border-theme-border rounded-2xl text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-theme-surface border border-theme-border flex items-center justify-center text-theme-muted">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-theme-main">No study sessions recorded yet</p>
            <p className="text-[11px] text-theme-muted max-w-sm mx-auto">
              Start the Pomodoro timer above or click "Log Study Session" to record your deep focus blocks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-border text-theme-muted uppercase tracking-wider font-bold">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Subject / Focus</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="pb-3 px-3">Notes</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {sessionsList.map((sess) => {
                  const sessId = sess.id || sess._id;
                  const durationHrs = typeof sess.durationHours === 'number' ? sess.durationHours : (sess.durationMinutes ? sess.durationMinutes / 60 : 1);
                  return (
                    <tr key={sessId} className="hover:bg-theme-surface/50 transition group">
                      <td className="py-3 px-3 font-semibold text-theme-muted">
                        {sess.date} {sess.timestamp && `(${sess.timestamp})`}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-theme-main">{sess.subject}</td>
                      <td className="py-3 px-3 font-bold text-theme-accent">{durationHrs} hrs</td>
                      <td className="py-3 px-3 text-theme-muted">{sess.notes || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setDeleteTarget({ id: sessId, subject: sess.subject })}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-theme-main">Log Deep Focus Session</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1">Subject / Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming, System Design"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted mb-1">Key Takeaways / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Optional session notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border text-xs font-bold text-theme-muted hover:bg-theme-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-dual text-white text-xs font-bold shadow-md"
                >
                  Save Focus Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteSession}
        itemTitle={deleteTarget?.subject}
        message="Are you sure you want to delete this study session record? This action cannot be undone."
      />
    </div>
  );
};

