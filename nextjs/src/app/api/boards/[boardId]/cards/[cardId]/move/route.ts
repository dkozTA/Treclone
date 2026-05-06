import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { moveCardSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getAuthToken, extractUserIdFromToken } from '@/lib/auth-utils'

// PATCH move card to another list
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  try {
    const { boardId, cardId } = await params
    const boardIdBigInt = BigInt(boardId)
    const cardIdBigInt = BigInt(cardId)

    const token = getAuthToken(request)

    if (!token) {
      return errorResponse('Unauthorized - missing token', 401)
    }

    const userId = extractUserIdFromToken(token)

    if (!userId) {
      return errorResponse('Unauthorized - invalid token', 401)
    }

    // Check if board exists and user owns it
    const board = await prisma.board.findUnique({
      where: { id: boardIdBigInt },
    })

    if (!board) {
      return errorResponse('Board not found', 404)
    }

    if (board.ownerId !== userId) {
      return errorResponse('Forbidden - you do not own this board', 403)
    }

    const body = await request.json()

    // Validate input
    const validatedData = moveCardSchema.parse(body)

    // Check if card exists and belongs to the board
    const card = await prisma.card.findUnique({
      where: { id: cardIdBigInt },
      select: {
        id: true,
        list: {
          select: {
            boardId: true,
          },
        },
      },
    })

    if (!card) {
      return errorResponse('Card not found', 404)
    }

    if (card.list.boardId !== boardIdBigInt) {
      return errorResponse('Card does not belong to this board', 400)
    }

    // Check if target list exists and belongs to the board
    const targetList = await prisma.list.findUnique({
      where: { id: validatedData.listId },
    })

    if (!targetList) {
      return errorResponse('Target list not found', 404)
    }

    if (targetList.boardId !== boardIdBigInt) {
      return errorResponse('Target list does not belong to this board', 400)
    }

    // Move card to new list and position
    const movedCard = await prisma.card.update({
      where: { id: cardIdBigInt },
      data: {
        listId: validatedData.listId,
        position: validatedData.position,
      },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        assigneeUserId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        list: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return successResponse({
      message: 'Card moved successfully',
      card: movedCard,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to move card'
    return errorResponse(errorMessage, 400)
  }
}
