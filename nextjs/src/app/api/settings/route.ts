import { NextRequest } from 'next/server'
import { SettingsController } from '@/lib/controllers/settings.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new SettingsController()

// GET user preferences
export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.getUserPreferences(request, userId)
}

// PATCH update preferences or change password
export async function PATCH(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    const body = await request.json()

    // Route to appropriate handler based on body content
    if ('currentPassword' in body || 'newPassword' in body) {
        return controller.changePassword(request, userId, body)
    } else {
        return controller.updateUserPreferences(request, userId, body)
    }
}

// DELETE account
export async function DELETE(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.deleteAccount(request, userId)
}
