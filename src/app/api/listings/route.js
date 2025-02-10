import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

// GET: Retrieve all available listings
export async function GET() {
  try {
    await dbConnect();
    const listings = await FoodListing.find({ status: 'available' }).populate('provider', 'name email');
    return NextResponse.json({ listings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST: Create a new food listing
export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    // Here you can add validation (or use a library like Zod)
    // For now, we assume data includes: title, description, quantity, servings, location, availableUntil, provider

    const newListing = await FoodListing.create(data);
    return NextResponse.json({ listing: newListing }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
