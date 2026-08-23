import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';
import { CustomSelect } from '../common/CustomSelect';
import { Building2, Calendar, MapPin, DollarSign, ChevronRight, Filter, TrendingUp, AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const JobKanbanTab = () => {
  const {
    jobApplications,
    fetchJobsApi,
    updateJobStatus,
    updateJobStatusApi,
    addJobApplicationApi,
    deleteJobApplicationApi
  } = useData();

  const [filterRole, setFilterRole] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (fetchJobsApi) fetchJobsApi(true);
  }, []);

  // Form states for new job application
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Wishlist');
  const [location, setLocation] = useState('Remote');
  const [salaryRange, setSalaryRange] = useState('$150k - $180k');
  const [contactPerson, setContactPerson] = useState('');
  const [formError, setFormError] = useState('');

  const columns = ['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

  const filteredApps = (jobApplications || []).filter(j => {
    if (filterRole === 'All') return true;
    const r = (j.role || j.position || '').toLowerCase();
    return r.includes(filterRole.toLowerCase());
  });

  // Calculate Pipeline Funnel Conversion Metrics
  const activeApps = (jobApplications || []);
  const totalApplied = activeApps.filter(j => j.status !== 'Wishlist').length;
  const totalAppliedForCalc = totalApplied || 1;
  const oaCount = activeApps.filter(j => ['OA', 'Interview', 'Offer'].includes(j.status)).length;
  const interviewCount = activeApps.filter(j => ['Interview', 'Offer'].includes(j.status)).length;
  const offerCount = activeApps.filter(j => j.status === 'Offer').length;

  const oaRate = totalApplied > 0 ? Math.round((oaCount / totalAppliedForCalc) * 100) : 0;
  const interviewRate = totalApplied > 0 ? Math.round((interviewCount / totalAppliedForCalc) * 100) : 0;
  const offerRate = totalApplied > 0 ? Math.round((offerCount / totalAppliedForCalc) * 100) : 0;

  // Helper to calculate days spent in current stage
  const getTimeInStageDays = (lastUpdatedDate) => {
    if (!lastUpdatedDate) return 1;
    const diffTime = Math.abs(new Date().getTime() - new Date(lastUpdatedDate).getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleStatusChange = async (jobId, newStatus) => {
    if (updateJobStatusApi) {
      await updateJobStatusApi(jobId, newStatus);
    } else if (updateJobStatus) {
      updateJobStatus(jobId, newStatus);
    }
  };

  const handleDeleteApp = (jobId: string, companyName: string) => {
    setDeleteTarget({ id: jobId, title: companyName });
  };

  const handleConfirmDeleteApp = async () => {
    if (deleteTarget && deleteJobApplicationApi) {
      await deleteJobApplicationApi(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!company.trim()) {
      setFormError('Company name is required.');
      return;
    }
    if (!role.trim()) {
      setFormError('Job role is required.');
      return;
    }

    setFormError('');
    if (addJobApplicationApi) {
      await addJobApplicationApi({
        company: company.trim(),
        role: role.trim(),
        position: role.trim(),
        status,
        location,
        salary: salaryRange,
        salaryRange,
        contactPerson
      });
    }

    setCompany('');
    setRole('');
    setStatus('Wishlist');
    setContactPerson('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Conversion Funnel Stat Bar */}
      <div className="p-5 rounded-3xl border border-theme-border bg-theme-card shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-theme-accent" />
            <h3 className="text-sm font-bold text-theme-main">Pipeline Conversion Funnel Metrics</h3>
          </div>
          <span className="text-xs text-theme-muted font-bold">{totalApplied} Total Active Applications</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-theme-surface border border-theme-border">
            <p className="text-[10px] uppercase font-bold text-theme-muted">Applied Rate</p>
            <p className="text-lg font-extrabold text-theme-main mt-0.5">{totalApplied} Apps</p>
          </div>
          <div className="p-3 rounded-2xl bg-theme-surface border border-theme-border">
            <p className="text-[10px] uppercase font-bold text-theme-muted">OA Conversion</p>
            <p className="text-lg font-extrabold text-sky-400 mt-0.5">{oaCount} ({oaRate}%)</p>
          </div>
          <div className="p-3 rounded-2xl bg-theme-surface border border-theme-border">
            <p className="text-[10px] uppercase font-bold text-theme-muted">Interview Rate</p>
            <p className="text-lg font-extrabold text-amber-400 mt-0.5">{interviewCount} ({interviewRate}%)</p>
          </div>
          <div className="p-3 rounded-2xl bg-theme-surface border border-theme-border">
            <p className="text-[10px] uppercase font-bold text-theme-muted">Offer Yield</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{offerCount} ({offerRate}%)</p>
          </div>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-theme-border flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <Filter className="h-4 w-4 text-theme-muted" />
          <span className="text-xs font-bold text-theme-muted">Filter by Target Role:</span>
          {['All', 'Frontend', 'Full Stack', 'Backend'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRole === r
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'bg-theme-surface border border-theme-border text-theme-muted hover:text-theme-main'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow flex items-center space-x-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = filteredApps.filter(j => j.status === col);
          return (
            <div
              key={col}
              className="p-3.5 rounded-2xl border border-theme-border bg-theme-surface/50 min-h-[450px] flex flex-col justify-start space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-theme-border">
                <span className="text-xs font-extrabold text-theme-main tracking-tight uppercase">{col}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-accent-light text-theme-accent border border-theme-border">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colApps.length === 0 ? (
                  <div className="h-28 border border-dashed border-theme-border/60 rounded-2xl flex flex-col items-center justify-center p-3 text-center text-[11px] text-theme-muted/70">
                    <span>No Applications</span>
                  </div>
                ) : (
                  colApps.map((app) => {
                  const appId = app.id || app._id;
                  const daysInStage = getTimeInStageDays(app.lastUpdated || app.dateApplied || app.appliedDate);
                  const isStale = (app.stale || daysInStage > 7) && col !== 'Offer' && col !== 'Rejected';
                  const roleTag = (app.role || app.position || 'Engineer').split(' ')[0];

                  return (
                    <div
                      key={appId}
                      className="p-4 rounded-2xl border border-theme-border bg-theme-card shadow-sm hover:shadow-md hover:border-theme-accent transition space-y-2.5 group relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="h-7 w-7 rounded-xl bg-theme-accent-light border border-theme-border text-theme-accent text-xs font-black flex items-center justify-center shrink-0">
                          {app.logo || app.company?.slice(0, 2).toUpperCase() || <Building2 className="h-4 w-4 text-theme-accent" />}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Badge variant="orange" size="sm">{roleTag}</Badge>
                          <button
                            onClick={() => handleDeleteApp(appId, app.company || app.role || 'Job Application')}
                            className="p-1 rounded text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-theme-main group-hover:text-theme-accent transition">
                          {app.company}
                        </h4>
                        <p className="text-[11px] text-theme-muted font-semibold truncate">{app.role || app.position}</p>
                      </div>

                      {/* Time-in-stage Counter */}
                      <div className={`flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                        isStale
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-theme-surface text-theme-muted border-theme-border'
                      }`}>
                        {isStale && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                        <span>In {col}: {daysInStage} days</span>
                      </div>

                      <div className="pt-2 border-t border-theme-border text-[11px] text-theme-muted space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            {app.salaryRange || app.salary || '$140k - $170k'}
                          </span>
                        </div>
                      </div>

                      {/* Stage Shift Select */}
                      <div className="pt-1">
                        <CustomSelect
                          value={app.status}
                          onChange={(e) => handleStatusChange(appId, e.target.value)}
                          options={columns}
                          variant="status"
                          size="xs"
                          fullWidth
                        />
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Job Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-theme-border bg-theme-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
                <Building2 className="h-5 w-5 text-theme-accent" />
                Add Job Application
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">
                    Company <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OpenAI / Stripe"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">
                    Role <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Kanban Stage</label>
                  <CustomSelect
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={columns}
                    variant="status"
                    size="sm"
                    fullWidth
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Estimated Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. $160k - $190k"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah (Recruiter)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteApp}
        itemTitle={deleteTarget?.title}
        message="Are you sure you want to delete this job application? This action cannot be undone."
      />
    </div>
  );
};


