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
            return NextResponse.json({ 
                error: 'Not authenticated' 
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get listing data from request
        const listingData = await req.json();
        
        // Validate essential fields
        if (!listingData.title || !listingData.description || !listingData.quantity || !listingData.foodType) {
            return NextResponse.json({
                error: 'Missing required food information'
            }, { status: 400 });
        }
        
        if (!listingData.location || !listingData.location.coordinates || !listingData.location.address) {
            return NextResponse.json({
                error: 'Missing required location information'
            }, { status: 400 });
        }
        
        if (!listingData.availableUntil) {
            return NextResponse.json({
                error: 'Missing availability information'
            }, { status: 400 });
        }
        
        // Ensure food safety fields are properly structured
        let foodSafety = {
            storageType: listingData.foodSafety?.storageType || listingData.storageType || 'room_temperature',
            allergens: listingData.foodSafety?.allergens || listingData.allergens || [],
            dietaryInfo: listingData.foodSafety?.dietaryInfo || listingData.dietaryInfo || [],
            preparedOn: listingData.foodSafety?.preparedOn || listingData.preparedOn || null,
            bestByDate: listingData.foodSafety?.bestByDate || listingData.bestByDate || null,
            safetyChecklist: listingData.foodSafety?.safetyChecklist || 
                listingData.safetyChecklist || {
                    properlyStored: false,
                    handlingProcedures: false,
                    noSpoilage: false
                }
        };

        // Create new food listing
        const listing = await FoodListing.create({
            title: listingData.title,
            description: listingData.description,
            quantity: listingData.quantity,
            foodType: listingData.foodType,
            photoUrl: listingData.photoUrl || '',
            
            location: {
                type: 'Point',
                coordinates: listingData.location.coordinates,
                address: listingData.location.address,
                radius: listingData.radius || 50
            },
            pickupInstructions: listingData.pickupInstructions || '',
            
            availableUntil: new Date(listingData.availableUntil),
            notes: listingData.notes || '',
            
            foodSafety,
            
            userId: userId,
            status: 'available'
        });

        // Respond with created listing
        return NextResponse.json({ 
            success: true, 
            message: 'Food listing created successfully',
            listing: {
                id: listing._id,
                title: listing.title,
                foodType: listing.foodType,
                location: listing.location.address,
                availableUntil: listing.availableUntil
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating listing:', error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => err.message)
            }, { status: 400 });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to create food listing',
            message: error.message
        }, { status: 500 });
    }
}