// src/app/api/test/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: 'MongoDB connected successfully!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
  }
}
