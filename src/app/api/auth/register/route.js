// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

        const { name, email, password } = await req.json();

        // Input validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Password strength validation
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check for existing user
        const existingUser = await User.findOne({ 
            email: email.toLowerCase() // Case insensitive check
        });
        
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password with good salt rounds
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with sanitized data
        const user = await User.create({ 
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date()
        });

        // Return success without exposing user data
        return NextResponse.json(
            { 
                success: true,
                message: 'Registration successful',
                userId: user._id
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration Error:', error);
        
        // MongoDB duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Generic error for production
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}