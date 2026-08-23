import apiClient from "./apiClient";

export interface IJournalPayload {
  title: string;
  entry?: string;
  content?: string;
  date?: string;
  mood?: string;
  moodLabel?: string;
  wins?: string[];
  blockers?: string[];
  highlight?: string;
  reflection?: string;
  gratitude?: string;
  energyLevel?: number;
}

export const journalService = {
  async getAllJournals(params?: { date?: string; page?: number; limit?: number }) {
    const response: any = await apiClient.get("/journals", { params });
    return response.data;
  },

  async getJournalById(id: string) {
    const response: any = await apiClient.get(`/journals/${id}`);
    return response.data;
  },

  async createOrUpdateJournal(payload: IJournalPayload) {
    const response: any = await apiClient.post("/journals", payload);
    return response.data;
  },

  async updateJournal(id: string, payload: Partial<IJournalPayload>) {
    const response: any = await apiClient.put(`/journals/${id}`, payload);
    return response.data;
  },

  async deleteJournal(id: string) {
    const response: any = await apiClient.delete(`/journals/${id}`);
    return response.data;
  },
};

export default journalService;
