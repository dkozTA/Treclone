import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { updateBoardSchema } from '@/lib/validation/board'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

// GET board details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
    const boardIdBigInt = BigInt(boardId)

    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    // Fetch board
    const board = await prisma.board.findUnique({
      where: { id: boardIdBigInt },
      select: {
        id: true,
        title: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        lists: {
          select: {
            id: true,
            title: true,
            position: true,
            cards: {
              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                assigneeUserId: true,
                createdBy: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!board) {
      return errorResponse('Board not found', 404)
    }

    // Check if user owns the board
    if (board.ownerId !== userId) {
      return errorResponse('Forbidden - you do not own this board', 403)
    }

    return successResponse({
      message: 'Board fetched successfully',
      board,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch board'
    return errorResponse(errorMessage, 400)
  }
}

// PUT update board
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
    const boardIdBigInt = BigInt(boardId)

    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
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
    const validatedData = updateBoardSchema.parse(body)

    // Update board
    const updatedBoard = await prisma.board.update({
      where: { id: boardIdBigInt },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse({
      message: 'Board updated successfully',
      board: updatedBoard,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update board'
    return errorResponse(errorMessage, 400)
  }
}

// DELETE board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
    const boardIdBigInt = BigInt(boardId)

    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
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

    // Delete board (cascade will delete lists and cards)
    await prisma.board.delete({
      where: { id: boardIdBigInt },
    })

    return successResponse({
      message: 'Board deleted successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete board'
    return errorResponse(errorMessage, 400)
  }
}
