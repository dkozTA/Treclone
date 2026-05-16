import { LRUCache } from 'lru-cache'
import { NextRequest } from 'next/server'

export interface RateLimitConfig {
    interval: number // milliseconds
    maxRequests: number
}

const cache = new LRUCache<string, number[]>({
    max: 500, // Store rate limits for max 500 IPs
    ttl: 1000 * 60 * 60, // 1 hour
})

export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIp) {
        return realIp.trim()
    }

    // Fallback for local development
    return request.headers.get('cf-connecting-ip') || 'unknown'
}

export function rateLimit(
    key: string,
    config: RateLimitConfig = { interval: 60000, maxRequests: 100 }
) {
    const now = Date.now()
    const record = cache.get(key) || []

    // Remove old entries outside the interval
    const recentRequests = record.filter((timestamp) => now - timestamp < config.interval)

    if (recentRequests.length >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetTime: new Date(recentRequests[0] + config.interval),
        }
    }

    recentRequests.push(now)
    cache.set(key, recentRequests)

    return {
        success: true,
        remaining: config.maxRequests - recentRequests.length,
        resetTime: new Date(now + config.interval),
    }
}

export function rateLimitHeaders(
    result: ReturnType<typeof rateLimit>
): Record<string, string> {
    return {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toISOString(),
    }
}