import { NextRequest } from 'next/server'
import { ListController } from '@/lib/controllers/list.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { errorResponse } from '@/lib/utils/api-utils'

const controller = new ListController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.getList(request, BigInt(listId), userId)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.updateList(request, BigInt(listId), userId)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return errorResponse('Unauthorized', 401)
    }

    return controller.deleteList(request, BigInt(listId), userId)
}