import { NextRequest } from 'next/server'
import { WorkspaceSettingsController } from '@/lib/controllers/workspace-settings.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse } from '@/lib/utils/api-utils'

const controller = new WorkspaceSettingsController()

export async function GET(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)
    return controller.getSettings(request, workspaceId, userId)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)
    return controller.updateSettings(request, workspaceId, userId)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)
    return controller.deleteWorkspace(request, workspaceId, userId)
}