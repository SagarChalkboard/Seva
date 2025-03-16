// src/app/api/listings/near/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();

    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 5000; // default 5km
    const foodType = searchParams.get('foodType'); // Optional filter by food type
    const dietaryInfo = searchParams.get('diet'); // Optional filter by diet type

    console.log('Query params:', { lat, lng, radius });

    // Validate coordinates
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // First, get total count of available listings
    const totalCount = await FoodListing.countDocuments({
      status: 'available',
      availableUntil: { $gt: new Date() }
    });

    console.log('Total available listings:', totalCount);

    // Find all available listings within radius with increased maxDistance
    const listings = await FoodListing.find({
      status: 'available',
      availableUntil: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius,
          $minDistance: 0
        }
      }
    })
    .sort({ createdAt: -1 })
    .limit(1000); // Set a very high limit to ensure we get all results

    console.log(`Found ${listings.length} listings within radius`);

    return NextResponse.json({ 
      listings,
      total: listings.length,
      totalAvailable: totalCount
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to find nearby listings' },
      { status: 500 }
    );
  }
}