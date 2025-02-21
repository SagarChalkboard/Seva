// src/models/FoodListing.js
import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema({
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
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    availableUntil: { 
        type: Date, 
        required: true 
    },
    notes: String,
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'completed'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add geospatial index for location-based queries
foodListingSchema.index({ location: '2dsphere' });

export default mongoose.models.FoodListing || mongoose.model('FoodListing', foodListingSchema);