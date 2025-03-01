// src/app/api/auth/check/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        // Get token from cookies
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ 
                error: 'Not authenticated' 
            }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Connect to database
        await dbConnect();
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return NextResponse.json({ 
                error: 'User not found' 
            }, { status: 404 });
        }

        // Return user info
        return NextResponse.json({
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ 
            error: 'Invalid token' 
        }, { status: 401 });
    }
}