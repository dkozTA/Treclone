import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return errorResponse('Email already in use', 409)
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    })

    return successResponse(
      {
        message: 'User registered successfully',
        user,
      },
      201
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed'
    return errorResponse(errorMessage, 400)
  }
}
