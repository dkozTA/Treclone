import { z } from 'zod'
import * as jwt from 'jsonwebtoken'

export class AuthError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public code: string
    ) {
        super(message)
        this.name = 'AuthError'
    }
}

export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
    FORBIDDEN = 'FORBIDDEN',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Classifies and logs errors with appropriate severity levels
 */
export function handleAuthError(error: unknown): AuthError {
    // Zod validation errors
    if (error instanceof z.ZodError) {
        const message = error.issues[0].message
        console.warn('[Auth Validation]', message)
        return new AuthError(message, 400, AuthErrorCode.VALIDATION_ERROR)
    }

    // JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
        console.warn('[Auth JWT]', error.message)
        return new AuthError('Invalid token', 401, AuthErrorCode.INVALID_TOKEN)
    }

    if (error instanceof jwt.TokenExpiredError) {
        console.warn('[Auth Token Expired]', error.expiredAt)
        return new AuthError('Token expired', 401, AuthErrorCode.TOKEN_EXPIRED)
    }

    // Custom auth errors
    if (error instanceof AuthError) {
        return error
    }

    // Generic errors
    if (error instanceof Error) {
        const message = error.message

        // Map common error messages to specific codes
        if (message.includes('Invalid email or password')) {
            console.warn('[Auth Login]', message)
            return new AuthError(message, 401, AuthErrorCode.INVALID_CREDENTIALS)
        }

        if (message.includes('Email already registered')) {
            console.warn('[Auth Registration]', message)
            return new AuthError(message, 409, AuthErrorCode.EMAIL_ALREADY_REGISTERED)
        }

        if (message.includes('User not found')) {
            console.warn('[Auth User]', message)
            return new AuthError(message, 404, AuthErrorCode.USER_NOT_FOUND)
        }

        if (message.includes('Invalid or expired reset token')) {
            console.warn('[Auth Reset Token]', message)
            return new AuthError(message, 400, AuthErrorCode.INVALID_RESET_TOKEN)
        }

        if (message.includes("Passwords don't match")) {
            console.warn('[Auth Password]', message)
            return new AuthError(message, 400, AuthErrorCode.PASSWORD_MISMATCH)
        }

        console.error('[Auth Unexpected]', message)
        return new AuthError(
            'An unexpected error occurred',
            500,
            AuthErrorCode.INTERNAL_ERROR
        )
    }

    // Unknown error
    console.error('[Auth Unknown]', error)
    return new AuthError('An unexpected error occurred', 500, AuthErrorCode.INTERNAL_ERROR)
}
