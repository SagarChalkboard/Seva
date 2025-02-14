// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );

        // Delete token with more specific options
        response.cookies.delete('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/' // Ensure cookie is deleted from all paths
        });

        return response;
    } catch (error) {
        console.error('Logout Error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    }
}

// Also handle OPTIONS request for CORS if needed
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}