export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    status: number
}

// Convert BigInt and Date objects to string for JSON serialization
export function convertBigIntToString(obj: any): any {
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
        const converted: any = {}
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                converted[key] = convertBigIntToString(obj[key])
            }
        }
        return converted
    }

    return obj
}

/**
 * Returns a plain object (not a Response)
 * Controller wraps this in NextResponse.json()
 */
export function successResponse<T>(data: T) {
    const convertedData = convertBigIntToString(data)
    return {
        success: true,
        data: convertedData,
    }
}

/**
 * Returns a plain object (not a Response)
 * Controller wraps this in NextResponse.json()
 */
export function errorResponse(error: string, status: number = 400) {
    return {
        success: false,
        error,
        status,
    }
}