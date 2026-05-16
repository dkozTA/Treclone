import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { createAuditLog, AuditAction, AuditEntity } from '@/lib/audit-log'
import { captureException, ErrorCode, generateCorrelationId } from '@/lib/error-tracking'
import { verifyTokenFromCookie } from '@/lib/auth-utils'

export interface ApiMiddlewareContext {
    correlationId: string
    clientIp: string
    userId?: string
    rateLimit: ReturnType<typeof rateLimit>
}

export async function apiMiddleware(
    request: NextRequest,
    handler: (req: NextRequest, context: ApiMiddlewareContext) => Promise<Response>
): Promise<Response> {
    const correlationId = generateCorrelationId()
    const clientIp = getClientIp(request)
    const { valid, userId } = verifyTokenFromCookie(request)

    // Rate limiting: 100 requests per minute per IP
    const rateLimitResult = rateLimit(`ip:${clientIp}`, {
        interval: 60000,
        maxRequests: 100,
    })

    const responseHeaders = new Headers(rateLimitHeaders(rateLimitResult))
    responseHeaders.set('X-Correlation-ID', correlationId)

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                success: false,
                error: 'Rate limit exceeded',
                errorCode: ErrorCode.RATE_LIMITED,
                correlationId,
                retryAfter: rateLimitResult.resetTime,
            },
            {
                status: 429,
                headers: responseHeaders,
            }
        )
    }

    // Rate limit per authenticated user: 500 requests per minute
    if (userId) {
        const userRateLimit = rateLimit(`user:${userId}`, {
            interval: 60000,
            maxRequests: 500,
        })

        if (!userRateLimit.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded for user',
                    errorCode: ErrorCode.RATE_LIMITED,
                    correlationId,
                },
                {
                    status: 429,
                    headers: responseHeaders,
                }
            )
        }
    }

    const context: ApiMiddlewareContext = {
        correlationId,
        clientIp,
        userId: userId?.toString(),
        rateLimit: rateLimitResult,
    }

    try {
        const response = await handler(request, context)

        // Log successful mutation operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            createAuditLog({
                userId: userId || 'anonymous',
                action: request.method === 'POST' ? AuditAction.CREATE :
                    request.method === 'DELETE' ? AuditAction.DELETE : AuditAction.UPDATE,
                entity: getEntityFromPath(request.url),
                entityId: extractEntityId(request.url),
                ipAddress: clientIp,
                userAgent: request.headers.get('user-agent') || undefined,
                status: 'SUCCESS',
                metadata: { correlationId },
            }).catch(() => { }) // Don't block on audit log errors
        }

        // Add correlation ID to all responses
        responseHeaders.forEach((value, key) => {
            response.headers.set(key, value)
        })

        return response
    } catch (error) {
        const errorData = captureException(error, {
            correlationId,
            endpoint: request.url,
            method: request.method,
            userId: userId?.toString(),
        })

        // Log failed operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            createAuditLog({
                userId: userId || 'anonymous',
                action: AuditAction.UPDATE,
                entity: getEntityFromPath(request.url),
                entityId: extractEntityId(request.url),
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
            {
                status: 500,
                headers: responseHeaders,
            }
        )
    }
}

function getEntityFromPath(url: string): AuditEntity {
    if (url.includes('/boards')) return AuditEntity.BOARD
    if (url.includes('/lists')) return AuditEntity.LIST
    if (url.includes('/cards')) return AuditEntity.CARD
    if (url.includes('/members')) return AuditEntity.MEMBER
    if (url.includes('/workspaces')) return AuditEntity.WORKSPACE
    if (url.includes('/auth')) return AuditEntity.USER
    return AuditEntity.USER
}

function extractEntityId(url: string): string {
    const match = url.match(/\/([0-9]+)(?:\/|$)/)
    return match?.[1] || 'unknown'
}