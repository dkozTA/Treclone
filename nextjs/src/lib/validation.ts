import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Board Schemas
export const createBoardSchema = z.object({
  title: z.string().min(1, 'Board title is required').max(255),
  description: z.string().max(500).optional(),
})

export const updateBoardSchema = z.object({
  title: z.string().min(1, 'Board title is required').max(255).optional(),
  description: z.string().max(500).optional(),
})

// List Schemas
export const createListSchema = z.object({
  title: z.string().min(1, 'List title is required').max(255),
  position: z.number().int().min(0),
})

export const updateListSchema = z.object({
  title: z.string().min(1, 'List title is required').max(255).optional(),
  position: z.number().int().min(0).optional(),
})

// Card Schemas
export const createCardSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(255),
  description: z.string().max(1000).optional(),
  position: z.number().int().min(0),
  assigneeUserId: z.bigint().optional(),
})

export const updateCardSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(255).optional(),
  description: z.string().max(1000).optional(),
  assigneeUserId: z.bigint().optional(),
})

export const moveCardSchema = z.object({
  listId: z.bigint('List ID is required'),
  position: z.number().int().min(0, 'Position must be 0 or greater'),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type MoveCardInput = z.infer<typeof moveCardSchema>
