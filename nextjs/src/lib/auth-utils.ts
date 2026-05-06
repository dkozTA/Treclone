import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  iat: number
  exp: number
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function generateAuthToken(userId: bigint): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  const token = jwt.sign({ userId: userId.toString() }, secret, {
    expiresIn: '1d', // Token expires in 1 day
  })
  return token
}

export function extractUserIdFromToken(token: string): bigint | null {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET is not defined.')
    return null
  }
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    return BigInt(decoded.userId)
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}
