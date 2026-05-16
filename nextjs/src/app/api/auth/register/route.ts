import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

const registerSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return errorResponse('Email already registered', 409)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                passwordHash: hashedPassword,
                fullName: validatedData.fullName,
            },
        })

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id.toString() },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        )

        // Create refresh token
        const refreshToken = jwt.sign(
            { userId: user.id.toString() },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        )

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        })

        // Create response
        const response = NextResponse.json(
            successResponse({
                message: 'User registered successfully',
                user: {
                    id: user.id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                },
            }),
            { status: 201 }
        )

        // Set HTTP-only cookies
        response.cookies.set({
            name: 'accessToken',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        response.cookies.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        })

        return response
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(error.issues[0].message, 400)
        }
        const errorMessage =
            error instanceof Error ? error.message : 'Registration failed'
        return errorResponse(errorMessage, 400)
    }
}