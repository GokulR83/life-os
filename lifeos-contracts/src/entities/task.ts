export type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Blocked' | 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'low' | 'medium' | 'high';

export interface ITask {
  _id?: string;
  id?: string;
  userId?: string;
  projectId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  dueDate?: string;
  deadline?: string;
  estimatedMinutes?: number;
  completed?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  deadline?: string;
  estimatedMinutes?: number;
  completed?: boolean;
  projectId?: string;
}

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface BulkUpdateTasksDTO {
  taskIds: string[];
  updatedFields: UpdateTaskDTO;
}

export interface TaskQueryParams {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  isOverdue?: string | boolean;
  page?: number;
  limit?: number;
}
