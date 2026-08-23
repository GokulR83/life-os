import React, { useEffect } from 'react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeToEntityChanges } from '../services/socketClient';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useDataStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!isAuthenticated && !token) return;

    // 1. Session & User State Initialization
    if (store.fetchUserApi) store.fetchUserApi();
    if (store.fetchDsaPatternsApi) store.fetchDsaPatternsApi(true);
    if (store.fetchFlashcardsApi) store.fetchFlashcardsApi(true);

    // 2. Real-time WebSocket Synchronization
    const unsubscribe = subscribeToEntityChanges((event) => {
      const { entityType } = event;
      switch (entityType) {
        case 'tasks':
          if (store.fetchTasksApi) store.fetchTasksApi();
          break;
        case 'habits':
          if (store.fetchHabitsApi) store.fetchHabitsApi();
          break;
        case 'projects':
          if (store.fetchProjectsApi) store.fetchProjectsApi();
          break;
        case 'notes':
          if (store.fetchNotesApi) store.fetchNotesApi();
          break;
        case 'jobs':
          if (store.fetchJobsApi) store.fetchJobsApi();
          break;
        case 'expenses':
          if (store.fetchExpensesApi) store.fetchExpensesApi();
          break;
        case 'journals':
          if (store.fetchJournalsApi) store.fetchJournalsApi();
          break;
        case 'flashcards':
          if (store.fetchFlashcardsApi) store.fetchFlashcardsApi(true);
          break;
        case 'dsa':
        case 'dsaPatterns':
          if (store.fetchDsaPatternsApi) store.fetchDsaPatternsApi(true);
          break;
        case 'resumes':
          if (store.fetchResumesApi) store.fetchResumesApi();
          break;
        case 'study':
          if (store.fetchStudySessionsApi) store.fetchStudySessionsApi();
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, token]);

  return <>{children}</>;
};

export const useData = () => {
  return useDataStore();
};

export default useDataStore;
