import { NextRequest } from 'next/server'
import { CardController } from '@/lib/controllers/card.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new CardController()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.getCards(request, BigInt(listId), userId)
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    const { listId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.createCard(request, BigInt(listId), userId)
}
