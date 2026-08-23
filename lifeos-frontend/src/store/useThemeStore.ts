import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '../services/authService';

export interface ThemeConfig {
  id: string;
  name: string;
  iconName: string;
  color: string;
  secondaryColor: string;
  previewBg: string;
  [key: string]: any;
}

export const themesList: ThemeConfig[] = [
  { id: 'dark', name: 'Obsidian Slate (Dark)', iconName: 'Moon', color: '#f97316', secondaryColor: '#f59e0b', previewBg: '#090d16' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', iconName: 'Zap', color: '#06b6d4', secondaryColor: '#eab308', previewBg: '#06070a' },
  { id: 'emerald', name: 'Emerald Forest', iconName: 'Trees', color: '#10b981', secondaryColor: '#34d399', previewBg: '#04120e' },
  { id: 'sunset', name: 'Vibrant Sunset', iconName: 'Sun', color: '#f97316', secondaryColor: '#ec4899', previewBg: '#0d0814' },
  { id: 'midnight', name: 'Deep Midnight Indigo', iconName: 'Sparkles', color: '#6366f1', secondaryColor: '#8b5cf6', previewBg: '#000000' },
  { id: 'blue', name: 'Cyber Blue', iconName: 'Zap', color: '#0284c7', secondaryColor: '#38bdf8', previewBg: '#050b18' },
  { id: 'purple', name: 'Dracula Purple', iconName: 'Sparkles', color: '#a855f7', secondaryColor: '#f472b6', previewBg: '#0f0919' },
  { id: 'nordic', name: 'Nordic Mint Frost', iconName: 'Trees', color: '#2dd4bf', secondaryColor: '#38bdf8', previewBg: '#0f172a' },
  { id: 'crimson', name: 'Crimson Velvet', iconName: 'Zap', color: '#f43f5e', secondaryColor: '#fb7185', previewBg: '#0f0507' },
  { id: 'light', name: 'Clean Snow (Light)', iconName: 'Sun', color: '#ea580c', secondaryColor: '#d97706', previewBg: '#f8fafc' }
];

export const applyThemeToDOM = (id: string) => {
  if (typeof document === 'undefined') return;
  const found = themesList.find((t) => t.id === id) || themesList[0];
  document.documentElement.setAttribute('data-theme', found.id);
  document.documentElement.className = found.id === 'dark' ? 'dark' : `theme-${found.id} ${found.id}`;
};

export interface ThemeStoreState {
  themeId: string;
  currentTheme: ThemeConfig;
  themesList: ThemeConfig[];
  setTheme: (id: string, syncBackend?: boolean) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      themeId: 'dark',
      currentTheme: themesList[0],
      themesList,

      setTheme: (id: string, syncBackend = true) => {
        const found = themesList.find((t) => t.id === id) || themesList[0];
        applyThemeToDOM(found.id);
        set({ themeId: found.id, currentTheme: found });

        if (syncBackend) {
          const token = sessionStorage.getItem('lifeos_token') || localStorage.getItem('lifeos_token');
          if (token) {
            authService.updateProfile({ theme: found.id }).catch((err) => {
              console.warn('[THEME] Backend theme sync notice:', err?.message);
            });
          }
        }
      }
    }),
    {
      name: 'lifeos_theme_store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state?: ThemeStoreState) => {
        if (state && state.themeId) {
          applyThemeToDOM(state.themeId);
        } else if (state && state.currentTheme) {
          applyThemeToDOM(state.currentTheme.id);
        } else {
          applyThemeToDOM('dark');
        }
      }
    }
  )
);

// Apply initial theme on script parse if running in browser
if (typeof document !== 'undefined') {
  try {
    const raw = localStorage.getItem('lifeos_theme_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedThemeId = parsed?.state?.themeId || parsed?.state?.currentTheme?.id || 'dark';
      applyThemeToDOM(savedThemeId);
    } else {
      applyThemeToDOM('dark');
    }
  } catch (e) {
    applyThemeToDOM('dark');
  }
}

export default useThemeStore;
