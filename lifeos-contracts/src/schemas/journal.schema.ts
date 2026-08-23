import { z } from 'zod';

export const CreateJournalSchema = z.object({
  title: z.string().min(1, 'Journal title is required'),
  date: z.string().optional(),
  entry: z.string().optional(),
  content: z.string().optional(),
  reflection: z.string().optional(),
  highlight: z.string().optional(),
  mood: z.string().optional(),
  moodLabel: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  wins: z.array(z.string()).optional(),
  keyWins: z.array(z.string()).optional(),
  blockers: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  gratitude: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateJournalSchema = CreateJournalSchema.partial();
