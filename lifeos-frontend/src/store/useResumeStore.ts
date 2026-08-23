import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IResume, CreateResumeDTO } from '@lifeos/contracts';

export interface ResumeState {
  resumeVersions: IResume[];
  fetchResumesApi: (force?: boolean) => Promise<IResume[]>;
  addResumeVersionApi: (payload: CreateResumeDTO) => Promise<IResume>;
  deleteResumeVersionApi: (id: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumeVersions: [],

      fetchResumesApi: async (force = false) => {
        if (!force && get().resumeVersions && get().resumeVersions.length > 0) {
          return get().resumeVersions;
        }
        try {
          const resumes = await apiSdk.resumes.getAll();
          if (Array.isArray(resumes)) {
            set({ resumeVersions: resumes });
            return resumes;
          }
          return [];
        } catch (e) {
          console.warn('[RESUME_STORE] Fetch resumes error:', e);
          return [];
        }
      },

      addResumeVersionApi: async (payload: CreateResumeDTO) => {
        try {
          const created = await apiSdk.resumes.create(payload);
          if (created) {
            set((state) => ({
              resumeVersions: [created, ...(state.resumeVersions || [])],
            }));
            return created;
          }
        } catch (e) {
          console.warn('[RESUME_STORE] Add resume version error:', e);
        }
        const local: IResume = {
          id: `res_${Date.now()}`,
          _id: `res_${Date.now()}`,
          title: payload.title,
          targetRole: payload.targetRole,
          lastUpdated: new Date().toISOString().split('T')[0],
          ...payload,
        };
        set((state) => ({ resumeVersions: [local, ...(state.resumeVersions || [])] }));
        return local;
      },

      deleteResumeVersionApi: async (id: string) => {
        set((state) => ({
          resumeVersions: (state.resumeVersions || []).filter((r) => r.id !== id && r._id !== id),
        }));
        try {
          await apiSdk.resumes.delete(id);
        } catch (e) {
          console.warn('[RESUME_STORE] Delete resume error:', e);
        }
      },
    }),
    {
      name: 'lifeos_resume_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
