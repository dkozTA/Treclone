import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { updateListSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getAuthToken, extractUserIdFromToken } from '@/lib/auth-utils'

// PUT update list
export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ boardId: string; listId: string }> }
) {
  try {
    const { boardId, listId } = await params
    const boardIdBigInt = BigInt(boardId)
    const listIdBigInt = BigInt(listId)

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

    // Check if list exists and belongs to the board
    const list = await prisma.list.findUnique({
      where: { id: listIdBigInt },
    })

    if (!list) {
      return errorResponse('List not found', 404)
    }

    if (list.boardId !== boardIdBigInt) {
      return errorResponse('List does not belong to this board', 400)
    }

    const body = await request.json()

    // Validate input
    const validatedData = updateListSchema.parse(body)

    // Update list
    const updatedList = await prisma.list.update({
      where: { id: listIdBigInt },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.position !== undefined && {
          position: validatedData.position,
        }),
      },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse({
      message: 'List updated successfully',
      list: updatedList,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update list'
    return errorResponse(errorMessage, 400)
  }
}

// DELETE list
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ boardId: string; listId: string }> }
) {
  try {
    const { boardId, listId } = await params
    const boardIdBigInt = BigInt(boardId)
    const listIdBigInt = BigInt(listId)

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

    // Check if list exists and belongs to the board
    const list = await prisma.list.findUnique({
      where: { id: listIdBigInt },
    })

    if (!list) {
      return errorResponse('List not found', 404)
    }

    if (list.boardId !== boardIdBigInt) {
      return errorResponse('List does not belong to this board', 400)
    }

    // Delete list (cascade will delete cards)
    await prisma.list.delete({
      where: { id: listIdBigInt },
    })

    return successResponse({
      message: 'List deleted successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete list'
    return errorResponse(errorMessage, 400)
  }
}
