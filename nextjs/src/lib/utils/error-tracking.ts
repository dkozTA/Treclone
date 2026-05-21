import * as Sentry from '@sentry/nextjs'

export function initializeErrorTracking() {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NODE_ENV,
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            debug: process.env.NODE_ENV === 'development',
        })
    }
}

export enum ErrorCode {
    UNAUTHORIZED = 'ERR_001',
    FORBIDDEN = 'ERR_002',
    NOT_FOUND = 'ERR_003',
    VALIDATION_ERROR = 'ERR_004',
    CONFLICT = 'ERR_005',
    INTERNAL_ERROR = 'ERR_999',
    RATE_LIMITED = 'ERR_429',
    DATABASE_ERROR = 'ERR_DB_001',
    TIMEOUT = 'ERR_504',
}

export interface ErrorMetadata {
    errorCode: ErrorCode
    correlationId: string
    timestamp: string
    endpoint: string
    method: string
    userId?: string
    environment: string
    [key: string]: any
}

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public errorCode: ErrorCode,
        message: string,
        public details?: any
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export function captureException(
    error: Error | unknown,
    metadata: Partial<ErrorMetadata> = {}
) {
    const errorData: ErrorMetadata = {
        errorCode: ErrorCode.INTERNAL_ERROR,
        correlationId: metadata.correlationId || generateCorrelationId(),
        timestamp: new Date().toISOString(),
        endpoint: metadata.endpoint || 'unknown',
        method: metadata.method || 'unknown',
        environment: process.env.NODE_ENV || 'unknown',
        ...metadata,
    }

    // Log to console
    console.error('[ERROR_TRACKING]', {
        message: error instanceof Error ? error.message : String(error),
        ...errorData,
    })

    // Send to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: {
                api: errorData,
            },
            tags: {
                errorCode: errorData.errorCode,
                endpoint: errorData.endpoint,
                environment: errorData.environment,
            },
        })
    }

    // Send to external error tracking service if configured
    if (process.env.ERROR_TRACKING_ENDPOINT) {
        sendToErrorTracker({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            ...errorData,
        }).catch((err) => console.error('Failed to send error tracking:', err))
    }

    return errorData
}

async function sendToErrorTracker(data: any) {
    return fetch(process.env.ERROR_TRACKING_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export function generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createErrorResponse(
    error: Error | AppError,
    correlationId: string
) {
    if (error instanceof AppError) {
        return {
            success: false,
            error: error.message,
            errorCode: error.errorCode,
            correlationId,
            ...(process.env.NODE_ENV === 'development' && {
                details: error.details,
                stack: error.stack,
            }),
        }
    }

    return {
        success: false,
        error: 'An unexpected error occurred',
        errorCode: ErrorCode.INTERNAL_ERROR,
        correlationId,
        ...(process.env.NODE_ENV === 'development' && {
            message: error.message,
            stack: error.stack,
        }),
    }
}