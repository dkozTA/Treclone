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
        const { userId } = verifyTokenFromCookie(request)
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
                const action = getAuditAction(method)

                try {
                    await createAuditLog({
                        userId: userId || 'anonymous',
                        action,
                        entity,
                        entityId: extractIdFromUrl(endpoint),
                        ipAddress: clientIp,
                        userAgent: request.headers.get('user-agent') || undefined,
                        status: 'SUCCESS',
                        metadata: { correlationId, statusCode: response.status },
                    })
                } catch (auditError) {
                    console.error('[Endpoint] Failed to create audit log:', auditError, {
                        correlationId,
                        endpoint,
                    })
                }
            }

            // Add correlation header to response
            headers.forEach((value, key) => {
                response.headers.set(key, value)
            })

            return response
        } catch (error) {
            // Error tracking and logging
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error('[Endpoint] Handler error:', {
                error: errorMessage,
                correlationId,
                endpoint,
                method,
                userId: userId?.toString(),
            })

            captureException(error, {
                correlationId,
                endpoint,
                method,
                userId: userId?.toString(),
            })

            // Audit log failures
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                const action = getAuditAction(method)

                try {
                    await createAuditLog({
                        userId: userId || 'anonymous',
                        action,
                        entity,
                        entityId: extractIdFromUrl(endpoint),
                        ipAddress: clientIp,
                        userAgent: request.headers.get('user-agent') || undefined,
                        status: 'FAILURE',
                        errorMessage,
                        metadata: { correlationId },
                    })
                } catch (auditError) {
                    console.error('[Endpoint] Failed to create failure audit log:', auditError, {
                        correlationId,
                        endpoint,
                    })
                }
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

function getAuditAction(method: string): AuditAction {
    if (method === 'POST') return AuditAction.CREATE
    if (method === 'DELETE') return AuditAction.DELETE
    return AuditAction.UPDATE
}

function extractIdFromUrl(url: string): string {
    const regex = /\/(\d+)(?:\/|$)/
    const match = regex.exec(url)
    return match?.[1] || 'unknown'
}