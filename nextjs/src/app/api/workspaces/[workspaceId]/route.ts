import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'
import { z } from 'zod'

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(255),
})

// GET a specific workspace
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { boards: true },
        },
      },
    })

    if (!workspace) {
      return errorResponse('Workspace not found', 404)
    }

    if (workspace.ownerId !== userId) {
      return errorResponse('Forbidden - not the workspace owner', 403)
    }

    return successResponse({
      message: 'Workspace fetched successfully',
      workspace: convertBigIntToString(workspace),
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch workspace'
    return errorResponse(errorMessage, 400)
  }
}

// PUT update a workspace
export async function PUT(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)

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
    const validatedData = updateWorkspaceSchema.parse(body)

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: validatedData.name,
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse({
      message: 'Workspace updated successfully',
      workspace: convertBigIntToString(updatedWorkspace),
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update workspace'
    return errorResponse(errorMessage, 400)
  }
}

// DELETE a workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { valid, userId } = verifyTokenFromCookie(request)

    if (!valid || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    const workspaceId = BigInt(params.workspaceId)

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return errorResponse('Workspace not found', 404)
    }

    if (workspace.ownerId !== userId) {
      return errorResponse('Forbidden - not the workspace owner', 403)
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    })

    return successResponse({
      message: 'Workspace deleted successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete workspace'
    return errorResponse(errorMessage, 400)
  }
}
