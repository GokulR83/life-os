const STORAGE_KEY = 'lifeos_data_v2';

export const loadStoredData = <T>(fallbackData: T): T => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return fallbackData;
    const parsed = JSON.parse(serialized);
    return {
      user: parsed.user || (fallbackData as any)?.user,
      tasks: parsed.tasks || [],
      studySessions: parsed.studySessions || [],
      jobApplications: parsed.jobApplications || [],
      expenses: parsed.expenses || [],
      dsaPatterns: parsed.dsaPatterns || [],
      flashcards: parsed.flashcards || [],
      notes: parsed.notes || [],
      journalEntries: parsed.journalEntries || [],
      projects: parsed.projects || [],
      heatmap: parsed.heatmap || [],
      resumeVersions: parsed.resumeVersions || [],
      habits: parsed.habits || []
    } as T;
  } catch (err) {
    console.warn('Failed to load stored LifeOS data:', err);
    return fallbackData;
  }
};

export const saveStoredData = (data: any): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save LifeOS data to localStorage:', err);
  }
};

export const resetStoredData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset LifeOS storage:', err);
  }
};
