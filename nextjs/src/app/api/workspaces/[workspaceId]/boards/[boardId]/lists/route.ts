import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createListSchema } from '@/lib/validation/list'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

// GET all lists in a board
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

    // Fetch all lists in the board
    const lists = await prisma.list.findMany({
      where: { boardId: boardIdBigInt },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        cards: {
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    })

    return successResponse({
      message: 'Lists fetched successfully',
      lists,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch lists'
    return errorResponse(errorMessage, 400)
  }
}

// POST create a new list
export async function POST(
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
    const validatedData = createListSchema.parse(body)

    // Create new list
    const list = await prisma.list.create({
      data: {
        boardId: boardIdBigInt,
        title: validatedData.title,
        position: validatedData.position,
      },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(
      {
        message: 'List created successfully',
        list,
      },
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create list'
    return errorResponse(errorMessage, 400)
  }
}
