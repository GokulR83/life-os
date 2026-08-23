import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IStudySession, CreateStudySessionDTO, UpdateStudySessionDTO } from '@lifeos/contracts';

export interface StudyState {
  studySessions: IStudySession[];
  fetchStudySessionsApi: (force?: boolean) => Promise<IStudySession[]>;
  addStudySessionApi: (session: CreateStudySessionDTO) => Promise<IStudySession>;
  addStudySession: (session: CreateStudySessionDTO) => Promise<IStudySession>;
  updateStudySessionApi: (id: string, payload: UpdateStudySessionDTO) => Promise<IStudySession | UpdateStudySessionDTO>;
  deleteStudySessionApi: (id: string) => Promise<void>;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      studySessions: [],

      fetchStudySessionsApi: async (force = false) => {
        try {
          const sessions = await apiSdk.study.getAll();
          if (Array.isArray(sessions)) {
            const normalized = sessions.map((s) => {
              const durMins = s.durationMinutes || s.duration || 25;
              const durHrs = s.durationHours || parseFloat((durMins / 60).toFixed(2));
              return {
                ...s,
                id: s._id || s.id,
                durationHours: durHrs,
                durationMinutes: durMins,
                date: s.date || (s as any).createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              };
            });
            set({ studySessions: normalized });
            return normalized;
          }
          return get().studySessions || [];
        } catch (err) {
          console.warn('[STUDY_STORE] Fetch study sessions error:', err);
          return get().studySessions || [];
        }
      },

      addStudySessionApi: async (session: CreateStudySessionDTO) => {
        const durHours = session.durationHours || 1;
        const durMins = session.durationMinutes || Math.round(durHours * 60);

        const payload: CreateStudySessionDTO = {
          ...session,
          durationHours: durHours,
          durationMinutes: durMins,
          duration: durMins,
          date: session.date || new Date().toISOString().split('T')[0],
        };

        try {
          const created = await apiSdk.study.create(payload);
          if (created) {
            const formatted: IStudySession = {
              ...created,
              id: created._id || created.id,
              durationHours: created.durationHours || durHours,
              durationMinutes: created.durationMinutes || durMins,
            };
            set((state) => ({
              studySessions: [
                formatted,
                ...(state.studySessions || []).filter((s) => (s.id || s._id) !== formatted.id),
              ],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[STUDY_STORE] Create study session error:', err);
        }

        const fallbackId = `s_${Date.now()}`;
        const localSession: IStudySession = {
          id: fallbackId,
          _id: fallbackId,
          subject: session.subject,
          durationHours: durHours,
          durationMinutes: durMins,
          notes: session.notes || '',
          date: session.date || new Date().toISOString().split('T')[0],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({
          studySessions: [localSession, ...(state.studySessions || [])],
        }));
        return localSession;
      },

      addStudySession: async (session: CreateStudySessionDTO) => {
        return get().addStudySessionApi(session);
      },

      updateStudySessionApi: async (id: string, payload: UpdateStudySessionDTO) => {
        set((state) => ({
          studySessions: (state.studySessions || []).map((s) =>
            s.id === id || s._id === id ? { ...s, ...payload } : s
          ),
        }));

        if (!id || id.startsWith('s_') || id.length !== 24) {
          return payload;
        }

        try {
          const updated = await apiSdk.study.update(id, payload);
          if (updated) {
            const formatted = { ...updated, id: updated._id || updated.id };
            set((state) => ({
              studySessions: (state.studySessions || []).map((s) =>
                s.id === id || s._id === id ? { ...s, ...formatted } : s
              ),
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[STUDY_STORE] Update study session error:', err);
        }
        return payload;
      },

      deleteStudySessionApi: async (id: string) => {
        set((state) => ({
          studySessions: (state.studySessions || []).filter((s) => s.id !== id && s._id !== id),
        }));
        if (!id || id.startsWith('s_') || id.length !== 24) return;
        try {
          await apiSdk.study.delete(id);
        } catch (err) {
          console.warn('[STUDY_STORE] Delete study session error:', err);
        }
      },
    }),
    {
      name: 'lifeos_study_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
