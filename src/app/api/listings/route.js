// src/app/api/listings/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        // Connect to database
        await dbConnect();
        
        // Verify authentication token
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Decode user ID from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Parse request body
        const listingData = await req.json();
        console.log('Received listing data:', listingData);

        // Create new food listing
        const listing = await FoodListing.create({
            ...listingData,
            userId: userId, // Ensure user ID is set
            availableUntil: new Date(listingData.availableUntil)
        });

        // Respond with success and created listing
        return NextResponse.json({ 
            success: true, 
            listing 
        }, { status: 201 });

    } catch (error) {
        console.error('Listing creation error:', error);
        return NextResponse.json({ 
            error: 'Error creating listing',
            details: error.message
        }, { status: 500 });
    }
}