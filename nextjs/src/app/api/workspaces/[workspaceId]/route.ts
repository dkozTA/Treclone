import { NextRequest } from 'next/server'
import { WorkspaceController } from '@/lib/controllers/workspace.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new WorkspaceController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.getWorkspace(request, BigInt(workspaceId), userId)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.updateWorkspace(request, BigInt(workspaceId), userId)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.deleteWorkspace(request, BigInt(workspaceId), userId)
}
