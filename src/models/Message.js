// src/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create conversation index for querying messages between two users
messageSchema.index({ senderId: 1, recipientId: 1 });

// Create index for getting all messages for a user
messageSchema.index({ senderId: 1 });
messageSchema.index({ recipientId: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);