// src/lib/socket.js
import { Server } from 'socket.io';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '@/models/User';
import FoodListing from '@/models/FoodListing';

// Track connected users
const connectedUsers = new Map();

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://seva-app.vercel.app' 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);
    
    // Join user to their own room for private messages
    socket.join(`user:${socket.userId}`);
    
    // Join user to nearby listings room
    if (socket.handshake.query.location) {
      const { lat, lng, radius = 10 } = socket.handshake.query;
      const locationRoom = `location:${Math.floor(lat)},${Math.floor(lng)}`;
      socket.join(locationRoom);
    }
    
    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
    
    // Handle new food listing creation
    socket.on('new-listing', async (listing) => {
      try {
        // Save listing to database first
        const newListing = new FoodListing({
          ...listing,
          userId: socket.userId
        });
        await newListing.save();
        
        // Broadcast to users within radius
        const locationRoom = `location:${Math.floor(listing.location.coordinates[1])},${Math.floor(listing.location.coordinates[0])}`;
        socket.to(locationRoom).emit('listing-added', {
          listing: newListing,
          user: {
            id: socket.userId,
            name: socket.user.name
          }
        });
        
        // Send notification to all nearby users
        const nearbyUsers = await User.find({
          'location.coordinates': {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [listing.location.coordinates[0], listing.location.coordinates[1]]
              },
              $maxDistance: 5000 // 5km radius
            }
          },
          _id: { $ne: new mongoose.Types.ObjectId(socket.userId) }
        });
        
        nearbyUsers.forEach(user => {
          if (connectedUsers.has(user._id.toString())) {
            io.to(connectedUsers.get(user._id.toString())).emit('notification', {
              type: 'new-listing',
              message: `New food available near you: ${listing.title}`,
              data: newListing
            });
          }
        });
      } catch (error) {
        console.error('Error broadcasting new listing:', error);
        socket.emit('error', { message: 'Failed to create and broadcast listing' });
      }
    });
    
    // Handle food reservation
    socket.on('reserve-listing', async ({ listingId }) => {
      try {
        const listing = await FoodListing.findById(listingId);
        
        if (!listing) {
          return socket.emit('error', { message: 'Listing not found' });
        }
        
        if (listing.status !== 'available') {
          return socket.emit('error', { message: 'Listing is no longer available' });
        }
        
        // Update listing status
        listing.status = 'reserved';
        listing.reservedBy = socket.userId;
        listing.reservedAt = new Date();
        await listing.save();
        
        // Notify the donor
        if (connectedUsers.has(listing.userId.toString())) {
          io.to(connectedUsers.get(listing.userId.toString())).emit('notification', {
            type: 'reservation',
            message: `${socket.user.name} has reserved your food: ${listing.title}`,
            data: {
              listingId: listing._id,
              title: listing.title,
              reservedBy: {
                id: socket.userId,
                name: socket.user.name
              }
            }
          });
        }
        
        // Confirm to the reserver
        socket.emit('reservation-confirmed', {
          listingId: listing._id,
          title: listing.title
        });
      } catch (error) {
        console.error('Error processing reservation:', error);
        socket.emit('error', { message: 'Failed to reserve listing' });
      }
    });
    
    // Handle direct messages
    socket.on('send-message', async ({ recipientId, content }) => {
      try {
        // Store message in database
        // (We'll implement Message model later)
        
        // Send to recipient if online
        if (connectedUsers.has(recipientId)) {
          io.to(connectedUsers.get(recipientId)).emit('new-message', {
            senderId: socket.userId,
            senderName: socket.user.name,
            content,
            timestamp: new Date()
          });
        }
        
        // Confirm delivery to sender
        socket.emit('message-sent', {
          recipientId,
          content,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  });
  
  return io;
}