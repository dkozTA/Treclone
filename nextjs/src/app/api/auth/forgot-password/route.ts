import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return a success message to prevent email enumeration attacks
    if (!user) {
      return successResponse({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // 1. Generate a random, secure token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // 2. Hash the token before saving it to the database for security
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // 3. Set an expiration date (e.g., 1 hour from now)
    const passwordResetExpires = new Date(Date.now() + 3600000) // 1 hour

    // 4. Update the user in the database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    })

    // In a real app, send an email with the `resetToken`.
    // IMPORTANT: Do not expose the token in production responses.
    return successResponse({
      message:
        'Password reset token generated. In a real app, this would be emailed.',
      resetToken, // Dev-only: Exposing token for testing
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    return errorResponse(errorMessage, 400)
  }
}
