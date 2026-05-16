import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createBoardSchema } from '@/lib/validation/board'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

// GET all boards for a specific workspace
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)

    // Verify workspace exists and user owns it
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return errorResponse('Workspace not found', 404)
    }

    if (workspace.ownerId !== userId) {
      return errorResponse('Forbidden - not the workspace owner', 403)
    }

    // Fetch boards in this workspace
    const boards = await prisma.board.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        description: true,
        ownerId: true,
        workspaceId: true,
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
      boards: convertBigIntToString(boards),
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch boards'
    return errorResponse(errorMessage, 400)
  }
}

// POST create a new board in a workspace
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)

    // Verify workspace exists and user owns it
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return errorResponse('Workspace not found', 404)
    }

    if (workspace.ownerId !== userId) {
      return errorResponse('Forbidden - not the workspace owner', 403)
    }

    const body = await request.json()
    const validatedData = createBoardSchema.parse(body)

    // Create new board
    const board = await prisma.board.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        ownerId: userId,
        workspaceId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        ownerId: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(
      {
        message: 'Board created successfully',
        board: convertBigIntToString(board),
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
