import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IDsaProblem, CreateDsaDTO, UpdateDsaDTO, IFlashcard, CreateFlashcardDTO, UpdateFlashcardDTO, GenerateAiFlashcardDTO } from '@lifeos/contracts';

export interface DSAState {
  dsaPatterns: IDsaProblem[];
  flashcards: IFlashcard[];
  heatmap: any[];
  fetchHeatmapApi: () => Promise<any[]>;
  fetchFlashcardsApi: (force?: boolean) => Promise<IFlashcard[]>;
  fetchDsaPatternsApi: (force?: boolean) => Promise<IDsaProblem[]>;
  addDsaPatternApi: (payload: CreateDsaDTO) => Promise<IDsaProblem>;
  updateDsaPatternApi: (id: string, payload: UpdateDsaDTO) => Promise<void>;
  deleteDsaPatternApi: (id: string) => Promise<void>;
  addFlashcardApi: (newCard: CreateFlashcardDTO) => Promise<IFlashcard>;
  generateAiFlashcardApi: (payload: GenerateAiFlashcardDTO) => Promise<IFlashcard | IFlashcard[]>;
  updateFlashcardApi: (cardId: string, payload: UpdateFlashcardDTO) => Promise<void>;
  toggleFlashcardRevisionApi: (cardId: string) => Promise<void>;
  addFlashcard: (newCard: CreateFlashcardDTO) => IFlashcard;
  toggleFlashcardRevision: (cardId: string) => void;
  updateFlashcardSM2: (cardId: string, sm2Data: any) => void;
}

