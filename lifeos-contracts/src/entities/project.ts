export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | string;
export type ProjectCategory = 'FRONTEND' | 'BACKEND' | 'FULLSTACK' | 'AI' | string;

export interface IProject {
  _id?: string;
  id?: string;
  userId?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  progress?: number;
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
  dueDate?: string;
  deadline?: string;
  tasksCount?: number;
  completedTasksCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDTO {
  title?: string;
  name?: string;
  description?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  progress?: number;
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
  dueDate?: string;
  deadline?: string;
}

export type UpdateProjectDTO = Partial<CreateProjectDTO>;
