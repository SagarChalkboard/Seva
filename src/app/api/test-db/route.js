import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ message: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
} 