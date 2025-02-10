// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes
const PROTECTED_ROUTES = [
    '/dashboard',
    '/share-food',
    '/find-food'
];

export async function middleware(request) {
    const response = NextResponse.next();

    // Add security headers
    const securityHeaders = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'same-origin',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // Check if it's a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        request.nextUrl.pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return response;
    }

    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        
        return response;
    } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        response.cookies.delete('token');
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/share-food/:path*',
        '/find-food/:path*',
        '/api/protected/:path*'
    ],
};