import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

const protectedRoutes = ['/workspaces', '/(dashboard)']
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/']

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    )
    const isPublicRoute = publicRoutes.some((route) =>
        pathname === route || pathname.startsWith(route)
    )

    const token = request.cookies.get('accessToken')?.value

    // If protected route, verify token
    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        } catch (error) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    // If logged in and trying to access auth pages, redirect to workspaces
    if (isPublicRoute && pathname.startsWith('/auth') && token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
            return NextResponse.redirect(new URL('/workspaces', request.url))
        } catch (error) {
            // Token invalid, allow access to auth pages
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}