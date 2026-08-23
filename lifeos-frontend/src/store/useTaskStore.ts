import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { useAuthStore } from './useAuthStore';
import { ITask, CreateTaskDTO, UpdateTaskDTO, IHabit, CreateHabitDTO, UpdateHabitDTO, IStudySession, CreateStudySessionDTO } from '@lifeos/contracts';

export interface TaskState {
  tasks: ITask[];
  studySessions: IStudySession[];
  habits: IHabit[];
  fetchTasksApi: (params?: any, force?: boolean) => Promise<ITask[]>;
  addTaskApi: (task: CreateTaskDTO) => Promise<ITask>;
  updateTaskApi: (taskId: string, payload: UpdateTaskDTO) => Promise<void>;
  deleteTaskApi: (taskId: string) => Promise<void>;
  toggleTaskApi: (taskId: string) => Promise<void>;
  moveAllOverdueToTodayApi: () => Promise<void>;

  fetchHabitsApi: (force?: boolean) => Promise<IHabit[]>;
  addHabitApi: (habit: CreateHabitDTO) => Promise<IHabit>;
  toggleHabitApi: (habitId: string) => Promise<void>;
  updateHabitApi: (habitId: string, payload: UpdateHabitDTO) => Promise<void>;
  deleteHabitApi: (habitId: string) => Promise<void>;

  fetchStudySessionsApi: (force?: boolean) => Promise<IStudySession[]>;
  addStudySessionApi: (session: CreateStudySessionDTO) => Promise<IStudySession>;

  toggleTask: (taskId: string) => void;
  addTask: (task: CreateTaskDTO) => void;
  updateTask: (taskId: string, updatedFields: UpdateTaskDTO) => void;
  deleteTask: (taskId: string) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabit: (habitId: string) => void;
  addHabit: (habit: CreateHabitDTO) => void;
  toggleHabitDate: (habitId: string, dateStr?: string) => void;
  addStudySession: (session: CreateStudySessionDTO) => void;
}

