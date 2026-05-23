import { z } from 'zod';

const optionalText = z.string().max(1000, 'Must be less than 1000 characters').optional().or(z.literal(''));

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Workspace name is required')
        .max(255, 'Workspace name must be less than 255 characters'),
    description: optionalText,
});

export const updateWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Workspace name is required')
        .max(255, 'Workspace name must be less than 255 characters')
        .optional(),
    description: optionalText,
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;