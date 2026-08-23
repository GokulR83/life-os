export type JobStage = 'Wishlist' | 'Applied' | 'Screening' | 'Technical Interview' | 'Behavioral' | 'Offer' | 'Rejected' | 'Interviewing' | string;

export interface IJobApplication {
  _id?: string;
  id?: string;
  userId?: string;
  company: string;
  role: string;
  position?: string;
  status: JobStage;
  stage?: JobStage;
  salary?: string;
  salaryRange?: string;
  location?: string;
  appliedDate?: string;
  dateApplied?: string;
  lastFollowUpDate?: string;
  lastUpdated?: string;
  daysInStage?: number;
  stale?: boolean;
  logo?: string;
  link?: string;
  contactPerson?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobDTO {
  company?: string;
  role?: string;
  position?: string;
  status?: JobStage;
  stage?: JobStage;
  salary?: string;
  salaryRange?: string;
  location?: string;
  appliedDate?: string;
  dateApplied?: string;
  lastFollowUpDate?: string;
  daysInStage?: number;
  contactPerson?: string;
  notes?: string;
}

export type UpdateJobDTO = Partial<CreateJobDTO>;
