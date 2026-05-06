import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { updateCardSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getAuthToken, extractUserIdFromToken } from '@/lib/auth-utils'

// GET card details
export async function GET(
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

    // Fetch card with board validation
    const card = await prisma.card.findUnique({
      where: { id: cardIdBigInt },
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
            boardId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    })

    if (!card) {
      return errorResponse('Card not found', 404)
    }

    // Validate card belongs to the board
    if (card.list.boardId !== boardIdBigInt) {
      return errorResponse('Card does not belong to this board', 400)
    }

    return successResponse({
      message: 'Card fetched successfully',
      card,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch card'
    return errorResponse(errorMessage, 400)
  }
}

// PUT update card
export async function PUT(
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

    const body = await request.json()

    // Validate input
    const validatedData = updateCardSchema.parse(body)

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id: cardIdBigInt },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.assigneeUserId !== undefined && {
          assigneeUserId: validatedData.assigneeUserId,
        }),
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
      },
    })

    return successResponse({
      message: 'Card updated successfully',
      card: updatedCard,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update card'
    return errorResponse(errorMessage, 400)
  }
}

// DELETE card
export async function DELETE(
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

    // Delete card
    await prisma.card.delete({
      where: { id: cardIdBigInt },
    })

    return successResponse({
      message: 'Card deleted successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete card'
    return errorResponse(errorMessage, 400)
  }
}
