import { z } from 'zod';

export const updateWorkspaceSettingsSchema = z.object({
    visibility: z.enum(['private', 'team', 'public']).optional(),
    notifications: z
        .object({
            dailySummary: z.boolean().optional(),
            mentionAlerts: z.boolean().optional(),
        })
        .optional(),
});

export type UpdateWorkspaceSettingsInput = z.infer<typeof updateWorkspaceSettingsSchema>;