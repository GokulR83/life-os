import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiSdk } from '../services/apiSdk';
import { IJobApplication, CreateJobDTO, UpdateJobDTO } from '@lifeos/contracts';

export interface JobState {
  jobApplications: IJobApplication[];
  fetchJobsApi: (force?: boolean) => Promise<IJobApplication[]>;
  fetchJobApplicationsApi: (force?: boolean) => Promise<IJobApplication[]>;
  addJobApi: (job: CreateJobDTO) => Promise<IJobApplication>;
  updateJobApi: (jobId: string, payload: UpdateJobDTO) => Promise<IJobApplication | UpdateJobDTO>;
  deleteJobApi: (jobId: string) => Promise<void>;
  updateJobStatusApi: (jobId: string, newStatus: string) => Promise<any>;
  addJobApplicationApi: (job: CreateJobDTO) => Promise<IJobApplication>;
  deleteJobApplicationApi: (jobId: string) => Promise<void>;
  sendJobFollowUpApi: (jobId: string) => Promise<any>;
  addJobApplication: (app: CreateJobDTO) => void;
  updateJobStatus: (appId: string, newStatus: string) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobApplications: [],

      fetchJobApplicationsApi: (force?: boolean) => get().fetchJobsApi(force),

      fetchJobsApi: async (force = false) => {
        try {
          const jobs = await apiSdk.jobs.getAll();
          if (Array.isArray(jobs)) {
            const normalized = jobs.map((j) => ({
              ...j,
              id: j._id || j.id,
              company: j.company || 'Company',
              role: j.role || j.position || 'Engineer',
              position: j.position || j.role || 'Engineer',
              status: j.status || j.stage || 'Wishlist',
              stage: j.stage || j.status || 'Wishlist',
            }));
            set({ jobApplications: normalized });
            return normalized;
          }
          return get().jobApplications || [];
        } catch (err) {
          console.warn('[JOB_STORE] Fetch jobs error:', err);
          return get().jobApplications || [];
        }
      },

      addJobApi: async (job: CreateJobDTO) => {
        try {
          const created = await apiSdk.jobs.create(job);
          if (created) {
            const formatted = { ...created, id: created._id || created.id };
            set((state) => ({
              jobApplications: [
                formatted,
                ...(state.jobApplications || []).filter((j) => (j.id || j._id) !== formatted.id),
              ],
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[JOB_STORE] Create job error:', err);
        }
        const fallbackId = `j_${Date.now()}`;
        const localJob: IJobApplication = {
          id: fallbackId,
          _id: fallbackId,
          company: job.company || 'Tech Company',
          role: job.role || job.position || 'Software Engineer',
          position: job.position || job.role || 'Software Engineer',
          status: job.status || 'Applied',
          stage: job.stage || job.status || 'Applied',
          salary: job.salary || job.salaryRange || '$140k - $170k',
          salaryRange: job.salaryRange || job.salary || '$140k - $170k',
          location: job.location || 'Remote',
          appliedDate: job.appliedDate || new Date().toISOString().split('T')[0],
          notes: job.notes || '',
        };
        set((state) => ({
          jobApplications: [localJob, ...(state.jobApplications || [])],
        }));
        return localJob;
      },

      updateJobApi: async (jobId: string, payload: UpdateJobDTO) => {
        set((state) => ({
          jobApplications: (state.jobApplications || []).map((j) =>
            j.id === jobId || j._id === jobId ? { ...j, ...payload } : j
          ),
        }));

        const isTemporaryId = !jobId || jobId.startsWith('j_') || jobId.length !== 24;

        if (isTemporaryId) {
          const currentJob = (get().jobApplications || []).find((j) => j.id === jobId || j._id === jobId);
          if (currentJob) {
            try {
              const body: CreateJobDTO = {
                company: currentJob.company || 'Company',
                role: currentJob.role || currentJob.position || 'Software Engineer',
                position: currentJob.position || currentJob.role || 'Software Engineer',
                status: payload.status || currentJob.status || 'Wishlist',
                stage: payload.stage || payload.status || currentJob.stage || 'Wishlist',
                salary: currentJob.salary || currentJob.salaryRange || '$140k - $170k',
                salaryRange: currentJob.salaryRange || currentJob.salary || '$140k - $170k',
                location: currentJob.location || 'Remote',
                ...payload,
              };
              const created = await apiSdk.jobs.create(body);
              if (created) {
                const formatted = { ...created, id: created._id || created.id };
                set((state) => ({
                  jobApplications: (state.jobApplications || []).map((j) =>
                    j.id === jobId || j._id === jobId ? formatted : j
                  ),
                }));
                return formatted;
              }
            } catch (err) {
              console.warn('[JOB_STORE] Create job for temporary ID error:', err);
            }
          }
          return payload;
        }

        try {
          const updated = await apiSdk.jobs.update(jobId, payload);
          if (updated) {
            const formatted = { ...updated, id: updated._id || updated.id };
            set((state) => ({
              jobApplications: (state.jobApplications || []).map((j) =>
                j.id === jobId || j._id === jobId ? { ...j, ...formatted } : j
              ),
            }));
            return formatted;
          }
        } catch (err) {
          console.warn('[JOB_STORE] Update job error:', err);
        }
        return payload;
      },

      deleteJobApi: async (jobId: string) => {
        set((state) => ({
          jobApplications: (state.jobApplications || []).filter((j) => j.id !== jobId && j._id !== jobId),
        }));
        if (!jobId || jobId.startsWith('j_') || jobId.length !== 24) return;
        try {
          await apiSdk.jobs.delete(jobId);
        } catch (err) {
          console.warn('[JOB_STORE] Delete job error:', err);
        }
      },

      updateJobStatusApi: async (jobId: string, newStatus: string) => {
        return get().updateJobApi(jobId, { status: newStatus, stage: newStatus });
      },

      addJobApplicationApi: async (job: CreateJobDTO) => {
        return get().addJobApi(job);
      },

      deleteJobApplicationApi: async (jobId: string) => {
        return get().deleteJobApi(jobId);
      },

      sendJobFollowUpApi: async (jobId: string) => {
        const today = new Date().toISOString().split('T')[0];
        return get().updateJobApi(jobId, { lastFollowUpDate: today, daysInStage: 0 });
      },

      addJobApplication: (app: CreateJobDTO) => get().addJobApi(app),

      updateJobStatus: (appId: string, newStatus: string) => get().updateJobStatusApi(appId, newStatus),
    }),
    {
      name: 'lifeos_job_storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
