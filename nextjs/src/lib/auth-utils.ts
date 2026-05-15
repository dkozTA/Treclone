import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

export function getCookieToken(request: NextRequest): string | null {
    const token = request.cookies.get('accessToken')?.value
    return token || null
}

export function extractUserIdFromCookie(request: NextRequest): bigint | null {
    const token = getCookieToken(request)

    if (!token) {
        return null
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as any
        return BigInt(decoded.userId)
    } catch (error) {
        return null
    }
}

export function verifyTokenFromCookie(request: NextRequest): {
    valid: boolean
    userId: bigint | null
    error: string | null
} {
    const token = getCookieToken(request)

    if (!token) {
        return { valid: false, userId: null, error: 'No token provided' }
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as any
        return { valid: true, userId: BigInt(decoded.userId), error: null }
    } catch (error) {
        return { valid: false, userId: null, error: 'Invalid token' }
    }
}