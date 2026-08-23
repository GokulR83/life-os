import apiClient from "./apiClient";

export interface IFlashcardPayload {
  noteId?: string;
  question?: string;
  front?: string;
  answer?: string;
  back?: string;
  category?: string;
  deck?: string;
  pattern?: string;
  difficulty?: string;
  needsRevision?: boolean;
}

export const flashcardService = {
  async getAllFlashcards(params?: { category?: string; deck?: string }) {
    const response: any = await apiClient.get("/flashcards", { params, skipSuccessToast: true } as any);
    return response.data;
  },

  async getFlashcardById(id: string) {
    const response: any = await apiClient.get(`/flashcards/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async createFlashcard(payload: IFlashcardPayload) {
    const response: any = await apiClient.post("/flashcards", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async generateAiFlashcard(payload: { noteId?: string; noteContent?: string; topic?: string; pattern?: string }) {
    const response: any = await apiClient.post("/flashcards/generate-ai", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async toggleFlashcardRevision(id: string) {
    const response: any = await apiClient.patch(`/flashcards/${id}/toggle`, {}, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateFlashcard(id: string, payload: Partial<IFlashcardPayload>) {
    const response: any = await apiClient.put(`/flashcards/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteFlashcard(id: string) {
    const response: any = await apiClient.delete(`/flashcards/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },
};

export default flashcardService;
