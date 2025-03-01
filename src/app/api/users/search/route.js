// src/app/api/users/search/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Get the token from cookies
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        // Get search query from URL parameters
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        
        // Build search conditions
        let searchConditions = { _id: { $ne: userId } }; // Exclude current user
        
        if (query) {
            // Add search query if provided
            searchConditions = {
                ...searchConditions,
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            };
        }
        
        // Find users that match the search criteria
        const users = await User.find(searchConditions)
            .select('name email')
            .limit(20);
        
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Error searching users' }, { status: 500 });
    }
}