import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Briefcase, FileText, Download, ExternalLink, Send, ShieldAlert, Sparkles, Building2, Trash2, X, Plus, Filter } from 'lucide-react';
import { JobKanbanTab } from '../components/trackers/JobKanbanTab';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { ResumePreviewModal } from '../components/common/ResumePreviewModal';

export const JobSearch = () => {
  const {
    resumeVersions,
    jobApplications,
    fetchJobsApi,
    fetchResumesApi,
    sendJobFollowUpApi,
    addResumeVersionApi,
    deleteResumeVersionApi
  } = useData();

  const [activeTab, setActiveTab] = useState('resumes'); // resumes, stale, kanban
  const [followupSentAppId, setFollowupSentAppId] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; filename: string } | null>(null);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Modal form states
  const [filename, setFilename] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (fetchJobsApi) fetchJobsApi();
    if (fetchResumesApi) fetchResumesApi();
  }, []);

  // Compute dynamic target role filter tags from uploaded resumes
  const rawRoleTags = (resumeVersions || [])
    .map((r: any) => (r.targetRole || '').trim())
    .filter(Boolean);

  const dynamicRoleTags: string[] = [];
  rawRoleTags.forEach((role: string) => {
    if (/frontend/i.test(role) && !dynamicRoleTags.includes('Frontend')) dynamicRoleTags.push('Frontend');
    else if (/full\s*stack/i.test(role) && !dynamicRoleTags.includes('Full Stack')) dynamicRoleTags.push('Full Stack');
    else if (/backend/i.test(role) && !dynamicRoleTags.includes('Backend')) dynamicRoleTags.push('Backend');
    else if (!dynamicRoleTags.includes(role)) dynamicRoleTags.push(role);
  });

  const roleFilterOptions = ['All', ...Array.from(new Set(['Frontend', 'Full Stack', 'Backend', ...dynamicRoleTags]))];

  const filteredResumeVersions = (resumeVersions || []).filter((r: any) => {
    if (selectedRoleFilter === 'All') return true;
    const roleStr = (r.targetRole || '').toLowerCase();
    const filterStr = selectedRoleFilter.toLowerCase();
    if (filterStr === 'frontend') return roleStr.includes('front');
    if (filterStr === 'backend') return roleStr.includes('back') || roleStr.includes('system');
    if (filterStr === 'full stack') return roleStr.includes('full') || roleStr.includes('stack');
    return roleStr.includes(filterStr);
  });

  const staleApps = (jobApplications || []).filter(j =>
    j.stale || (j.lastUpdated && new Date(j.lastUpdated) < new Date(Date.now() - 7 * 86400000) && !['Offer', 'Rejected'].includes(j.status))
  );

  const handleSendFollowUp = async (id: string) => {
    setFollowupSentAppId(id);
    if (sendJobFollowUpApi) {
      await sendJobFollowUpApi(id);
    }
    setTimeout(() => setFollowupSentAppId(null), 3000);
  };

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      setFormError('Filename is required (e.g., Resume_v3_FullStack.pdf)');
      return;
    }
    if (!targetRole.trim()) {
      setFormError('Target role is required (e.g., Senior Full Stack Engineer)');
      return;
    }

    setFormError('');
    if (addResumeVersionApi) {
      await addResumeVersionApi({
        title: filename.trim(),
        filename: filename.trim(),
        targetRole: targetRole.trim(),
        notes: notes.trim(),
        fileUrl: fileUrl.trim()
      });
    }

    setFilename('');
    setTargetRole('');
    setNotes('');
    setFileUrl('');
    setIsResumeModalOpen(false);
  };

  const handleDeleteResume = (id: string, filename: string) => {
    setDeleteTarget({ id, filename });
  };

  const handleConfirmDeleteResume = async () => {
    if (deleteTarget && deleteResumeVersionApi) {
      await deleteResumeVersionApi(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-header Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-border flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-theme-main tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-theme-accent" />
            Job Search & Resume Hub
          </h2>
          <p className="text-xs text-theme-muted">Manage tailored resume versions and follow up on stale applications</p>
        </div>

        <div className="flex items-center space-x-2 border border-theme-border p-1 rounded-xl bg-theme-surface text-xs font-semibold">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'resumes' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            Resume Versions ({(resumeVersions || []).length})
          </button>
          <button
            onClick={() => setActiveTab('stale')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer ${
              activeTab === 'stale' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <span>Follow-up Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">{staleApps.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'kanban' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            Kanban Pipeline
          </button>
        </div>
      </div>

      {/* View 1: Resumes List */}
      {activeTab === 'resumes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
              <FileText className="h-5 w-5 text-theme-accent" />
              Tailored Resume Drafts
            </h3>
            <button
              onClick={() => {
                setFormError('');
                setIsResumeModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-medium text-xs shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Upload New Version</span>
            </button>
          </div>

          {/* Dynamic Target Role Filter Bar */}
          <div className="flex items-center space-x-2 py-2 overflow-x-auto text-xs font-semibold">
            <span className="text-theme-accent font-extrabold flex items-center gap-1.5 shrink-0 mr-1">
              <Filter className="h-4 w-4 text-theme-accent" />
              Filter by Target Role:
            </span>
            {roleFilterOptions.map((roleTag) => (
              <button
                key={roleTag}
                onClick={() => setSelectedRoleFilter(roleTag)}
                className={`px-3 py-1.5 rounded-full border text-xs font-extrabold transition cursor-pointer shrink-0 ${
                  selectedRoleFilter === roleTag
                    ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                    : 'bg-theme-surface border-theme-border text-theme-muted hover:text-theme-main hover:border-theme-accent/50'
                }`}
              >
                {roleTag}
              </button>
            ))}
          </div>

          {filteredResumeVersions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-theme-border bg-theme-card space-y-2">
              <FileText className="h-10 w-10 text-theme-muted mx-auto" />
              <p className="text-sm font-bold text-theme-main">No resume versions match "{selectedRoleFilter}"</p>
              <p className="text-xs text-theme-muted">Upload a new resume or select another target role tag to view tailored drafts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredResumeVersions.map((res: any) => (
                <div
                  key={res.id || res._id}
                  className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm hover:shadow-md hover:border-theme-accent transition space-y-3 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-theme-accent-light text-theme-accent">
                        <FileText className="h-6 w-6" />
                      </span>
                      <div className="flex items-center space-x-1">
                        <Badge variant="orange" size="sm">{res.targetRole}</Badge>
                        <button
                          onClick={() => handleDeleteResume(res.id || res._id, res.filename || res.targetRole)}
                          className="p-1 rounded text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-theme-main">{res.filename}</h4>
                    <p className="text-xs text-theme-muted mt-1 leading-relaxed">{res.notes || 'No description provided.'}</p>
                  </div>

                  <div className="pt-3 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
                    <span>Uploaded {res.uploadDate || 'Recently'}</span>
                    <button
                      onClick={() => setPreviewResume(res)}
                      className="text-theme-accent font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Preview <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: Follow-up Reminders */}
      {activeTab === 'stale' && (
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h3 className="text-base font-bold text-theme-main">Stale Application Follow-up Alerts</h3>
          </div>
          <p className="text-xs text-theme-muted">
            Applications with no status updates for over 7 days. Sending a polite follow-up increases recruiter response rate by 3x!
          </p>

          {staleApps.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-theme-border bg-theme-surface/50">
              <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-theme-main">All job applications are active!</p>
              <p className="text-xs text-theme-muted">No stale applications requiring follow-ups at this time.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {staleApps.map((app: any) => (
                <div
                  key={app.id || app._id}
                  className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="h-8 w-8 rounded-xl bg-theme-accent-light border border-theme-border text-theme-accent text-xs font-black flex items-center justify-center shrink-0">
                      {app.logo || <Building2 className="h-4 w-4 text-theme-accent" />}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-theme-main">{app.company}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Stale ({app.dateApplied || app.appliedDate || 'Over 7 days ago'})
                        </span>
                      </div>
                      <p className="text-xs text-theme-muted">{app.role || app.position} • Contact: {app.contactPerson || 'HR Team'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {followupSentAppId === (app.id || app._id) ? (
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> Follow-up Email Drafted!
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendFollowUp(app.id || app._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Follow-up Email</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Integrated Kanban */}
      {activeTab === 'kanban' && <JobKanbanTab />}

      {/* Add Resume Version Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-theme-border bg-theme-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
                <FileText className="h-5 w-5 text-theme-accent" />
                Upload New Resume Version
              </h3>
              <button
                onClick={() => setIsResumeModalOpen(false)}
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

            <form onSubmit={handleAddResume} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">
                  Filename <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Resume_v4_FullStack_2026.pdf"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">
                  Target Role <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                  required
                />
                <div className="flex items-center flex-wrap gap-1.5 pt-1.5">
                  <span className="text-[10px] text-theme-muted font-bold mr-1">Quick Select Tag:</span>
                  {['Full Stack Engineer', 'Frontend Architect', 'Backend Developer', 'AI / ML Specialist', 'DevOps Lead'].map((quickTag) => (
                    <button
                      type="button"
                      key={quickTag}
                      onClick={() => setTargetRole(quickTag)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        targetRole === quickTag
                          ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                          : 'bg-theme-surface border-theme-border text-theme-muted hover:text-theme-main hover:border-theme-accent/40'
                      }`}
                    >
                      {quickTag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">
                  Google Drive / Document Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view or PDF link"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent"
                />
                <p className="text-[10px] text-theme-muted mt-1">Paste a Google Drive share link or PDF URL for embedded viewing</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Version Notes & Tailoring Details</label>
                <textarea
                  placeholder="e.g. Highlights React 19, WebGL, and microservices architecture..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:bg-theme-card-hover transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition"
                >
                  Save Resume Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteResume}
        itemTitle={deleteTarget?.filename}
        message="Are you sure you want to delete this resume version? This action cannot be undone."
      />

      <ResumePreviewModal
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
        resume={previewResume}
      />
    </div>
  );
};

export default JobSearch;

