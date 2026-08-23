import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { CustomSelect } from '../components/common/CustomSelect';
import { formatDateDisplay } from '../utils/dateUtils';
import {
  FolderGit2,
  Calendar,
  CheckSquare,
  X,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Filter,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';

export const Projects = () => {
  const {
    projects,
    tasks,
    fetchProjectsApi,
    addProjectApi,
    updateProjectApi,
    deleteProjectApi
  } = useData();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form states for creating / editing project
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FRONTEND');
  const [status, setStatus] = useState('In Progress');
  const [dueDate, setDueDate] = useState('2026-09-01');
  const [techStackInput, setTechStackInput] = useState('React, Tailwind CSS, Vite');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fetchProjectsApi) {
      fetchProjectsApi();
    }
  }, []);

  const getStatusVariant = (s: string) => {
    switch (s) {
      case 'Completed':
        return 'low';
      case 'In Progress':
        return 'orange';
      case 'Planning':
        return 'purple';
      case 'On Hold':
        return 'danger';
      default:
        return 'default';
    }
  };

  const categoriesList = Array.from(
    new Set([
      'All',
      'FRONTEND',
      'BACKEND / SYSTEMS',
      'WEB GRAPHICS',
      'AI / DX TOOLS',
      ...((projects || []).map((p: any) => (p.category || '').toUpperCase()).filter(Boolean))
    ])
  );

  const filteredProjects = (projects || []).filter((p: any) => {
    if (selectedCategory === 'All') return true;
    return (p.category || '').toUpperCase() === selectedCategory.toUpperCase();
  });

  const resetForm = () => {
    setTitle('');
    setCategory('FRONTEND');
    setStatus('In Progress');
    setDueDate('2026-09-01');
    setTechStackInput('React, Tailwind CSS, Vite');
    setDescription('');
    setGithubUrl('');
    setDemoUrl('');
    setFormError('');
    setEditingProject(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setTitle(proj.title || proj.name || '');
    setCategory(proj.category || 'FRONTEND');
    setStatus(proj.status || 'In Progress');
    setDueDate(proj.dueDate || proj.deadline || '2026-09-01');
    setTechStackInput(Array.isArray(proj.techStack) ? proj.techStack.join(', ') : 'React, TypeScript');
    setDescription(proj.description || '');
    setGithubUrl(proj.githubUrl || '');
    setDemoUrl(proj.demoUrl || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const pId = proj.id || proj._id;
    setDeleteTarget({ id: pId, title: proj.title || proj.name || 'Project' });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget && deleteProjectApi) {
      await deleteProjectApi(deleteTarget.id);
    }
    setDeleteTarget(null);
    if (selectedProject && (selectedProject.id === deleteTarget?.id || selectedProject._id === deleteTarget?.id)) {
      setSelectedProject(null);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Project title is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const techStackArray = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      name: title.trim(),
      category: category.trim(),
      status: status.trim(),
      dueDate: dueDate.trim(),
      deadline: dueDate.trim(),
      techStack: techStackArray,
      description: description.trim(),
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl.trim(),
    };

    if (editingProject) {
      const pId = editingProject.id || editingProject._id;
      if (updateProjectApi) {
        await updateProjectApi(pId, payload);
      }
    } else {
      if (addProjectApi) {
        await addProjectApi(payload);
      }
    }

    setSubmitting(false);
    setIsAddModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-border flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-theme-main tracking-tight flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-theme-accent" />
            Engineering Projects Portfolio
          </h2>
          <p className="text-xs text-theme-muted">Track active software projects, completion rates, and milestones</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-theme-accent-light text-theme-accent border border-theme-border">
            {(projects || []).length} Total Projects
          </span>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 py-1 overflow-x-auto text-xs font-semibold">
        <span className="text-theme-accent font-extrabold flex items-center gap-1.5 shrink-0 mr-1">
          <Filter className="h-4 w-4 text-theme-accent" />
          Filter Category:
        </span>
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full border text-xs font-extrabold transition cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                : 'bg-theme-surface border-theme-border text-theme-muted hover:text-theme-main hover:border-theme-accent/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-theme-border bg-theme-card space-y-3">
          <FolderGit2 className="h-10 w-10 text-theme-muted mx-auto opacity-50" />
          <h3 className="text-base font-bold text-theme-main">No projects found for category &ldquo;{selectedCategory}&rdquo;</h3>
          <p className="text-xs text-theme-muted">Click "+ Add Project" to create your first project build.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj: any) => {
            const pId = proj.id || proj._id;
            const progressVal = typeof proj.progress === 'number' ? proj.progress : 0;
            const completedCount = proj.completedTasksCount || 0;
            const totalCount = proj.tasksCount || 0;
            const techList = Array.isArray(proj.techStack) ? proj.techStack : ['React', 'TypeScript'];

            return (
              <div
                key={pId}
                onClick={() => setSelectedProject(proj)}
                className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm hover:shadow-md hover:border-theme-accent transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-theme-muted truncate max-w-[150px]">
                      {proj.category || 'General'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <Badge variant={getStatusVariant(proj.status || 'In Progress')} size="sm">
                        {proj.status || 'In Progress'}
                      </Badge>
                      <button
                        onClick={(e) => handleOpenEditModal(proj, e)}
                        className="p-1 rounded text-theme-muted hover:text-theme-accent hover:bg-theme-surface transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(proj, e)}
                        className="p-1 rounded text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-theme-main group-hover:text-theme-accent transition">
                    {proj.title || proj.name || 'Untitled Project'}
                  </h3>
                  <p className="text-xs text-theme-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.description || 'No project description provided.'}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {techList.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border text-[10px] font-mono text-theme-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-theme-border space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-theme-muted">Completion Progress</span>
                    <span className="text-theme-accent font-extrabold">{progressVal}%</span>
                  </div>
                  <ProgressBar progress={progressVal} height="h-2" />

                  <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-emerald-500" />
                      {completedCount} / {totalCount} Tasks Done
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-theme-accent" />
                      Due: {formatDateDisplay(proj.dueDate || proj.deadline || '2026-09-01')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <h3 className="text-base font-extrabold text-theme-main flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-theme-accent" />
                <span>{editingProject ? 'Edit Project Details' : 'Create New Project'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-surface transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">
                  Project Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Rate Limiter Service"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={['FRONTEND', 'BACKEND / SYSTEMS', 'WEB GRAPHICS', 'AI / DX TOOLS', 'FULL STACK', 'MOBILE']}
                    variant="default"
                    size="md"
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Status</label>
                  <CustomSelect
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={['In Progress', 'Planning', 'Completed', 'On Hold']}
                    variant="status"
                    size="md"
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Tech Stack (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Tailwind CSS, Vite"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1">Description</label>
                <textarea
                  placeholder="Describe key architecture, technical specifications, and project scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">GitHub Repo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://my-app.vercel.app"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-theme-muted hover:bg-theme-card-hover transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-extrabold text-xs shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail Drawer Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-2xl p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                  {selectedProject.category || 'General'}
                </span>
                <h3 className="text-lg font-extrabold text-theme-main">
                  {selectedProject.title || selectedProject.name || 'Project Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              {selectedProject.description || 'No description available for this project.'}
            </p>

            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-theme-muted">Milestone Overall Progress</span>
                <span className="text-theme-accent">{selectedProject.progress || 0}%</span>
              </div>
              <ProgressBar progress={selectedProject.progress || 0} height="h-2.5" />
              <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1">
                <span>Completed Tasks: {selectedProject.completedTasksCount || 0} / {selectedProject.tasksCount || 0}</span>
                <span>Target Due Date: {formatDateDisplay(selectedProject.dueDate || selectedProject.deadline || '2026-09-01')}</span>
              </div>
            </div>

            {/* Links & Repository */}
            {(selectedProject.githubUrl || selectedProject.demoUrl) && (
              <div className="flex items-center space-x-3 pt-1">
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-accent text-xs font-bold text-theme-main transition flex items-center gap-2"
                  >
                    <FolderGit2 className="h-4 w-4 text-theme-accent" />
                    <span>View GitHub Repo</span>
                  </a>
                )}
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover text-xs font-bold transition flex items-center gap-2 shadow"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Launch Live Demo</span>
                  </a>
                )}
              </div>
            )}

            {/* Linked Tasks */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-theme-muted">Linked Tasks Breakdown</h4>
              {tasks && tasks.length > 0 ? (
                tasks.slice(0, 5).map((t: any) => (
                  <div
                    key={t.id || t._id}
                    className="p-3 rounded-xl border border-theme-border bg-theme-surface flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-theme-main flex items-center gap-2">
                      <CheckSquare className={`h-4 w-4 ${t.completed ? 'text-emerald-500' : 'text-theme-muted'}`} />
                      {t.title}
                    </span>
                    <Badge variant={t.completed ? 'low' : 'orange'} size="sm">
                      {t.status || (t.completed ? 'Completed' : 'Pending')}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-theme-muted italic">No linked tasks found.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs cursor-pointer shadow"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={deleteTarget?.title}
        message="Are you sure you want to delete this project build? This action cannot be undone."
      />
    </div>
  );
};

export default Projects;
