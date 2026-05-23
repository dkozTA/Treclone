import { NextRequest } from 'next/server'
import { CardController } from '@/lib/controllers/card.controller'
import { verifyTokenFromCookie } from '@/lib/utils/auth'
import { unauthorized } from '@/lib/utils/api-utils'

const controller = new CardController()

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ cardId: string }> }
) {
    const { cardId } = await params
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
        return unauthorized()
    }

    return controller.moveCard(request, BigInt(cardId), userId)
}
