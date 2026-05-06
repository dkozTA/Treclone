import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { loginSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'

// Note: For production, use bcryptjs for password verification
// import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    // In production, use bcrypt to verify:
    // const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash)
    // For now, simple comparison (NOT SECURE - for testing only)
    const isPasswordValid = validatedData.password === user.passwordHash

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

    // In production, generate a proper JWT token
    // const token = generateAuthToken(user.id)
    const token = `bearer_${user.id}_${Date.now()}`

    return successResponse({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Login failed'
    return errorResponse(errorMessage, 400)
  }
}
