import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

const resetPasswordSchema = z
    .object({
        token: z.string().min(1, 'Token is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords don't match",
        path: ['passwordConfirmation'],
    })

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = resetPasswordSchema.parse(body)

        // Hash token for lookup
        const hashedToken = crypto
            .createHash('sha256')
            .update(validatedData.token)
            .digest('hex')

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date(), // Token not expired
                },
            },
        })

        if (!user) {
            return errorResponse('Invalid or expired reset token', 400)
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        })

        return successResponse({
            message: 'Password reset successful',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(error.issues[0].message, 400)
        }
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to reset password'
        return errorResponse(errorMessage, 400)
    }
}