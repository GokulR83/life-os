import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return <>{children}</>;
};

export const useAuth = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    isInitialized: store.isInitialized,
    currentUser: store.currentUser,
    token: store.token,
    isLoading: store.isLoading,
    authError: store.authError,
    login: store.login,
    demoLogin: store.demoLogin,
    register: store.register,
    logout: store.logout,
    resetPassword: store.resetPassword,
    updateProfile: store.updateProfile,
    checkAuth: store.checkAuth,
  };
};

export default useAuthStore;
