import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { INote, CreateNoteDTO, UpdateNoteDTO } from '@lifeos/contracts';

export interface NoteState {
  notes: INote[];
  categories: string[];
  fetchNotesApi: (force?: boolean) => Promise<INote[]>;
  addNoteApi: (note: CreateNoteDTO) => Promise<INote>;
  updateNoteApi: (noteId: string, payload: UpdateNoteDTO) => Promise<INote | UpdateNoteDTO>;
  deleteNoteApi: (noteId: string) => Promise<void>;
  addNote: (note: CreateNoteDTO) => void;
  updateNote: (noteId: string, updatedFields: UpdateNoteDTO) => void;
  addCategory: (category: string) => void;
  renameCategoryApi: (oldName: string, newName: string) => Promise<void>;
  deleteCategoryApi: (categoryName: string) => Promise<void>;
}

const PRESET_CATEGORIES = ['DSA', 'System Design', 'Frontend', 'Career'];

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      categories: PRESET_CATEGORIES,

      fetchNotesApi: async (force = false) => {
        if (!force && get().notes && get().notes.length > 0) {
          return get().notes;
        }
        try {
          const notes = await apiSdk.notes.getAll();
          if (Array.isArray(notes)) {
            set({ notes });
            return notes;
          }
          return [];
        } catch (err) {
          console.warn('[NOTE_STORE] Fetch notes error:', err);
          return [];
        }
      },

      addNoteApi: async (note: CreateNoteDTO) => {
        try {
          const created = await apiSdk.notes.create(note);
          if (created) {
            set((state) => ({
              notes: [
                created,
                ...(state.notes || []).filter((n) => (n.id || n._id) !== (created.id || created._id)),
              ],
            }));
            return created;
          }
        } catch (err) {
          console.warn('[NOTE_STORE] Create note error:', err);
        }
        const fallbackId = `n_${Date.now()}`;
        const localNote: INote = {
          id: fallbackId,
          _id: fallbackId,
          title: note.title || 'Untitled Note',
          content: note.content || '',
          folder: note.folder || note.category || 'General',
          category: note.category || note.folder || 'General',
          tags: note.tags || ['General'],
          date: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: [localNote, ...(state.notes || [])],
        }));
        return localNote;
      },

      updateNoteApi: async (noteId: string, payload: UpdateNoteDTO) => {
        try {
          const updated = await apiSdk.notes.update(noteId, payload);
          if (updated) {
            set((state) => ({
              notes: (state.notes || []).map((n) =>
                n.id === noteId || n._id === noteId ? { ...n, ...updated } : n
              ),
            }));
            return updated;
          }
        } catch (err) {
          console.warn('[NOTE_STORE] Update note error:', err);
        }
        set((state) => ({
          notes: (state.notes || []).map((n) =>
            n.id === noteId || n._id === noteId ? { ...n, ...payload, updatedAt: new Date().toISOString() } : n
          ),
        }));
        return payload;
      },

      deleteNoteApi: async (noteId: string) => {
        set((state) => ({
          notes: (state.notes || []).filter((n) => n.id !== noteId && n._id !== noteId),
        }));
        try {
          await apiSdk.notes.delete(noteId);
        } catch (err) {
          console.warn('[NOTE_STORE] Delete note error:', err);
        }
      },

      addNote: (note: CreateNoteDTO) => get().addNoteApi(note),

      updateNote: (noteId: string, updatedFields: UpdateNoteDTO) => get().updateNoteApi(noteId, updatedFields),

      addCategory: (category: string) => {
        const trimmed = category.trim();
        if (!trimmed) return;
        set((state) => ({
          categories: Array.from(new Set([...(state.categories || PRESET_CATEGORIES), trimmed])),
        }));
      },

      renameCategoryApi: async (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        const state = get();
        const updatedCats = (state.categories || PRESET_CATEGORIES).map((c) => (c === oldName ? trimmed : c));
        set({ categories: Array.from(new Set(updatedCats)) });

        const targetNotes = (state.notes || []).filter((n) => (n.folder || n.category) === oldName);
        for (const note of targetNotes) {
          const nId = note.id || note._id;
          if (nId) {
            try {
              await apiSdk.notes.update(nId, { folder: trimmed, category: trimmed });
            } catch (e) {}
          }
        }

        set((s) => ({
          notes: (s.notes || []).map((n) =>
            (n.folder || n.category) === oldName ? { ...n, folder: trimmed, category: trimmed } : n
          ),
        }));
      },

      deleteCategoryApi: async (categoryName: string) => {
        const state = get();
        const fallbackCategory = 'DSA';
        const updatedCats = (state.categories || PRESET_CATEGORIES).filter((c) => c !== categoryName);
        set({ categories: updatedCats });

        const targetNotes = (state.notes || []).filter((n) => (n.folder || n.category) === categoryName);
        for (const note of targetNotes) {
          const nId = note.id || note._id;
          if (nId) {
            try {
              await apiSdk.notes.update(nId, { folder: fallbackCategory, category: fallbackCategory });
            } catch (e) {}
          }
        }

        set((s) => ({
          notes: (s.notes || []).map((n) =>
            (n.folder || n.category) === categoryName ? { ...n, folder: fallbackCategory, category: fallbackCategory } : n
          ),
        }));
      },
    }),
    {
      name: 'lifeos_note_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
