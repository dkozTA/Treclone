import { z } from 'zod'

export const createListSchema = z.object({
    title: z.string().min(1, 'List title is required').max(255),
    position: z.number().int().min(0),
})

export const updateListSchema = z.object({
    title: z.string().min(1, 'List title is required').max(255).optional(),
    position: z.number().int().min(0).optional(),
})

export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>