import * as bcrypt from 'bcryptjs'
import { SettingsRepository } from '@/lib/repositories/settings.repository'
import {
    changePasswordSchema,
    deleteAccountSchema,
    updateUserPreferencesSchema,
} from '@/lib/validation/settings'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'

export class SettingsService {
    private readonly repository = new SettingsRepository()

    async getUserPreferences(userId: bigint) {
        try {
            const user = await this.repository.getUserPreferences(userId)

            if (!user) {
                throw new AuthError('User not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            return user
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to retrieve user preferences',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async updateUserPreferences(userId: bigint, credentials: unknown) {
        try {
            const validatedData = updateUserPreferencesSchema.parse(credentials)

            const updateData: {
                darkMode?: boolean
            } = {}

            if (validatedData.darkMode !== undefined) {
                updateData.darkMode = validatedData.darkMode
            }

            const updated = await this.repository.updateUserPreferences(userId, updateData)

            if (!updated) {
                throw new AuthError('User not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            return updated
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to update preferences',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async changePassword(userId: bigint, credentials: unknown) {
        try {
            const validatedData = changePasswordSchema.parse(credentials)

            // Get user's current password hash
            const user = await this.repository.getUserPasswordHash(userId)

            if (!user) {
                throw new AuthError('User not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(
                validatedData.currentPassword,
                user.passwordHash
            )

            if (!isPasswordValid) {
                throw new AuthError(
                    'Current password is incorrect',
                    401,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

            // Update password
            const updated = await this.repository.updatePassword(userId, hashedPassword)

            return updated
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to change password',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async deleteAccount(userId: bigint, credentials: unknown) {
        try {
            const validatedData = deleteAccountSchema.parse(credentials)

            // Get user's password hash
            const user = await this.repository.getUserPasswordHash(userId)

            if (!user) {
                throw new AuthError('User not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify password for account deletion
            const isPasswordValid = await bcrypt.compare(
                validatedData.password,
                user.passwordHash
            )

            if (!isPasswordValid) {
                throw new AuthError(
                    'Password is incorrect',
                    401,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            // Delete user
            const deleted = await this.repository.deleteUser(userId)

            return deleted
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to delete account',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}