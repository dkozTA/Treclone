import { NextResponse } from 'next/server'

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
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertBigIntToString(obj[key])
      }
    }
    return converted
  }
  
  return obj
}

export function successResponse<T>(data: T, status: number = 200) {
  const convertedData = convertBigIntToString(data)
  return NextResponse.json(
    {
      success: true,
      data: convertedData,
    },
    { status }
  )
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}
