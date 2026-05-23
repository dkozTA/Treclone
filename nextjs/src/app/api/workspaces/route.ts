import { NextRequest } from 'next/server'
import { WorkspaceController } from '@/lib/controllers/workspace.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new WorkspaceController()

// GET all workspaces for current user
export async function GET(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized('Unauthorized')
    }

    return controller.getWorkspaces(request, userId)
}

// POST create workspace
export async function POST(request: NextRequest) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized('Unauthorized')
    }

    return controller.createWorkspace(request, userId)
}