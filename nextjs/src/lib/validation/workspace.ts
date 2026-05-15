import { z } from 'zod'

// Create Workspace Schema
export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Workspace name is required')
        .max(255, 'Workspace name must be less than 255 characters'),
    description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional()
        .or(z.literal('')),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>

// Update Workspace Schema
export const updateWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Workspace name is required')
        .max(255, 'Workspace name must be less than 255 characters')
        .optional(),
    description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional()
        .or(z.literal('')),
})

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>

// Workspace Settings Schema
export const updateWorkspaceSettingsSchema = z.object({
    visibility: z
        .enum(['private', 'team', 'public'])
        .optional(),
    notifications: z
        .object({
            dailySummary: z.boolean().optional(),
            mentionAlerts: z.boolean().optional(),
        })
        .optional(),
})

export type UpdateWorkspaceSettingsInput = z.infer<
    typeof updateWorkspaceSettingsSchema
>