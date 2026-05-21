import { NextRequest } from 'next/server'
import { ProfileController } from '@/lib/controllers/profile.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'

const controller = new ProfileController()

export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    return controller.getProfile(request, userId)
}

export async function PATCH(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    return controller.updateProfile(request, userId)
}