import { z } from 'zod';

export const loginFormSchema = z.object({
    email: z.email({ message: 'Invalid email address' }).nonempty('Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;