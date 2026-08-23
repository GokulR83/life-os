import { z } from 'zod';

export const CreateFlashcardSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  front: z.string().optional(),
  back: z.string().optional(),
  pattern: z.string().optional(),
  category: z.string().optional(),
  deck: z.string().optional(),
  difficulty: z.string().optional(),
  codeSnippet: z.string().optional(),
  explanation: z.string().optional(),
});

export const GenerateAiFlashcardSchema = z.object({
  noteId: z.string().optional(),
  noteContent: z.string().optional(),
  topic: z.string().optional(),
  pattern: z.string().optional(),
});

export const UpdateFlashcardSchema = CreateFlashcardSchema.partial();
