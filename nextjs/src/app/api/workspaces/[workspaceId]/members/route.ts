import { NextRequest } from 'next/server'
import { WorkspaceMemberController } from '@/lib/controllers/workspace-member.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse } from '@/lib/utils/api-utils'

const controller = new WorkspaceMemberController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.getMembers(request, BigInt(workspaceId), userId)
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.addMember(request, BigInt(workspaceId), userId)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.removeMember(request, BigInt(workspaceId), userId)
}