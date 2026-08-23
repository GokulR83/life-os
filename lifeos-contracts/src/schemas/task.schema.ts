import { z } from 'zod';

export const TaskStatusSchema = z.enum(['Todo', 'In Progress', 'Done', 'Blocked', 'todo', 'in_progress', 'completed']);
export const TaskPrioritySchema = z.enum(['Low', 'Medium', 'High', 'low', 'medium', 'high']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  status: TaskStatusSchema.optional().default('Todo'),
  priority: TaskPrioritySchema.optional().default('Medium'),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  deadline: z.string().optional(),
  estimatedMinutes: z.number().nonnegative().optional(),
  completed: z.boolean().optional(),
  projectId: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const BulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)),
  updatedFields: UpdateTaskSchema,
});
