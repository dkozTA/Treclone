import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { loginSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import bcrypt from 'bcryptjs'
import { generateAuthToken } from '@/lib/auth-utils'

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

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

    // Generate a proper JWT token
    const token = generateAuthToken(user.id)

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
