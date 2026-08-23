import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['Planning', 'In Progress', 'Completed', 'On Hold']);

export const CreateProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').optional(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  category: z.string().optional().default('FULLSTACK'),
  status: ProjectStatusSchema.optional().default('Planning'),
  progress: z.number().min(0).max(100).optional(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  demoUrl: z.string().url('Invalid Demo URL').optional().or(z.literal('')),
  dueDate: z.string().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();
