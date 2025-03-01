// src/app/api/messages/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';

// Get all conversations for the current user
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
        
        // Make sure mongoose is properly connected
        if (!mongoose.Types || !mongoose.Types.ObjectId) {
            console.error('Mongoose Types not available');
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        
        // Find all messages where the user is either sender or recipient
        // Use a simpler query approach to avoid issues with ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // First get all messages involving this user
        const allMessages = await Message.find({
            $or: [
                { senderId: userObjectId },
                { recipientId: userObjectId }
            ]
        }).sort({ createdAt: -1 });
        
        // Process these messages to extract conversations
        const conversationMap = new Map();
        
        allMessages.forEach(msg => {
            // Determine the other user in the conversation
            const otherUserId = msg.senderId.toString() === userId 
                ? msg.recipientId.toString() 
                : msg.senderId.toString();
            
            // If we haven't seen this conversation yet, add it
            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    userId: otherUserId,
                    lastMessage: msg,
                    unreadCount: msg.recipientId.toString() === userId && !msg.read ? 1 : 0
                });
            } else if (msg.recipientId.toString() === userId && !msg.read) {
                // If we've seen this conversation, just update the unread count if needed
                const conversation = conversationMap.get(otherUserId);
                conversation.unreadCount += 1;
            }
        });
        
        // Convert the map to an array
        const conversations = Array.from(conversationMap.values());
        
        // Get user details for each conversation
        const otherUserIds = conversations.map(conv => conv.userId);
        const otherUsers = await User.find({
            _id: { $in: otherUserIds }
        }).select('name email');
        
        // Create a map of user details
        const userMap = new Map();
        otherUsers.forEach(user => {
            userMap.set(user._id.toString(), {
                name: user.name,
                email: user.email
            });
        });
        
        // Map user details to conversations
        const formattedConversations = conversations.map(conv => {
            const user = userMap.get(conv.userId) || { name: 'Unknown User', email: '' };
            return {
                userId: conv.userId,
                name: user.name,
                email: user.email,
                lastMessage: conv.lastMessage.content,
                unreadCount: conv.unreadCount,
                timestamp: conv.lastMessage.createdAt
            };
        });

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
    }
}

// Create a new message
export async function POST(req) {
    try {
        await dbConnect();
        
        // Get the token from cookies
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const senderId = decoded.userId;
        
        // Get message data
        const { recipientId, content } = await req.json();
        
        if (!recipientId || !content) {
            return NextResponse.json({ error: 'Recipient ID and content are required' }, { status: 400 });
        }
        
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
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
                createdAt: message.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
    }
}