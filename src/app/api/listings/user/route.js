// src/app/api/listings/user/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        await dbConnect();
        
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const listings = await Listing.find({ createdBy: userId })
            .sort({ createdAt: -1 }); // Most recent first

        return NextResponse.json({ listings });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json({ error: 'Error fetching listings' }, { status: 500 });
    }
}