import { z } from 'zod';

export const CreateStudySessionSchema = z.object({
  subject: z.string().min(1, 'Study subject is required'),
  topic: z.string().optional(),
  type: z.string().optional(),
  mood: z.string().optional(),
  durationHours: z.number().positive().optional().default(1),
  duration: z.number().positive().optional(),
  durationMinutes: z.number().positive().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export const UpdateStudySessionSchema = CreateStudySessionSchema.partial();
