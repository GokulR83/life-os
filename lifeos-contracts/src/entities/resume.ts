export interface IResume {
  _id?: string;
  id?: string;
  userId?: string;
  title?: string;
  targetRole?: string;
  matchScore?: number;
  content?: string;
  notes?: string;
  filename?: string;
  fileUrl?: string;
  uploadDate?: string;
  lastUpdated?: string;
  usedInAppIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResumeDTO {
  title?: string;
  targetRole?: string;
  matchScore?: number;
  content?: string;
  notes?: string;
  filename?: string;
  fileUrl?: string;
  uploadDate?: string;
  usedInAppIds?: string[];
}

export type UpdateResumeDTO = Partial<CreateResumeDTO>;
