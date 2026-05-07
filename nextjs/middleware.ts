import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token');
    const { pathname } = request.nextUrl;

    if (token && pathname === '/') {
        return NextResponse.redirect(new URL('/boards', request.url));
    }

    if (!token && pathname.startsWith('/boards')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/boards/:path*'],
};