export const useDSAStore = create<DSAState>()(
  persist(
    (set, get) => ({
      dsaPatterns: [],
      flashcards: [],
      heatmap: [],

      fetchHeatmapApi: async () => {
        try {
          const data = await apiSdk.dashboard.getHeatmap();
          if (data?.activities && Array.isArray(data.activities) && data.activities.length > 0) {
            set({ heatmap: data.activities });
            return data.activities;
          }
        } catch (err) {
          console.warn('[DSA_STORE] Fetch heatmap error:', err);
        }
        return get().heatmap || [];
      },

      fetchFlashcardsApi: async (force = false) => {
        try {
          const cards = await apiSdk.flashcards.getAll();
          if (Array.isArray(cards)) {
            const normalized = cards.map((c) => ({
              ...c,
              id: c._id || c.id,
              question: c.question || c.front || 'Question',
              answer: c.answer || c.back || 'Answer',
              pattern: c.pattern || c.category || c.deck || 'Two Pointers',
              needsRevision: c.needsRevision !== undefined ? c.needsRevision : true,
            }));
            set({ flashcards: normalized });
            return normalized;
          }
          return get().flashcards || [];
        } catch (err) {
          console.warn('[DSA_STORE] Fetch flashcards error:', err);
          return get().flashcards || [];
        }
      },

      fetchDsaPatternsApi: async (force = false) => {
        try {
          const items = await apiSdk.dsa.getAll();
          if (Array.isArray(items)) {
            const normalized = items.map((p) => ({
              ...p,
              id: p._id || p.id,
              name: p.name || p.title || p.pattern || 'DSA Pattern',
              pattern: p.pattern || p.name || 'Two Pointers',
              solvedProblems: p.solvedProblems ?? 0,
              totalProblems: p.totalProblems ?? 10,
              difficulty: p.difficulty || 'Medium',
            }));
            set({ dsaPatterns: normalized });
            return normalized;
          }
          return get().dsaPatterns || [];
        } catch (err) {
          console.warn('[DSA_STORE] Fetch DSA patterns error:', err);
          return get().dsaPatterns || [];
        }
      },

      addDsaPatternApi: async (payload: CreateDsaDTO) => {
        const name = payload.name || payload.title || payload.pattern || 'DSA Pattern';
        const body: CreateDsaDTO = {
          name,
          title: name,
          pattern: payload.pattern || name,
          description: payload.description || '',
          solvedProblems: payload.solvedProblems ?? 0,
          totalProblems: payload.totalProblems ?? 10,
          difficulty: payload.difficulty || 'Medium',
          status: payload.status || 'Todo',
          icon: payload.icon || 'BrainCircuit',
        };
        try {
          const created = await apiSdk.dsa.create(body);
          if (created) {
            const formatted: IDsaProblem = {
              ...created,
              id: created._id || created.id,
              name: created.name || name,
              pattern: created.pattern || name,
            };
            set((state) => ({
              dsaPatterns: [formatted, ...(state.dsaPatterns || []).filter((p) => (p.id || p._id) !== formatted.id)],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[DSA_STORE] Add DSA pattern error:', err);
        }
        const fallbackId = `p_${Date.now()}`;
        const localObj: IDsaProblem = { id: fallbackId, _id: fallbackId, ...body };
        set((state) => ({ dsaPatterns: [localObj, ...(state.dsaPatterns || [])] }));
        return localObj;
      },

      updateDsaPatternApi: async (id: string, payload: UpdateDsaDTO) => {
        const today = new Date().toISOString().split('T')[0];
        const updatePayload = { ...payload, lastRevisedDate: today };

        set((state) => ({
          dsaPatterns: (state.dsaPatterns || []).map((p) =>
            p.id === id || p._id === id ? { ...p, ...updatePayload } : p
          ),
        }));

        const isTemporaryId = !id || id.startsWith('p_') || id.length !== 24;

        if (isTemporaryId) {
          const currentPattern = (get().dsaPatterns || []).find((p) => p.id === id || p._id === id);
          if (currentPattern) {
            try {
              const body: CreateDsaDTO = {
                name: currentPattern.name || currentPattern.title || currentPattern.pattern || 'DSA Pattern',
                title: currentPattern.name || currentPattern.title || currentPattern.pattern || 'DSA Pattern',
                pattern: currentPattern.pattern || currentPattern.name || 'DSA Pattern',
                description: currentPattern.description || '',
                solvedProblems: currentPattern.solvedProblems ?? 0,
                totalProblems: currentPattern.totalProblems ?? 10,
                difficulty: currentPattern.difficulty || 'Medium',
                status: currentPattern.status || 'Todo',
                icon: currentPattern.icon || 'BrainCircuit',
                ...updatePayload,
              };
              const created = await apiSdk.dsa.create(body);
              if (created) {
                const formatted: IDsaProblem = {
                  ...created,
                  id: created._id || created.id,
                  name: created.name || body.name,
                  pattern: created.pattern || body.pattern,
                };
                set((state) => ({
                  dsaPatterns: (state.dsaPatterns || []).map((p) =>
                    p.id === id || p._id === id ? formatted : p
                  ),
                }));
              }
            } catch (err) {
              console.warn('[DSA_STORE] Create DSA pattern for temporary ID error:', err);
            }
          }
          return;
        }

        try {
          await apiSdk.dsa.update(id, updatePayload);
        } catch (err) {
          console.warn('[DSA_STORE] Update DSA pattern error:', err);
        }
      },

      deleteDsaPatternApi: async (id: string) => {
        set((state) => ({
          dsaPatterns: (state.dsaPatterns || []).filter((p) => p.id !== id && p._id !== id),
        }));
        if (!id || id.startsWith('p_') || id.length !== 24) return;
        try {
          await apiSdk.dsa.delete(id);
        } catch (err) {
          console.warn('[DSA_STORE] Delete DSA pattern error:', err);
        }
      },

      generateAiFlashcardApi: async (payload: GenerateAiFlashcardDTO) => {
        try {
          const created = await apiSdk.flashcards.generateAi(payload);
          const item = Array.isArray(created) ? created[0] : created;
          if (item) {
            const formatted: IFlashcard = {
              ...item,
              id: item._id || item.id,
              question: item.question || item.front,
              answer: item.answer || item.back,
              pattern: item.pattern || payload.pattern || 'Two Pointers',
              needsRevision: true,
              isAiGenerated: true,
            };
            set((state) => ({
              flashcards: [
                formatted,
                ...(state.flashcards || []).filter((f) => f.id !== formatted.id && f._id !== formatted.id),
              ],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[DSA_STORE] Generate AI flashcard error:', err);
        }

        return get().addFlashcard({
          question: `AI Flashcard: ${payload.topic || 'DSA Revision Concept'}`,
          answer: `Optimal algorithm approach and pattern invariants for ${payload.topic || 'DSA Concept'}.`,
          pattern: payload.pattern || 'Two Pointers',
        });
      },

      addFlashcardApi: async (newCard: CreateFlashcardDTO) => {
        const payload: CreateFlashcardDTO = {
          question: newCard.question || newCard.front || 'Concept Question',
          front: newCard.question || newCard.front || 'Concept Question',
          answer: newCard.answer || newCard.back || 'Concept Answer',
          back: newCard.answer || newCard.back || 'Concept Answer',
          category: newCard.category || newCard.pattern || 'DSA',
          deck: newCard.deck || newCard.category || 'DSA',
          pattern: newCard.pattern || newCard.category || 'Two Pointers',
          difficulty: newCard.difficulty || 'Medium',
        };

        try {
          const created = await apiSdk.flashcards.create(payload);
          if (created) {
            const formatted: IFlashcard = {
              ...created,
              id: created._id || created.id,
              question: created.question || created.front,
              answer: created.answer || created.back,
              pattern: created.pattern || created.category || 'Two Pointers',
              needsRevision: true,
            };
            set((state) => ({
              flashcards: [
                formatted,
                ...(state.flashcards || []).filter((f) => f.id !== formatted.id && f._id !== formatted.id),
              ],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[DSA_STORE] Create flashcard error:', err);
        }

        return get().addFlashcard(payload);
      },

      updateFlashcardApi: async (cardId: string, payload: UpdateFlashcardDTO) => {
        set((state) => ({
          flashcards: (state.flashcards || []).map((f) =>
            f.id === cardId || f._id === cardId
              ? { ...f, ...payload, question: payload.question || f.question, answer: payload.answer || f.answer }
              : f
          ),
        }));
        try {
          await apiSdk.flashcards.update(cardId, payload);
        } catch (err) {
          console.warn('[DSA_STORE] Update flashcard error:', err);
        }
      },

      toggleFlashcardRevisionApi: async (cardId: string) => {
        get().toggleFlashcardRevision(cardId);
        try {
          await apiSdk.flashcards.update(cardId, { needsRevision: false });
        } catch (err) {
          console.warn('[DSA_STORE] Toggle flashcard error:', err);
        }
      },

      addFlashcard: (newCard: CreateFlashcardDTO) => {
        const fallbackId = `f_${Date.now()}`;
        const cardObj: IFlashcard = {
          id: fallbackId,
          _id: fallbackId,
          question: newCard.question || newCard.front || 'Concept Question',
          answer: newCard.answer || newCard.back || 'Concept Answer',
          pattern: newCard.pattern || newCard.category || 'Two Pointers',
          category: newCard.category || newCard.pattern || 'DSA',
          needsRevision: true,
          lastReviewed: new Date().toISOString().split('T')[0],
          difficulty: newCard.difficulty || 'Medium',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          flashcards: [cardObj, ...(state.flashcards || [])],
        }));
        return cardObj;
      },

      toggleFlashcardRevision: (cardId: string) =>
        set((state) => ({
          flashcards: (state.flashcards || []).map((f) =>
            f.id === cardId || f._id === cardId ? { ...f, needsRevision: !f.needsRevision, lastReviewed: new Date().toISOString().split('T')[0] } : f
          ),
        })),

      updateFlashcardSM2: async (cardId: string, sm2Data: any) => {
        const lastReviewed = new Date().toISOString().split('T')[0];
        const payload = { ...sm2Data, lastReviewed };
        set((state) => ({
          flashcards: (state.flashcards || []).map((f) =>
            f.id === cardId || f._id === cardId ? { ...f, ...payload } : f
          ),
        }));
        try {
          await apiSdk.flashcards.update(cardId, payload);
        } catch (err) {
          console.warn('[DSA_STORE] Update flashcard SM2 error:', err);
        }
      },
    }),
    {
      name: 'lifeos_dsa_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
