import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IProject, CreateProjectDTO, UpdateProjectDTO } from '@lifeos/contracts';

export interface ProjectState {
  projects: IProject[];
  fetchProjectsApi: (force?: boolean) => Promise<IProject[]>;
  addProjectApi: (project: CreateProjectDTO) => Promise<IProject>;
  updateProjectApi: (projectId: string, payload: UpdateProjectDTO) => Promise<IProject | UpdateProjectDTO>;
  deleteProjectApi: (projectId: string) => Promise<void>;
  addProject: (project: CreateProjectDTO) => void;
  updateProject: (projectId: string, updatedFields: UpdateProjectDTO) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],

      fetchProjectsApi: async (force = false) => {
        if (!force && get().projects && get().projects.length > 0) {
          return get().projects;
        }
        try {
          const projects = await apiSdk.projects.getAll();
          if (Array.isArray(projects)) {
            set({ projects });
            return projects;
          }
          return [];
        } catch (err) {
          console.warn('[PROJECT_STORE] Fetch projects error:', err);
          return [];
        }
      },

      addProjectApi: async (project: CreateProjectDTO) => {
        try {
          const created = await apiSdk.projects.create(project);
          if (created) {
            set((state) => ({
              projects: [
                created,
                ...(state.projects || []).filter((p) => p.id !== created.id && p._id !== created._id),
              ],
            }));
            return created;
          }
        } catch (err) {
          console.warn('[PROJECT_STORE] Create project error:', err);
        }
        const fallbackId = `p_${Date.now()}`;
        const localProject: IProject = {
          id: fallbackId,
          _id: fallbackId,
          title: project.title || project.name || 'New Build',
          category: project.category || 'FULLSTACK',
          status: project.status || 'Planning',
          progress: project.progress || 0,
          techStack: project.techStack || ['React', 'TypeScript'],
          description: project.description || '',
          dueDate: project.dueDate || '2026-09-01',
        };
        set((state) => ({
          projects: [localProject, ...(state.projects || [])],
        }));
        return localProject;
      },

      updateProjectApi: async (projectId: string, payload: UpdateProjectDTO) => {
        try {
          const updated = await apiSdk.projects.update(projectId, payload);
          if (updated) {
            set((state) => ({
              projects: (state.projects || []).map((p) =>
                p.id === projectId || p._id === projectId ? { ...p, ...updated } : p
              ),
            }));
            return updated;
          }
        } catch (err) {
          console.warn('[PROJECT_STORE] Update project error:', err);
        }
        set((state) => ({
          projects: (state.projects || []).map((p) =>
            p.id === projectId || p._id === projectId ? { ...p, ...payload } : p
          ),
        }));
        return payload;
      },

      deleteProjectApi: async (projectId: string) => {
        set((state) => ({
          projects: (state.projects || []).filter((p) => p.id !== projectId && p._id !== projectId),
        }));
        try {
          await apiSdk.projects.delete(projectId);
        } catch (err) {
          console.warn('[PROJECT_STORE] Delete project error:', err);
        }
      },

      addProject: (project: CreateProjectDTO) => get().addProjectApi(project),

      updateProject: (projectId: string, updatedFields: UpdateProjectDTO) => get().updateProjectApi(projectId, updatedFields),
    }),
    {
      name: 'lifeos_project_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
