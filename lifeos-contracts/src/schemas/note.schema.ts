import { z } from 'zod';

export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(200),
  content: z.string().optional(),
  folder: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const UpdateNoteSchema = CreateNoteSchema.partial();
