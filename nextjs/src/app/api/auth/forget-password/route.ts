import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      // Don't reveal if email exists
      return successResponse({
        message:
          'If email exists, password reset link has been sent to your email',
      })
    }

    // In production, generate a password reset token and send email
    // const resetToken = generatePasswordResetToken(user.id)
    // await sendPasswordResetEmail(user.email, resetToken)
    
    return successResponse({
      message:
        'If email exists, password reset link has been sent to your email',
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Request failed'
    return errorResponse(errorMessage, 400)
  }
}
