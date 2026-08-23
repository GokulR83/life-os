export interface IStudySession {
  _id?: string;
  id?: string;
  userId?: string;
  taskId?: string;
  subject: string;
  topic?: string;
  type?: string;
  mood?: string;
  durationHours: number;
  duration?: number;
  durationMinutes?: number;
  notes?: string;
  date: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudySessionDTO {
  subject: string;
  taskId?: string;
  topic?: string;
  type?: string;
  mood?: string;
  durationHours?: number;
  duration?: number;
  durationMinutes?: number;
  notes?: string;
  date?: string;
}

export type UpdateStudySessionDTO = Partial<CreateStudySessionDTO>;
