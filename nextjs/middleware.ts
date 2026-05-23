import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/utils/auth';

const protectedRoutes = ['/workspaces', '/profile', '/settings'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

function isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

function isAuthRoute(pathname: string): boolean {
    return authRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

function verifyToken(token: string, pathname: string): boolean {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.warn('[Middleware] Token verification failed:', error.message, {
                path: pathname,
                timestamp: new Date().toISOString(),
            });
        } else {
            console.error('[Middleware] Unexpected error during token verification:', error);
        }
        return false;
    }
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get('accessToken')?.value;

    if (isProtectedRoute(pathname)) {
        if (!token || !verifyToken(token, pathname)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthRoute(pathname) && token && verifyToken(token, pathname)) {
        return NextResponse.redirect(new URL('/workspaces', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};