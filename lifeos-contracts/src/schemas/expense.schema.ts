import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().positive('Expense amount must be positive'),
  category: z.string().optional().default('General'),
  type: z.enum(['income', 'expense']).optional().default('expense'),
  tags: z.array(z.string()).optional(),
  date: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();
