import { z } from 'zod'

// User Settings Schema
export const updateUserPreferencesSchema = z.object({
    darkMode: z.boolean().optional(),
})

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>

// Change Password Schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters'),
    passwordConfirmation: z.string(),
}).refine(data => data.newPassword === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// Delete Account Schema
export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required for account deletion'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>