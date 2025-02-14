// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        // Connect to DB with error handling
        const db = await dbConnect();
        if (!db) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 503 }
            );
        }

        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Safer JWT secret handling
        if (!process.env.JWT_SECRET) {
            console.warn('JWT_SECRET not found in environment variables');
        }
        
        const secret = process.env.JWT_SECRET || 'seva_default_secret_key_do_not_use_in_production';

        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email
            }, 
            secret,
            { expiresIn: '7d' }
        );

        // Clean user data for response
        const userData = {
            _id: user._id.toString(), // Convert ObjectId to string
            name: user.name,
            email: user.email
        };

        const response = NextResponse.json(
            { 
                success: true, 
                user: userData 
            }, 
            { status: 200 }
        );
        
        // Set cookie with more secure options
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true, // Always use secure in modern apps
            sameSite: 'lax', // Better compatibility than 'strict'
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login Error:', error.message);
        return NextResponse.json(
            { error: 'Authentication failed' }, // More generic error message
            { status: 500 }
        );
    }
}