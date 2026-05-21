import { NextRequest } from 'next/server'
import { BoardMemberController } from '@/lib/controllers/board-member.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse } from '@/lib/utils/api-utils'

const controller = new BoardMemberController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const { boardId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.getMembers(request, BigInt(boardId), userId)
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const { boardId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.addMember(request, BigInt(boardId), userId)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const { boardId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.removeMember(request, BigInt(boardId), userId)
}