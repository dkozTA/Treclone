import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createBoardSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getAuthToken, extractUserIdFromToken } from '@/lib/auth-utils'

// GET all boards for the current user
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return errorResponse('Unauthorized - missing token', 401)
    }

    const userId = extractUserIdFromToken(token)

    if (!userId) {
      return errorResponse('Unauthorized - invalid token', 401)
    }

    // Fetch all boards owned by the user
    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
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
            _count: {
              select: { cards: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      message: 'Boards fetched successfully',
      boards,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch boards'
    return errorResponse(errorMessage, 400)
  }
}

// POST create a new board
export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return errorResponse('Unauthorized - missing token', 401)
    }

    const userId = extractUserIdFromToken(token)

    if (!userId) {
      return errorResponse('Unauthorized - invalid token', 401)
    }

    const body = await request.json()

    // Validate input
    const validatedData = createBoardSchema.parse(body)

    // Create new board
    const board = await prisma.board.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        ownerId: userId,
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

    return successResponse(
      {
        message: 'Board created successfully',
        board,
      },
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create board'
    return errorResponse(errorMessage, 400)
  }
}
