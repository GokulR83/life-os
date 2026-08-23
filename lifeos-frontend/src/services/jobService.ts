import apiClient from './apiClient';

export interface IJobPayload {
  company: string;
  role?: string;
  position?: string;
  status?: string;
  location?: string;
  salary?: string;
  salaryRange?: string;
  logo?: string;
  contactPerson?: string;
  dateApplied?: string;
  appliedDate?: string;
  lastUpdated?: string;
  stale?: boolean;
  link?: string;
  notes?: string;
}

export const jobService = {
  /**
   * Fetch all job applications for current user with optional query filters
   */
  async getAllJobs(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const response: any = await apiClient.get('/jobs', { params });
    return response;
  },

  /**
   * Get single job application by ID
   */
  async getJobById(id: string) {
    const response: any = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Create a new job application entry
   */
  async createJob(payload: IJobPayload) {
    const response: any = await apiClient.post('/jobs', payload);
    return response.data;
  },

  /**
   * Update existing job application entry or status
   */
  async updateJob(id: string, payload: Partial<IJobPayload>) {
    const response: any = await apiClient.put(`/jobs/${id}`, payload);
    return response.data;
  },

  /**
   * Record follow-up email sent for stale application
   */
  async sendFollowUp(id: string) {
    const response: any = await apiClient.post(`/jobs/${id}/followup`);
    return response.data;
  },

  /**
   * Delete a job application entry
   */
  async deleteJob(id: string) {
    await apiClient.delete(`/jobs/${id}`);
    return true;
  },
};

export default jobService;
