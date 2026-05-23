import { NextRequest } from 'next/server'
import { ProfileController } from '@/lib/controllers/profile.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new ProfileController()

export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return unauthorized()
    }
    return controller.getProfile(request, userId)
}

export async function PATCH(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return unauthorized()
    }
    return controller.updateProfile(request, userId)
}
