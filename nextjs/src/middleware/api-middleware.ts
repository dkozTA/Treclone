import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/utils/rate-limit'
import { AuditAction, AuditEntity } from '@/lib/types/audit-log'
import { createAuditLog } from '@/lib/services/audit.service'
import { captureException, ErrorCode, generateCorrelationId } from '@/lib/utils/error-tracking'
import { verifyTokenFromCookie } from '@/lib/utils/auth'

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
    const { userId } = verifyTokenFromCookie(request)

    const ipRateLimit = rateLimit(`ip:${clientIp}`, { interval: 60000, maxRequests: 100 })
    const responseHeaders = new Headers(rateLimitHeaders(ipRateLimit))
    responseHeaders.set('X-Correlation-ID', correlationId)

    const rateLimitResp = respondRateLimitFailure(ipRateLimit, correlationId, responseHeaders)
    if (rateLimitResp) return rateLimitResp

    if (userId) {
        const userRate = rateLimit(`user:${userId}`, { interval: 60000, maxRequests: 500 })
        const userRateResp = respondRateLimitFailure(userRate, correlationId, responseHeaders, 'Rate limit exceeded for user')
        if (userRateResp) return userRateResp
    }

    const context: ApiMiddlewareContext = {
        correlationId,
        clientIp,
        userId: userId?.toString(),
        rateLimit: ipRateLimit,
    }

    try {
        const response = await handler(request, context)

        if (isMutationMethod(request.method)) {
            const entityId = extractEntityId(request.url)
            await maybeCreateAudit({
                userId,
                method: request.method,
                url: request.url,
                entityId,
                status: 'SUCCESS',
                correlationId,
                clientIp,
                userAgent: request.headers.get('user-agent') || undefined,
            })
        }

        applyHeadersToResponse(response, responseHeaders)
        return response
    } catch (error) {
        captureException(error, {
            correlationId,
            endpoint: request.url,
            method: request.method,
            userId: userId?.toString(),
        })

        if (isMutationMethod(request.method)) {
            const entityId = extractEntityId(request.url)
            await maybeCreateAudit({
                userId,
                method: request.method,
                url: request.url,
                entityId,
                status: 'FAILURE',
                errorMessage: error instanceof Error ? error.message : String(error),
                correlationId,
                clientIp,
                userAgent: request.headers.get('user-agent') || undefined,
            })
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

function respondRateLimitFailure(
    result: ReturnType<typeof rateLimit>,
    correlationId: string,
    headers: Headers,
    message = 'Rate limit exceeded'
): NextResponse | null {
    if (!result || result.success) return null
    return NextResponse.json(
        {
            success: false,
            error: message,
            errorCode: ErrorCode.RATE_LIMITED,
            correlationId,
            retryAfter: result.resetTime,
        },
        { status: 429, headers }
    )
}

function isMutationMethod(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
}

function getActionFromMethod(method: string): AuditAction {
    if (method === 'POST') return AuditAction.CREATE
    if (method === 'DELETE') return AuditAction.DELETE
    return AuditAction.UPDATE
}

async function maybeCreateAudit(input: {
    userId?: bigint | string | null
    method: string
    url: string
    entityId: bigint | null
    status: 'SUCCESS' | 'FAILURE'
    errorMessage?: string
    correlationId: string
    clientIp: string
    userAgent?: string
}): Promise<void> {
    if (input.userId == null || !isMutationMethod(input.method) || input.entityId === null) return

    const userIdBigInt: bigint =
        typeof input.userId === 'bigint' ? input.userId : BigInt(String(input.userId))

    try {
        await createAuditLog({
            userId: userIdBigInt,
            action: getActionFromMethod(input.method),
            entity: getEntityFromPath(input.url),
            entityId: input.entityId,
            status: input.status,
            errorMessage: input.errorMessage,
            metadata: {
                correlationId: input.correlationId,
                ipAddress: input.clientIp,
                ...(input.userAgent ? { userAgent: input.userAgent } : {}),
            },
        })
    } catch (e) {
        console.error('[API Middleware] Failed to create audit log:', e, {
            correlationId: input.correlationId,
            url: input.url,
            status: input.status,
        })
    }
}

function applyHeadersToResponse(response: Response, headers: Headers): void {
    const respWithHeaders = response as unknown as { headers: Headers }
    headers.forEach((value, key) => {
        respWithHeaders.headers.set(key, value)
    })
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

function extractEntityId(url: string): bigint | null {
    const regex = /\/(\d+)(?:\/|$)/
    const match = regex.exec(url)
    return match?.[1] ? BigInt(match[1]) : null
}