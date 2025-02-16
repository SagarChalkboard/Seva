// src/models/Listing.js
import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    availableUntil: {
        type: Date,
        required: true
    },
    notes: String,
    status: {
        type: String,
        enum: ['available', 'reserved', 'completed'],
        default: 'available'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Listing || mongoose.model('Listing', listingSchema);