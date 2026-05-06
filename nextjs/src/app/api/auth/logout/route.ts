import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    // In production, verify the token and invalidate it
    return successResponse({
      message: 'Logged out successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Logout failed'
    return errorResponse(errorMessage, 400)
  }
}
