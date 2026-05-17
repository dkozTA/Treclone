import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
    try {
        const { valid, userId, error } = verifyTokenFromCookie(request)

        if (!valid || !userId) {
            return errorResponse(error || 'Unauthorized', 401)
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                ownedWorkspaces: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        if (!user) {
            return errorResponse('User not found', 404)
        }

        return successResponse({
            message: 'User data retrieved successfully',
            user: {
                ...user,
                id: user.id.toString(),
                ownedWorkspaces: user.ownedWorkspaces.map((ws) => ({
                    ...ws,
                    id: ws.id.toString(),
                })),
            },
        })
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch user data'
        return errorResponse(errorMessage, 400)
    }
}