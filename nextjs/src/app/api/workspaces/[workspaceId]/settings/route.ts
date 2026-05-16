import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'
import { z } from 'zod'

const updateSettingsSchema = z.object({
    visibility: z.enum(['private', 'team', 'public']).optional(),
    notifications: z.object({
        dailySummary: z.boolean().optional(),
        mentionAlerts: z.boolean().optional(),
    }).optional(),
})

// GET - Fetch workspace settings
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
                ownerId: true,
                visibility: true,
                dailySummary: true,
                mentionAlerts: true,
            },
        })

        if (!workspace) {
            return errorResponse('Workspace not found', 404)
        }

        if (workspace.ownerId !== userId) {
            return errorResponse('Forbidden - not the workspace owner', 403)
        }

        return successResponse({
            message: 'Workspace settings fetched successfully',
            settings: {
                visibility: workspace.visibility,
                notifications: {
                    dailySummary: workspace.dailySummary,
                    mentionAlerts: workspace.mentionAlerts,
                },
            },
        })
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch workspace settings'
        return errorResponse(errorMessage, 400)
    }
}

// PUT - Update workspace settings
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

        // Verify workspace exists and user is owner
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        })

        if (!workspace) {
            return errorResponse('Workspace not found', 404)
        }

        if (workspace.ownerId !== userId) {
            return errorResponse('Forbidden - not the workspace owner', 403)
        }

        // Parse and validate request body
        const body = await request.json()
        const validatedData = updateSettingsSchema.parse(body)

        // Build update data object
        const updateData: any = {}

        if (validatedData.visibility) {
            updateData.visibility = validatedData.visibility
        }

        if (validatedData.notifications) {
            if (validatedData.notifications.dailySummary !== undefined) {
                updateData.dailySummary = validatedData.notifications.dailySummary
            }
            if (validatedData.notifications.mentionAlerts !== undefined) {
                updateData.mentionAlerts = validatedData.notifications.mentionAlerts
            }
        }

        // Update workspace
        const updatedWorkspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: updateData,
            select: {
                id: true,
                visibility: true,
                dailySummary: true,
                mentionAlerts: true,
            },
        })

        return successResponse({
            message: 'Workspace settings updated successfully',
            settings: {
                visibility: updatedWorkspace.visibility,
                notifications: {
                    dailySummary: updatedWorkspace.dailySummary,
                    mentionAlerts: updatedWorkspace.mentionAlerts,
                },
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('Validation error: ' + error.issues[0].message, 400)
        }
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to update workspace settings'
        return errorResponse(errorMessage, 400)
    }
}