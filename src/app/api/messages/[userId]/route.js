// src/app/api/messages/[userId]/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';

// Get messages between current user and specified user
export async function GET(req, { params: { userId } }) {
    try {
        await dbConnect();
        
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.userId;
        const otherUserId = userId;
        
        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        // Check if other user exists
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: currentUserId }
            ]
        }).sort({ createdAt: 1 });
        
        // Mark unread messages as read
        await Message.updateMany(
            { 
                senderId: otherUserId,
                recipientId: currentUserId,
                read: false
            },
            { $set: { read: true } }
        );
        
        // Format messages for the client
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            sender: msg.senderId.toString() === currentUserId ? 'me' : 'other',
            timestamp: msg.createdAt,
            read: msg.read
        }));
        
        return NextResponse.json({
            messages: formattedMessages,
            user: {
                id: otherUser._id,
                name: otherUser.name,
                email: otherUser.email
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }
}

// Send a message to a user
export async function POST(req, { params }) {
    try {
        await dbConnect();
        
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const senderId = decoded.userId;
        const recipientId = params?.userId;
        
        // Validate recipient ID
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
        }
        
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }
        
        // Get message content
        const { content } = await req.json();
        
        if (!content) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }
        
        // Create the message
        const message = new Message({
            senderId,
            recipientId,
            content,
        });
        
        await message.save();
        
        return NextResponse.json({ 
            success: true,
            message: {
                id: message._id,
                content: message.content,
                sender: 'me',
                timestamp: message.createdAt,
                read: false
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
    }
}