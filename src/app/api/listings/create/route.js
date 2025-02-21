// src/app/api/listings/create/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();
        
        // Get user ID from token
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get listing data and add user ID
        const listingData = await req.json();
        const listing = await FoodListing.create({
            ...listingData,
            userId: userId
        });

        return NextResponse.json({ 
            success: true, 
            listing 
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Error creating listing' }, { status: 500 });
    }
}