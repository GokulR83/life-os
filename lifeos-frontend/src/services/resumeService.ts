import apiClient from './apiClient';

export interface IResumePayload {
  filename: string;
  targetRole: string;
  uploadDate?: string;
  notes?: string;
  fileUrl?: string;
  usedInAppIds?: string[];
}

export const resumeService = {
  /**
   * Fetch all resume draft versions for current user
   */
  async getAllResumes() {
    const response: any = await apiClient.get('/resumes');
    return response.data;
  },

  /**
   * Get single resume version by ID
   */
  async getResumeById(id: string) {
    const response: any = await apiClient.get(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Create a new resume version entry
   */
  async createResume(payload: IResumePayload) {
    const response: any = await apiClient.post('/resumes', payload);
    return response.data;
  },

  /**
   * Update existing resume version entry
   */
  async updateResume(id: string, payload: Partial<IResumePayload>) {
    const response: any = await apiClient.put(`/resumes/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a resume version entry
   */
  async deleteResume(id: string) {
    await apiClient.delete(`/resumes/${id}`);
    return true;
  },
};

export default resumeService;
