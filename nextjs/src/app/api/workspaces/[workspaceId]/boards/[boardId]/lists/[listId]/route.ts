import { NextRequest } from 'next/server'
import { ListController } from '@/lib/controllers/list.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new ListController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
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
        return unauthorized()
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
        return unauthorized()
    }

    return controller.deleteList(request, BigInt(listId), userId)
}
