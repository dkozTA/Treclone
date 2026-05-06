import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { getAuthToken, extractUserIdFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = getAuthToken(request)

    if (!token) {
      return errorResponse('Unauthorized - missing token', 401)
    }

    // Extract user ID from token
    const userId = extractUserIdFromToken(token)

    if (!userId) {
      return errorResponse('Unauthorized - invalid token', 401)
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      message: 'User fetched successfully',
      user,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch user'
    return errorResponse(errorMessage, 400)
  }
}
