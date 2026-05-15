import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import * as jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('accessToken')?.value

        if (!token) {
            return errorResponse('Unauthorized - missing token', 401)
        }

        // Verify token
        let decoded: any
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            )
        } catch (error) {
            return errorResponse('Unauthorized - invalid token', 401)
        }

        const userId = BigInt(decoded.userId)

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