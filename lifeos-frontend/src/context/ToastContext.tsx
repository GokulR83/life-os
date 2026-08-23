import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastItem, ToastType, ToastContextType } from '../types/toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Event bus listeners to support non-React call sites (e.g. Axios interceptors)
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
const listeners = new Set<ToastListener>();

export const toastBus = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(toast: Omit<ToastItem, 'id'>) {
    listeners.forEach((listener) => listener(toast));
  },
  success(message: string, title?: string, duration?: number) {
    this.emit({ type: 'success', message, title, duration });
  },
  error(message: string, title?: string, duration?: number) {
    this.emit({ type: 'error', message, title, duration });
  },
  info(message: string, title?: string, duration?: number) {
    this.emit({ type: 'info', message, title, duration });
  },
  warning(message: string, title?: string, duration?: number) {
    this.emit({ type: 'warning', message, title, duration });
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastItem = { id, duration: 4000, ...toast };
    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts on screen
  }, []);

  React.useEffect(() => {
    const unsubscribe = toastBus.subscribe(addToast);
    return unsubscribe;
  }, [addToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'success', message, title, duration });
  }, [addToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'error', message, title, duration });
  }, [addToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'info', message, title, duration });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'warning', message, title, duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
