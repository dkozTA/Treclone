import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
import * as crypto from 'crypto'

const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = forgotPasswordSchema.parse(body)

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        // Always return success (prevent email enumeration)
        if (!user) {
            return successResponse({
                message: 'If email exists, password reset link has been sent',
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        // Store token and expiry in database
        await prisma.user.update({
            where: { email: validatedData.email },
            data: {
                passwordResetToken: hashedToken,
                passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        })

        // TODO: Send email with reset link containing resetToken
        // sendPasswordResetEmail(user.email, resetToken)

        // For development only - return token in response
        if (process.env.NODE_ENV === 'development') {
            return successResponse({
                message: 'Password reset link sent',
                resetToken, // REMOVE IN PRODUCTION
            })
        }

        return successResponse({
            message: 'If email exists, password reset link has been sent',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(error.issues[0].message, 400)
        }
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to process forgot password'
        return errorResponse(errorMessage, 400)
    }
}