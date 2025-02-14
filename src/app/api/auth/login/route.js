// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    // Comprehensive environment variable check
    console.log('Checking environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

    // Validate critical environment variables
    if (!process.env.MONGODB_URI) {
        console.error('CRITICAL ERROR: MONGODB_URI is NOT configured');
        return NextResponse.json(
            { error: 'Server configuration error: Database URI is missing' },
            { status: 500 }
        );
    }

    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL ERROR: JWT_SECRET is NOT configured');
        return NextResponse.json(
            { error: 'Server configuration error: JWT Secret is missing' },
            { status: 500 }
        );
    }

    try {
        // Ensure database connection
        await dbConnect();

        // Parse request body
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create response with cookie
        const response = NextResponse.json(
            { 
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 200 }
        );

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        // Detailed error logging
        console.error('Comprehensive Login Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error.message 
            },
            { status: 500 }
        );
    }
}