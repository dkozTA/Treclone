import { NextResponse } from 'next/server';

export function responseJson(obj: unknown, status = 200) {
    return NextResponse.json(obj, { status });
}

export const ok = <T>(data: T) => responseJson(successResponse(data, 200), 200);
export const created = <T>(data: T) => responseJson(successResponse(data, 201), 201);
export const badRequest = (msg = 'Bad Request') =>
    responseJson(errorResponse(msg, 400), 400);
export const unauthorized = (msg = 'Unauthorized') =>
    responseJson(errorResponse(msg, 401), 401);

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    status: number
}

// Convert BigInt and Date objects to string for JSON serialization
export function convertBigIntToString(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj

    if (typeof obj === 'bigint') {
        return obj.toString()
    }

    if (obj instanceof Date) {
        return obj.toISOString()
    }

    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString)
    }

    if (typeof obj === 'object') {
        const converted: Record<string, unknown> = {}
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                converted[key] = convertBigIntToString((obj as Record<string, unknown>)[key])
            }
        }
        return converted
    }

    return obj
}

/**
 * Returns a plain object
 * Controller wraps this in NextResponse.json()
 */
export function successResponse<T>(data: T, status: number = 200): ApiResponse<unknown> {
    const convertedData = convertBigIntToString(data)
    return {
        success: true,
        data: convertedData,
        status,
    }
}

/**
 * Returns a plain object
 * Controller wraps this in NextResponse.json()
 */
export function errorResponse(error: string, status: number = 400) {
    return {
        success: false,
        error,
        status,
    }
}
