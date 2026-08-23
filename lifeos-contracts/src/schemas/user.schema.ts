import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profession: z.string().optional(),
  avatar: z.string().optional(),
  theme: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  profession: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  dailyStudyGoalHours: z.number().positive().optional(),
  dailyDSAGoal: z.number().positive().optional(),
  theme: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
});
