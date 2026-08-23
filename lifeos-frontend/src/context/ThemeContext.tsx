import React, { useEffect } from 'react';
import { useThemeStore, applyThemeToDOM, themesList as themesListData } from '../store/useThemeStore';

export const themesList = themesListData;

export function ThemeProvider({ children }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    applyThemeToDOM(themeId);
  }, [themeId]);

  return <>{children}</>;
}

export const useTheme = () => {
  const store = useThemeStore();
  return {
    theme: store.themeId,
    currentTheme: store.currentTheme,
    themesList: store.themesList,
    setTheme: store.setTheme
  };
};

export default useThemeStore;
