import { z } from 'zod';

export const CreateDsaSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  pattern: z.string().optional(),
  description: z.string().optional(),
  solvedProblems: z.number().nonnegative().optional(),
  totalProblems: z.number().positive().optional(),
  difficulty: z.string().optional(),
  status: z.string().optional(),
  icon: z.string().optional(),
  lastRevisedDate: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateDsaSchema = CreateDsaSchema.partial();
