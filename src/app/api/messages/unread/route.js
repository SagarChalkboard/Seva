// src/app/api/messages/unread/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET(req) {
    try {
        await dbConnect();
        
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        // Count unread messages where user is recipient
        const count = await Message.countDocuments({
            recipientId: new mongoose.Types.ObjectId(userId),
            read: false
        });
        
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting unread messages:', error);
        return NextResponse.json({ error: 'Error counting unread messages' }, { status: 500 });
    }
}