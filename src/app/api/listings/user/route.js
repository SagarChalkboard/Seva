// src/app/api/listings/user/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET(req) {
    try {
        await dbConnect();
        
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        console.log('Fetching listings for userId:', userId);

        const listings = await FoodListing.find({ 
            userId: userId,
            availableUntil: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        console.log('Found listings:', listings);

        return NextResponse.json({ listings });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json({ error: 'Error fetching listings' }, { status: 500 });
    }
}