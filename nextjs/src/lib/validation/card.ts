import { z } from 'zod';

export const createCardSchema = z.object({
    title: z.string().min(1, 'Card title is required').max(255),
    description: z.string().max(1000).optional(),
    position: z.number().int().min(0).optional(),
    assigneeUserId: z.coerce.bigint().optional(),
});

export const updateCardSchema = z.object({
    title: z.string().min(1, 'Card title is required').max(255).optional(),
    description: z.string().max(1000).optional(),
    assigneeUserId: z.coerce.bigint().optional(),
});

export const moveCardSchema = z.object({
    listId: z.coerce.bigint(),
    position: z.number().int().min(0, 'Position must be 0 or greater'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;