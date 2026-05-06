import { NextRequest } from 'next/server'

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }
  
  // Handle both "Bearer" and "bearer" (case-insensitive)
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export function extractUserIdFromToken(token: string): bigint | null {
  try {
    // Handle custom token format: bearer_userId_timestamp
    if (token.startsWith('bearer_')) {
      const parts = token.split('_')
      if (parts.length >= 2) {
        const userId = parts[1]
        return BigInt(userId)
      }
    }
    
    // Fallback for JWT format (future implementation)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return BigInt(payload.userId)
  } catch {
    return null
  }
}

// Placeholder for JWT signing - implement with proper JWT library
export function generateAuthToken(userId: bigint): string {
  // This is a placeholder. In production:
  // import jwt from 'jsonwebtoken'
  // return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  return 'placeholder_token'
}
