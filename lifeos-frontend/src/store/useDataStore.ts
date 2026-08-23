import { useNoteStore } from './useNoteStore';
import { useJournalStore } from './useJournalStore';
import { useProjectStore } from './useProjectStore';
import { useJobStore } from './useJobStore';
import { useTaskStore } from './useTaskStore';
import { useExpenseStore } from './useExpenseStore';
import { useDSAStore } from './useDSAStore';
import { useResumeStore } from './useResumeStore';
import { useStudyStore } from './useStudyStore';
import authService from '../services/authService';
import { create } from 'zustand';

export interface UserState {
  user: any;
  setUser: (user: any) => void;
  fetchUserApi: () => Promise<any>;
  updateProfileApi: (payload: any) => Promise<any>;
}

const defaultUserData = {
  name: 'Active User',
  email: 'user@lifeos.dev',
  role: 'USER',
  theme: 'dark',
  workingStatus: 'Active Coding',
  streak: 1,
  dailyDSAGoal: 3,
  dailyStudyGoalHours: 4,
};

// User & global settings store
export const useUserStore = create<UserState>()((set) => ({
  user: defaultUserData,
  setUser: (user: any) =>
    set((state: any) => ({
      user: {
        ...state.user,
        ...user,
        streak: user?.streak !== undefined ? user.streak : (state.user?.streak ?? 0),
      },
    })),
  fetchUserApi: async () => {
    try {
      const user = await authService.getMe();
      if (user) {
        set((state: any) => ({
          user: {
            ...state.user,
            ...user,
            streak: user.streak !== undefined ? user.streak : 0,
          },
        }));
        return user;
      }
    } catch (err) {
      console.warn('[USER_STORE] Fetch profile API error:', err);
    }
  },
  updateProfileApi: async (payload: any) => {
    try {
      const updated = await authService.updateProfile(payload);
      if (updated) {
        set((state: any) => ({ user: { ...state.user, ...updated } }));
        return updated;
      }
    } catch (err) {
      console.warn('[USER_STORE] Update profile API error:', err);
    }
    set((state: any) => ({ user: { ...state.user, ...payload } }));
    return payload;
  }
}));

// Composite hook for backward compatibility across existing context callers
export const useDataStore = () => {
  const userState = useUserStore();
  const noteState = useNoteStore();
  const journalState = useJournalStore();
  const projectState = useProjectStore();
  const jobState = useJobStore();
  const taskState = useTaskStore();
  const expenseState = useExpenseStore();
  const dsaState = useDSAStore();
  const resumeState = useResumeStore();
  const studyState = useStudyStore();

  return {
    ...userState,
    ...noteState,
    ...journalState,
    ...projectState,
    ...jobState,
    ...taskState,
    ...expenseState,
    ...dsaState,
    ...resumeState,
    ...studyState
  };
};

export {
  useNoteStore,
  useJournalStore,
  useProjectStore,
  useJobStore,
  useTaskStore,
  useExpenseStore,
  useDSAStore,
  useResumeStore,
  useStudyStore
};

export default useDataStore;
