import apiClient from "./apiClient";

export interface IStudySessionPayload {
  subject: string;
  durationHours: number;
  notes?: string;
  date?: string;
}

export const studyService = {
  async getAllStudySessions() {
    const response: any = await apiClient.get("/study", { skipSuccessToast: true } as any);
    return response.data;
  },

  async createStudySession(payload: IStudySessionPayload) {
    const response: any = await apiClient.post("/study", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateStudySession(id: string, payload: Partial<IStudySessionPayload>) {
    const response: any = await apiClient.put(`/study/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteStudySession(id: string) {
    const response: any = await apiClient.delete(`/study/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  }
};

export default studyService;
