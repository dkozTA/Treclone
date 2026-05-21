import { NextRequest } from 'next/server'
import { AuthController } from '@/lib/controllers/auth.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'

const controller = new AuthController()

export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    return controller.getMe(request, userId)
}