const isMongoId = (id: string) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      studySessions: [],
      habits: [],

      fetchTasksApi: async (params?: any, force = false) => {
        if (!force && get().tasks && get().tasks.length > 0) {
          return get().tasks;
        }
        try {
          const items = await apiSdk.tasks.getAll();
          if (Array.isArray(items)) {
            const normalized = items.map((t) => ({
              ...t,
              id: t._id || t.id,
              title: t.title || 'Untitled Task',
              status: t.status || (t.completed ? 'Done' : 'Todo'),
              priority: t.priority || 'Medium',
              category: t.category || 'General',
              dueDate: t.dueDate || t.deadline || new Date().toISOString().split('T')[0],
              deadline: t.deadline || t.dueDate || new Date().toISOString().split('T')[0],
              completed: t.completed !== undefined ? t.completed : t.status === 'Done',
            }));
            set({ tasks: normalized });
            return normalized;
          }
          return [];
        } catch (err) {
          console.warn('[TASK_STORE] Fetch tasks error:', err);
          return [];
        }
      },

      addTaskApi: async (task: CreateTaskDTO) => {
        const payload: CreateTaskDTO = {
          title: task.title || 'Untitled Task',
          description: task.description || '',
          status: task.status || 'Todo',
          priority: task.priority || 'Medium',
          category: task.category || 'General',
          dueDate: task.dueDate || task.deadline || new Date().toISOString().split('T')[0],
          estimatedMinutes: task.estimatedMinutes || 30,
          completed: task.completed || false,
        };

        try {
          const created = await apiSdk.tasks.create(payload);
          if (created) {
            const formatted: ITask = {
              ...created,
              id: created._id || created.id,
              title: created.title || payload.title,
              status: created.status || payload.status || 'Todo',
              dueDate: created.dueDate || payload.dueDate,
              priority: created.priority || payload.priority || 'Medium',
            };
            set((state) => ({
              tasks: [formatted, ...(state.tasks || []).filter((t) => (t.id || t._id) !== formatted.id)],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[TASK_STORE] Create task error:', err);
        }

        const fallbackId = `t_${Date.now()}`;
        const localTask: ITask = {
          id: fallbackId,
          _id: fallbackId,
          title: payload.title,
          status: payload.status || 'Todo',
          priority: payload.priority || 'Medium',
          ...payload,
        };
        set((state) => ({ tasks: [localTask, ...(state.tasks || [])] }));
        return localTask;
      },

      updateTaskApi: async (taskId: string, payload: UpdateTaskDTO) => {
        set((state) => ({
          tasks: (state.tasks || []).map((t) =>
            t.id === taskId || t._id === taskId ? { ...t, ...payload } : t
          ),
        }));

        if (isMongoId(taskId)) {
          try {
            await apiSdk.tasks.update(taskId, payload);
          } catch (err) {
            console.warn('[TASK_STORE] Update task error:', err);
          }
        }
      },

      deleteTaskApi: async (taskId: string) => {
        set((state) => ({
          tasks: (state.tasks || []).filter((t) => t.id !== taskId && t._id !== taskId),
        }));

        if (isMongoId(taskId)) {
          try {
            await apiSdk.tasks.delete(taskId);
          } catch (err) {
            console.warn('[TASK_STORE] Delete task error:', err);
          }
        }
      },

      toggleTaskApi: async (taskId: string) => {
        const target = (get().tasks || []).find((t) => t.id === taskId || t._id === taskId);
        if (!target) return;
        const newCompleted = !target.completed;
        const newStatus = newCompleted ? 'Done' : 'In Progress';

        await get().updateTaskApi(taskId, { completed: newCompleted, status: newStatus });
      },

      moveAllOverdueToTodayApi: async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        set((state) => ({
          tasks: (state.tasks || []).map((t) => {
            const rawDate = t.dueDate || t.deadline;
            const taskDateStr = rawDate ? rawDate.split('T')[0] : '';
            if (taskDateStr && taskDateStr < todayStr && !t.completed) {
              return { ...t, dueDate: todayStr, deadline: todayStr };
            }
            return t;
          }),
        }));
      },

      // HABITS API IMPLEMENTATION
      fetchHabitsApi: async (force = false) => {
        if (!force && get().habits && get().habits.length > 0) {
          return get().habits;
        }
        try {
          const items = await apiSdk.habits.getAll();
          if (Array.isArray(items)) {
            const todayStr = new Date().toISOString().split('T')[0];
            const normalized = items.map((h) => {
              const logs = h.completedDates || h.completionLog || [];
              const isCompletedToday = h.completedToday !== undefined ? h.completedToday : logs.includes(todayStr);
              return {
                ...h,
                id: h._id || h.id,
                name: h.name || h.title || 'Daily Habit',
                title: h.title || h.name || 'Daily Habit',
                completedDates: logs,
                completionLog: logs,
                completedToday: isCompletedToday,
              };
            });
            set({ habits: normalized });

            const maxStreak = Math.max(...normalized.map((h) => h.streak || 0), 0);
            const authUser = useAuthStore.getState().currentUser;
            if (authUser && maxStreak > 0) {
              useAuthStore.setState({ currentUser: { ...authUser, streak: maxStreak } });
            }
            return normalized;
          }
          return [];
        } catch (err) {
          console.warn('[TASK_STORE] Fetch habits error:', err);
          return [];
        }
      },

      addHabitApi: async (habit: CreateHabitDTO) => {
        const payload: CreateHabitDTO = {
          name: habit.name || habit.title || 'Daily Habit',
          title: habit.title || habit.name || 'Daily Habit',
          category: habit.category || 'Personal',
          frequency: habit.frequency || 'daily',
          completedDates: habit.completedDates || [],
        };

        try {
          const created = await apiSdk.habits.create(payload);
          if (created) {
            const formatted = { ...created, id: created._id || created.id };
            set((state) => ({
              habits: [formatted, ...(state.habits || []).filter((h) => (h.id || h._id) !== formatted.id)],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[TASK_STORE] Create habit error:', err);
        }

        const fallbackId = `h_${Date.now()}`;
        const localHabit: IHabit = { id: fallbackId, _id: fallbackId, ...payload };
        set((state) => ({ habits: [localHabit, ...(state.habits || [])] }));
        return localHabit;
      },

      toggleHabitApi: async (habitId: string) => {
        const targetHabit = (get().habits || []).find((h) => h.id === habitId || h._id === habitId);
        if (!targetHabit) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const logs = targetHabit.completedDates || [];
        const isDone = logs.includes(todayStr);
        const newLogs = isDone ? logs.filter((d) => d !== todayStr) : [...logs, todayStr];

        set((state) => ({
          habits: (state.habits || []).map((h) =>
            h.id === habitId || h._id === habitId
              ? { ...h, completedDates: newLogs, completedToday: !isDone }
              : h
          ),
        }));

        if (isMongoId(habitId)) {
          try {
            await apiSdk.habits.update(habitId, { completedDates: newLogs });
          } catch (err) {
            console.warn('[TASK_STORE] Toggle habit error:', err);
          }
        }
      },

      updateHabitApi: async (habitId: string, payload: UpdateHabitDTO) => {
        set((state) => ({
          habits: (state.habits || []).map((h) =>
            h.id === habitId || h._id === habitId ? { ...h, ...payload } : h
          ),
        }));

        if (isMongoId(habitId)) {
          try {
            await apiSdk.habits.update(habitId, payload);
          } catch (err) {
            console.warn('[TASK_STORE] Update habit error:', err);
          }
        }
      },

      deleteHabitApi: async (habitId: string) => {
        set((state) => ({
          habits: (state.habits || []).filter((h) => h.id !== habitId && h._id !== habitId),
        }));

        if (isMongoId(habitId)) {
          try {
            await apiSdk.habits.delete(habitId);
          } catch (err) {
            console.warn('[TASK_STORE] Delete habit error:', err);
          }
        }
      },

      // STUDY SESSIONS API IMPLEMENTATION
      fetchStudySessionsApi: async (force = false) => {
        try {
          const items = await apiSdk.study.getAll();
          if (Array.isArray(items)) {
            const normalized = items.map((s) => ({
              ...s,
              id: s._id || s.id,
              subject: s.subject || 'Study Session',
              durationHours: s.durationHours || parseFloat(s.duration as any) || 1,
              date: s.date || new Date().toISOString().split('T')[0],
            }));
            set({ studySessions: normalized });
            return normalized;
          }
          return get().studySessions || [];
        } catch (err) {
          console.warn('[TASK_STORE] Fetch study sessions error:', err);
          return get().studySessions || [];
        }
      },

      addStudySessionApi: async (session: CreateStudySessionDTO) => {
        const payload: CreateStudySessionDTO = {
          subject: session.subject || 'Study Session',
          durationHours: session.durationHours || 1,
          notes: session.notes || '',
          date: session.date || new Date().toISOString().split('T')[0],
        };

        try {
          const created = await apiSdk.study.create(payload);
          if (created) {
            const formatted = { ...created, id: created._id || created.id };
            set((state) => ({
              studySessions: [formatted, ...(state.studySessions || []).filter((s) => (s.id || s._id) !== formatted.id)],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[TASK_STORE] Create study session error:', err);
        }

        const fallbackId = `s_${Date.now()}`;
        const local: IStudySession = { id: fallbackId, _id: fallbackId, subject: payload.subject, durationHours: payload.durationHours || 1, date: payload.date || '' };
        set((state) => ({ studySessions: [local, ...(state.studySessions || [])] }));
        return local;
      },

      // Synchronous Local Handlers
      toggleTask: (taskId: string) => {
        get().toggleTaskApi(taskId);
      },

      addTask: (task: CreateTaskDTO) => {
        get().addTaskApi(task);
      },

      updateTask: (taskId: string, updatedFields: UpdateTaskDTO) => {
        get().updateTaskApi(taskId, updatedFields);
      },

      deleteTask: (taskId: string) => {
        get().deleteTaskApi(taskId);
      },

      deleteHabit: (habitId: string) => {
        get().deleteHabitApi(habitId);
      },

      toggleHabit: (habitId: string) => {
        get().toggleHabitApi(habitId);
      },

      addHabit: (habit: CreateHabitDTO) => {
        get().addHabitApi(habit);
      },

      toggleHabitDate: (habitId: string) => {
        get().toggleHabitApi(habitId);
      },

      addStudySession: (session: CreateStudySessionDTO) => {
        get().addStudySessionApi(session);
      },
    }),
    {
      name: 'lifeos_task_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
