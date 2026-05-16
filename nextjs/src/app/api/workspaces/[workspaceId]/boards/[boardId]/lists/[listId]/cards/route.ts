import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createCardSchema } from '@/lib/validation/card'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

// GET all cards in a list
export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ boardId: string; listId: string }> }
) {
  try {
    const { boardId, listId } = await params
    const boardIdBigInt = BigInt(boardId)
    const listIdBigInt = BigInt(listId)

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

    // Fetch all cards in the list
    const cards = await prisma.card.findMany({
      where: { listId: listIdBigInt },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        assigneeUserId: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy: { position: 'asc' },
    })

    return successResponse({
      message: 'Cards fetched successfully',
      cards,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch cards'
    return errorResponse(errorMessage, 400)
  }
}

// POST create a new card
export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ boardId: string; listId: string }> }
) {
  try {
    const { boardId, listId } = await params
    const boardIdBigInt = BigInt(boardId)
    const listIdBigInt = BigInt(listId)

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
    const validatedData = createCardSchema.parse(body)

    // Create new card
    const card = await prisma.card.create({
      data: {
        listId: listIdBigInt,
        title: validatedData.title,
        description: validatedData.description || null,
        position: validatedData.position,
        createdBy: userId,
        assigneeUserId: validatedData.assigneeUserId || null,
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

    return successResponse(
      {
        message: 'Card created successfully',
        card,
      },
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create card'
    return errorResponse(errorMessage, 400)
  }
}
