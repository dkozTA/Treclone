import { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'

function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.trim() === '') {
        throw new Error('JWT_SECRET environment variable is not set. Add it to your .env.local file')
    }
    return secret
}

export const JWT_SECRET = getJWTSecret()

export function getCookieToken(request: NextRequest): string | null {
    try {
        const token = request.cookies.get('accessToken')?.value
        return token || null
    } catch (error) {
        console.error('Error reading cookie token:', error)
        return null
    }
}

export function extractUserIdFromCookie(request: NextRequest): bigint | null {
    try {
        const token = getCookieToken(request)

        if (!token) {
            return null
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any
        return BigInt(decoded.userId)
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.warn('Invalid JWT token:', error.message)
        } else {
            console.error('Error extracting user ID from cookie:', error)
        }
        return null
    }
}

export function verifyTokenFromCookie(request: NextRequest): {
    valid: boolean
    userId: bigint | null
    error: string | null
} {
    try {
        const token = getCookieToken(request)

        if (!token) {
            return { valid: false, userId: null, error: 'No token provided' }
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any
        return { valid: true, userId: BigInt(decoded.userId), error: null }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.warn('Token verification failed:', error.message)
            return { valid: false, userId: null, error: 'Invalid token' }
        } else if (error instanceof jwt.TokenExpiredError) {
            console.warn('Token expired:', error.expiredAt)
            return { valid: false, userId: null, error: 'Token expired' }
        } else {
            console.error('Unexpected error in token verification:', error)
            return { valid: false, userId: null, error: 'Invalid token' }
        }
    }
}