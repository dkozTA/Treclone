import { NextRequest } from 'next/server'
import { AuthController } from '@/lib/controllers/auth.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new AuthController()

export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)
    if (!valid || !userId) {
        return unauthorized()
    }
    return controller.getMe(request, userId)
}
