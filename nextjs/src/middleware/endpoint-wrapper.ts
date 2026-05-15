import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { createAuditLog, AuditAction, AuditEntity } from '@/lib/audit-log'
import { captureException, generateCorrelationId, ErrorCode } from '@/lib/error-tracking'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

export interface EndpointContext {
    correlationId: string
    clientIp: string
    userId?: bigint
    method: string
    endpoint: string
    entity: AuditEntity
}

export async function withMiddleware(
    handler: (request: NextRequest, context: EndpointContext) => Promise<NextResponse>,
    entity: AuditEntity,
    rateLimitConfig?: { interval: number; maxRequests: number }
) {
    return async (request: NextRequest) => {
        const correlationId = generateCorrelationId()
        const clientIp = getClientIp(request)
        const { valid, userId } = verifyTokenFromCookie(request)
        const endpoint = new URL(request.url).pathname
        const method = request.method

        // Rate limiting
        const rateLimitResult = rateLimit(`ip:${clientIp}`, rateLimitConfig)
        const headers = new Headers(rateLimitHeaders(rateLimitResult))
        headers.set('X-Correlation-ID', correlationId)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded',
                    errorCode: ErrorCode.RATE_LIMITED,
                    correlationId,
                },
                { status: 429, headers }
            )
        }

        // User rate limiting
        if (userId) {
            const userRateLimit = rateLimit(`user:${userId}`, {
                interval: 60000,
                maxRequests: 500,
            })
            if (!userRateLimit.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Rate limit exceeded',
                        errorCode: ErrorCode.RATE_LIMITED,
                        correlationId,
                    },
                    { status: 429, headers }
                )
            }
        }

        const context: EndpointContext = {
            correlationId,
            clientIp,
            userId: userId || undefined,
            method,
            endpoint,
            entity,
        }

        try {
            const response = await handler(request, context)

            // Audit log mutations
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                const action =
                    method === 'POST'
                        ? AuditAction.CREATE
                        : method === 'DELETE'
                            ? AuditAction.DELETE
                            : AuditAction.UPDATE

                createAuditLog({
                    userId: userId || 'anonymous',
                    action,
                    entity,
                    entityId: extractIdFromUrl(endpoint),
                    ipAddress: clientIp,
                    userAgent: request.headers.get('user-agent') || undefined,
                    status: 'SUCCESS',
                    metadata: { correlationId, statusCode: response.status },
                }).catch(() => { })
            }

            // Add correlation header to response
            headers.forEach((value, key) => {
                response.headers.set(key, value)
            })

            return response
        } catch (error) {
            // Error tracking
            captureException(error, {
                correlationId,
                endpoint,
                method,
                userId: userId?.toString(),
            })

            // Audit log failures
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                createAuditLog({
                    userId: userId || 'anonymous',
                    action: AuditAction.UPDATE,
                    entity,
                    entityId: extractIdFromUrl(endpoint),
                    ipAddress: clientIp,
                    userAgent: request.headers.get('user-agent') || undefined,
                    status: 'FAILURE',
                    errorMessage: error instanceof Error ? error.message : String(error),
                    metadata: { correlationId },
                }).catch(() => { })
            }

            return NextResponse.json(
                {
                    success: false,
                    error: 'Internal server error',
                    errorCode: ErrorCode.INTERNAL_ERROR,
                    correlationId,
                },
                { status: 500, headers }
            )
        }
    }
}

function extractIdFromUrl(url: string): string {
    const match = url.match(/\/([0-9]+)(?:\/|$)/)
    return match?.[1] || 'unknown'
}