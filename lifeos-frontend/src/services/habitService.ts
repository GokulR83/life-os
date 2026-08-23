import apiClient from "./apiClient";

export interface IHabitPayload {
  name?: string;
  title?: string;
  category?: string;
  frequency?: string;
  streak?: number;
  completedToday?: boolean;
  targetDays?: number;
  completedDates?: string[];
}

export const habitService = {
  async getAllHabits() {
    const response: any = await apiClient.get("/habits", { skipSuccessToast: true } as any);
    return response.data;
  },

  async getHabitById(id: string) {
    const response: any = await apiClient.get(`/habits/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async createHabit(payload: IHabitPayload) {
    const response: any = await apiClient.post("/habits", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async toggleHabit(id: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    const response: any = await apiClient.patch(`/habits/${id}/toggle`, { date: today }, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateHabit(id: string, payload: Partial<IHabitPayload>) {
    const response: any = await apiClient.put(`/habits/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteHabit(id: string) {
    const response: any = await apiClient.delete(`/habits/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  }
};

export default habitService;
