import apiClient from "./apiClient";

export interface IProjectPayload {
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  status?: string;
  dueDate?: string;
  deadline?: string;
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export const projectService = {
  async getProjects(params?: { category?: string; status?: string; page?: number; limit?: number }) {
    const response: any = await apiClient.get("/projects", { params });
    return response.data;
  },

  async getProjectById(id: string) {
    const response: any = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(payload: IProjectPayload) {
    const response: any = await apiClient.post("/projects", payload);
    return response.data;
  },

  async updateProject(id: string, payload: Partial<IProjectPayload>) {
    const response: any = await apiClient.put(`/projects/${id}`, payload);
    return response.data;
  },

  async deleteProject(id: string) {
    const response: any = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
