import apiClient from "./apiClient";

export interface INotePayload {
  title: string;
  content?: string;
  folder?: string;
  category?: string;
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
  date?: string;
}

export const noteService = {
  async getAllNotes(params?: { folder?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const response: any = await apiClient.get("/notes", { params, skipSuccessToast: true } as any);
    return response.data;
  },

  async getNoteById(id: string) {
    const response: any = await apiClient.get(`/notes/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async createNote(payload: INotePayload) {
    const response: any = await apiClient.post("/notes", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateNote(id: string, payload: Partial<INotePayload>) {
    const response: any = await apiClient.put(`/notes/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteNote(id: string) {
    const response: any = await apiClient.delete(`/notes/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },
};

export default noteService;
