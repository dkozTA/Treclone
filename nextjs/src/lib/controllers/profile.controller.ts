import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api-utils'
import { SettingsService } from '@/lib/services/settings.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class SettingsController {
    private readonly service = new SettingsService()

    async getUserPreferences(request: NextRequest, userId: bigint) {
        try {
            const preferences = await this.service.getUserPreferences(userId)

            return NextResponse.json(
                successResponse({
                    data: {
                        ...preferences,
                        id: preferences.id.toString(),
                    },
                    message: 'Preferences retrieved successfully',
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async updateUserPreferences(request: NextRequest, userId: bigint) {
        try {
            const body = await request.json()
            const updated = await this.service.updateUserPreferences(userId, body)

            return NextResponse.json(
                successResponse({
                    data: {
                        ...updated,
                        id: updated.id.toString(),
                    },
                    message: 'Preferences updated successfully',
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async changePassword(request: NextRequest, userId: bigint) {
        try {
            const body = await request.json()
            await this.service.changePassword(userId, body)

            return NextResponse.json(
                successResponse({
                    data: {},
                    message: 'Password changed successfully',
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async deleteAccount(request: NextRequest, userId: bigint) {
        try {
            const body = await request.json()
            await this.service.deleteAccount(userId, body)

            return NextResponse.json(
                successResponse({
                    data: {},
                    message: 'Account deleted successfully',
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }
}