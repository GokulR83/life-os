import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IJournalEntry, CreateJournalDTO, UpdateJournalDTO } from '@lifeos/contracts';

export interface JournalState {
  journalEntries: IJournalEntry[];
  fetchJournalsApi: (force?: boolean) => Promise<IJournalEntry[]>;
  addJournalEntryApi: (entry: CreateJournalDTO) => Promise<IJournalEntry>;
  updateJournalEntryApi: (journalId: string, payload: UpdateJournalDTO) => Promise<IJournalEntry | UpdateJournalDTO>;
  deleteJournalEntryApi: (journalId: string) => Promise<void>;
  saveJournalEntry: (entry: CreateJournalDTO) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      journalEntries: [],

      fetchJournalsApi: async (force = false) => {
        if (!force && get().journalEntries && get().journalEntries.length > 0) {
          return get().journalEntries;
        }
        try {
          const journals = await apiSdk.journals.getAll();
          if (Array.isArray(journals)) {
            set({ journalEntries: journals });
            return journals;
          }
          return [];
        } catch (err) {
          console.warn('[JOURNAL_STORE] Fetch journals error:', err);
          return [];
        }
      },

      addJournalEntryApi: async (entry: CreateJournalDTO) => {
        try {
          const created = await apiSdk.journals.create(entry);
          if (created) {
            set((state) => ({
              journalEntries: [
                created,
                ...(state.journalEntries || []).filter((j) => j.id !== created.id && j._id !== created._id && j.date !== created.date),
              ],
            }));
            return created;
          }
        } catch (err) {
          console.warn('[JOURNAL_STORE] Create journal error:', err);
        }
        const fallbackId = `j_${Date.now()}`;
        const localEntry: IJournalEntry = {
          id: fallbackId,
          _id: fallbackId,
          date: entry.date || new Date().toISOString().split('T')[0],
          title: entry.title || 'Untitled Entry',
          entry: entry.entry || entry.content || '',
          content: entry.content || entry.entry || '',
          mood: entry.mood || 'productive',
          moodLabel: entry.moodLabel || 'Productive & Focused',
          wins: entry.wins || [],
          blockers: entry.blockers || [],
        };
        set((state) => ({
          journalEntries: [
            localEntry,
            ...(state.journalEntries || []).filter((j) => j.date !== localEntry.date),
          ],
        }));
        return localEntry;
      },

      updateJournalEntryApi: async (journalId: string, payload: UpdateJournalDTO) => {
        try {
          const updated = await apiSdk.journals.update(journalId, payload);
          if (updated) {
            set((state) => ({
              journalEntries: (state.journalEntries || []).map((j) =>
                j.id === journalId || j._id === journalId ? { ...j, ...updated } : j
              ),
            }));
            return updated;
          }
        } catch (err) {
          console.warn('[JOURNAL_STORE] Update journal error:', err);
        }
        set((state) => ({
          journalEntries: (state.journalEntries || []).map((j) =>
            j.id === journalId || j._id === journalId ? { ...j, ...payload } : j
          ),
        }));
        return payload;
      },

      deleteJournalEntryApi: async (journalId: string) => {
        set((state) => ({
          journalEntries: (state.journalEntries || []).filter((j) => j.id !== journalId && j._id !== journalId),
        }));
        try {
          await apiSdk.journals.delete(journalId);
        } catch (err) {
          console.warn('[JOURNAL_STORE] Delete journal error:', err);
        }
      },

      saveJournalEntry: (entry: CreateJournalDTO) => get().addJournalEntryApi(entry),
    }),
    {
      name: 'lifeos_journal_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
