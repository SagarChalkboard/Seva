import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        jwt.verify(token, process.env.JWT_SECRET);
        return NextResponse.json({ authenticated: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}