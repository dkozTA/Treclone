import { NextRequest } from 'next/server'
import { BoardController } from '@/lib/controllers/board.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse } from '@/lib/utils/api-utils'

const controller = new BoardController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.getBoards(request, BigInt(workspaceId), userId)
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

    return controller.createBoard(request, BigInt(workspaceId), userId)
}