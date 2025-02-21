import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET(request) {
  try {
    await dbConnect();

    // Extract lat & lng from the URL query params: /api/listings/near?lat=...&lng=...
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Run geospatial aggregation to find listings near [lng, lat]
    // 'distanceField' => name of the field with the distance in each doc (meters by default)
    const listings = await FoodListing.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat], // [longitude, latitude]
          },
          distanceField: 'distance',
          spherical: true,
          // distanceMultiplier: 0.001, // (optional) convert from meters to kilometers
        },
      },
      { $sort: { distance: 1 } }, // sort by ascending distance
      // Optional: only include still-valid listings, e.g.:
      // { $match: { availableUntil: { $gt: new Date() } } },
      // Optional: limit or project certain fields
      // { $limit: 20 },
      // { $project: { title: 1, distance: 1, ... } }
    ]);

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error in /listings/near:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby listings' },
      { status: 500 }
    );
  }
}
