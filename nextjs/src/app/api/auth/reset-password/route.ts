import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-utils'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // 1. Hash the incoming token to match the one stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // 2. Find the user by the hashed token and check if it has expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Check if the token is not expired
        },
      },
    })

    if (!user) {
      return errorResponse('Invalid or expired password reset token', 400)
    }

    // 3. Hash the new password
    const newPasswordHash = await bcrypt.hash(password, 10)

    // 4. Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

    return successResponse({ message: 'Password has been reset successfully' })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    return errorResponse(errorMessage, 400)
  }
}
