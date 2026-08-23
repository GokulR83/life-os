import { z } from 'zod';

export const CreateHabitSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  frequency: z.string().optional().default('daily'),
  targetDays: z.number().positive().optional(),
  completedDates: z.array(z.string()).optional(),
  color: z.string().optional(),
});

export const UpdateHabitSchema = CreateHabitSchema.partial();
