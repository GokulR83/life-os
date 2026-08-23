import { z } from 'zod';

export const JobStageSchema = z.enum([
  'Wishlist',
  'Applied',
  'OA',
  'Interview',
  'Screening',
  'Technical Interview',
  'Behavioral',
  'Offer',
  'Rejected',
  'Interviewing',
]);

export const CreateJobSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Job role is required'),
  position: z.string().optional(),
  status: JobStageSchema.optional().default('Applied'),
  stage: JobStageSchema.optional(),
  salary: z.string().optional(),
  salaryRange: z.string().optional(),
  location: z.string().optional(),
  appliedDate: z.string().optional(),
  dateApplied: z.string().optional(),
  link: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial();
