import { NextRequest } from 'next/server'
import { AuthController } from '@/lib/controllers/auth.controller'

const controller = new AuthController()

export async function POST(request: NextRequest) {
    return controller.verifyEmail(request)
}
