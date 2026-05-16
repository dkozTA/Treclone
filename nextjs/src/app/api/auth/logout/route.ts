import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse } from '@/lib/api-utils'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refreshToken')?.value

        // Revoke refresh token in database
        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revokedAt: new Date() },
            })
        }

        // Create response
        const response = NextResponse.json(
            successResponse({
                message: 'Logged out successfully',
            })
        )

        // Clear cookies
        response.cookies.set({
            name: 'accessToken',
            value: '',
            httpOnly: true,
            maxAge: 0,
        })

        response.cookies.set({
            name: 'refreshToken',
            value: '',
            httpOnly: true,
            maxAge: 0,
        })

        return response
    } catch (error) {
        const response = NextResponse.json(
            successResponse({
                message: 'Logged out successfully',
            })
        )

        // Still clear cookies even if error
        response.cookies.set({
            name: 'accessToken',
            value: '',
            httpOnly: true,
            maxAge: 0,
        })

        response.cookies.set({
            name: 'refreshToken',
            value: '',
            httpOnly: true,
            maxAge: 0,
        })

        return response
    }
}