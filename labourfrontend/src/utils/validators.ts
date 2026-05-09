import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  location: z.string().min(2, 'Location is required'),
  role: z.enum(['worker', 'employer'], { error: 'Please select a role' }),
  skills: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.role === 'worker' && (!data.skills || data.skills.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Please select your profession",
  path: ["skills"],
});

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  salary_period: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  location: z.string().min(2, 'Location is required'),
  requirements: z.array(z.string()).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
  // Worker fields
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  // Employer fields
  company_name: z.string().optional(),
  description: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CreateJobForm = z.infer<typeof createJobSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
