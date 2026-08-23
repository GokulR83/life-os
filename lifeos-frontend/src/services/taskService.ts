import apiClient from "./apiClient";

export interface ITaskPayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  deadline?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  completed?: boolean;
}

export const taskService = {
  async getAllTasks(params?: any) {
    const response: any = await apiClient.get("/tasks", { params, skipSuccessToast: true } as any);
    return response.data;
  },

  async getTaskById(id: string) {
    const response: any = await apiClient.get(`/tasks/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async createTask(payload: ITaskPayload) {
    const response: any = await apiClient.post("/tasks", payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async updateTask(id: string, payload: Partial<ITaskPayload>) {
    const response: any = await apiClient.put(`/tasks/${id}`, payload, { skipSuccessToast: true } as any);
    return response.data;
  },

  async deleteTask(id: string) {
    const response: any = await apiClient.delete(`/tasks/${id}`, { skipSuccessToast: true } as any);
    return response.data;
  },

  async bulkUpdateTasks(tasks: any[]) {
    const response: any = await apiClient.post("/tasks/bulk-update", { tasks }, { skipSuccessToast: true } as any);
    return response.data;
  },

  async getOverdueTasks() {
    const response: any = await apiClient.get("/tasks", { params: { isOverdue: 'true' }, skipSuccessToast: true } as any);
    return response.data;
  },

  async moveAllOverdueToToday() {
    const response: any = await apiClient.post("/tasks/move-overdue-today", {}, { skipSuccessToast: true } as any);
    return response.data;
  }
};

export default taskService;
