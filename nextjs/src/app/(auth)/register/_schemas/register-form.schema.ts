import { z } from 'zod';

export const registerFormSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.email({ message: 'Invalid email address' }).nonempty('Email is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;