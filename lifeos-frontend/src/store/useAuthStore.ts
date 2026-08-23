import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '../services/authService';
import { useThemeStore } from './useThemeStore';
import { useUserStore } from './useDataStore';
import { IUser, ISignUpPayload, UserRole } from '../types/auth';

const DEMO_USER: ISignUpPayload & { avatar: string } = {
  name: 'Alex Chen',
  email: 'alex.chen@lifeos.dev',
  password: 'password123',
  role: 'USER',
  profession: 'Software Developer & Lifelong Learner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
};

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  currentUser: IUser | null;
  token: string | null;
  rememberMe: boolean;
  isLoading: boolean;
  authError: string | null;
  checkAuth: () => Promise<boolean>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: IUser; message?: string }>;
  demoLogin: () => Promise<{ success: boolean; user?: IUser; message?: string }>;
  register: (payload: ISignUpPayload) => Promise<{ success: boolean; user?: IUser; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => { success: boolean; message: string };
  updateProfile: (updatedFields: Partial<IUser> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; user?: IUser; message?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isInitialized: false,
      currentUser: null,
      token: sessionStorage.getItem('lifeos_token') || null,
      rememberMe: true,
      isLoading: false,
      authError: null,

      checkAuth: async () => {
        const existingToken = get().token || sessionStorage.getItem('lifeos_token');
        const cachedUser = get().currentUser;

        if (!existingToken) {
          set({ isAuthenticated: false, currentUser: null, token: null, isInitialized: true, isLoading: false });
          return false;
        }

        // 1. FAST PATH: Instantly hydrate session if token exists (0ms UI latency)
        set({
          isAuthenticated: true,
          isInitialized: true,
          token: existingToken,
          currentUser: cachedUser || get().currentUser
        });

        // 2. SILENT REVALIDATION: Verify token in background without blocking screen render
        try {
          const user = await authService.getMe();

          if (user?.theme) {
            useThemeStore.getState().setTheme(user.theme, false);
          }

          useUserStore.getState().setUser(user);

          set({
            isAuthenticated: true,
            isInitialized: true,
            currentUser: user,
            token: existingToken,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          console.warn('[AUTH] Silent background revalidation failed:', error?.message);
          sessionStorage.removeItem('lifeos_token');
          set({
            isAuthenticated: false,
            isInitialized: true,
            currentUser: null,
            token: null,
            isLoading: false,
          });
          return false;
        }
      },

      login: async (email: string, password: string, rememberMe = true) => {
        const cleanEmail = email.trim().toLowerCase();
        try {
          set({ isLoading: true, authError: null });
          const { user, token } = await authService.login(cleanEmail, password);

          sessionStorage.setItem('lifeos_token', token);

          // Fetch full user profile to ensure calculated streak and user state are synced
          let fullUser = user;
          try {
            const me = await authService.getMe();
            if (me) fullUser = me;
          } catch (e) {
            // fallback to login response user
          }

          if (fullUser?.theme) {
            useThemeStore.getState().setTheme(fullUser.theme, false);
          }

          useUserStore.getState().setUser(fullUser);

          set({
            isAuthenticated: true,
            isInitialized: true,
            currentUser: fullUser,
            token,
            rememberMe,
            isLoading: false,
            authError: null,
          });

          return { success: true, user: fullUser };
        } catch (error: any) {
          const message = error?.message || 'Login failed. Please check your credentials.';
          set({ isLoading: false, authError: message });
          return { success: false, message };
        }
      },

      demoLogin: async () => {
        const result = await get().login(DEMO_USER.email, DEMO_USER.password, true);
        if (result.success) return result;

        try {
          const regResult = await get().register(DEMO_USER);
          return regResult;
        } catch (e) {
          return { success: false, message: 'Failed to initialize demo login.' };
        }
      },

      register: async ({ name, email, password, role, profession, avatar }: ISignUpPayload) => {
        const cleanEmail = email.trim().toLowerCase();
        const professionTitle = profession || (role && ['ADMIN', 'USER'].includes(role) ? 'Software Developer' : role) || 'Software Engineer & CS Student';
        const validApiRole: UserRole = (role && ['ADMIN', 'USER'].includes(role) ? (role as UserRole) : 'USER');

        try {
          set({ isLoading: true, authError: null });
          const { user, token } = await authService.register({
            name,
            email: cleanEmail,
            password,
            role: validApiRole,
            avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          });

          const userWithTitle: IUser = {
            ...user,
            title: professionTitle,
            role: user.role || validApiRole,
          };

          sessionStorage.setItem('lifeos_token', token);

          if (user?.theme) {
            useThemeStore.getState().setTheme(user.theme, false);
          }

          useUserStore.getState().setUser(userWithTitle);

          set({
            isAuthenticated: true,
            isInitialized: true,
            currentUser: userWithTitle,
            token,
            rememberMe: true,
            isLoading: false,
            authError: null,
          });

          return { success: true, user: userWithTitle };
        } catch (error: any) {
          const message = error?.message || 'Registration failed. Please try again.';
          set({ isLoading: false, authError: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        const currentToken = sessionStorage.getItem('lifeos_token') || get().token;

        // Clear local credentials immediately to halt loop
        sessionStorage.removeItem('lifeos_token');
        set({
          isAuthenticated: false,
          isInitialized: true,
          currentUser: null,
          token: null,
          rememberMe: false,
          authError: null,
        });

        // Only issue network call if token was present
        if (currentToken) {
          try {
            await authService.logout();
          } catch (e) {
            // ignore network errors during logout
          }
        }
      },

      resetPassword: (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        return {
          success: true,
          message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
        };
      },

      updateProfile: async (updatedFields: Partial<IUser> & { currentPassword?: string; newPassword?: string }) => {
        try {
          set({ isLoading: true, authError: null });
          const updatedUser = await authService.updateProfile(updatedFields);

          if (updatedUser?.theme) {
            useThemeStore.getState().setTheme(updatedUser.theme, false);
          }

          useUserStore.getState().setUser(updatedUser);

          set((state) => ({
            currentUser: { ...state.currentUser, ...updatedUser },
            isLoading: false,
          }));
          return { success: true, user: updatedUser };
        } catch (error: any) {
          const message = error?.message || 'Failed to update profile.';
          set({ isLoading: false, authError: message });
          return { success: false, message };
        }
      },
    }),
    {
      name: 'lifeos_auth_store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state: AuthState) => ({
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          state.isInitialized = true;
        }
      }
    }
  )
);

export default useAuthStore;
