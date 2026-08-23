import apiClient from "./apiClient";

export interface IDsaPayload {
  name?: string;
  title?: string;
  pattern?: string;
  description?: string;
  solvedProblems?: number;
  totalProblems?: number;
  difficulty?: string;
  status?: string;
  notes?: string;
}

export const dsaService = {
  async getAllDsa(params?: { pattern?: string; difficulty?: string }) {
    const response: any = await apiClient.get("/dsa", { params, skipSuccessToast: true } as any);
    return response.data;
  },

  async getDsaById(id: string) {
    const response: any = await apiClient.get(`/dsa/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async createDsa(payload: IDsaPayload) {
    const response: any = await apiClient.post("/dsa", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateDsa(id: string, payload: Partial<IDsaPayload>) {
    const response: any = await apiClient.put(`/dsa/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteDsa(id: string) {
    const response: any = await apiClient.delete(`/dsa/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  }
};

export default dsaService;
