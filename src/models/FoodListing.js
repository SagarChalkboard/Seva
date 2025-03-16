// src/models/FoodListing.js
import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema({
    // Basic Food Information
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
    foodType: {
        type: String,
        enum: ['prepared_meal', 'groceries', 'produce', 'bakery', 'canned', 'leftovers'],
        required: true
    },
    
    // Media
    photoUrl: {
        type: String,
        default: ''
    },
    
    // Location Information
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
        },
        radius: {
            type: Number,
            default: 50,  // Default privacy radius in meters
            min: 10,
            max: 500
        }
    },
    pickupInstructions: {
        type: String,
        default: ''
    },
    
    // Time Information
    availableUntil: { 
        type: Date, 
        required: true 
    },
    
    // Food Safety Information
    foodSafety: {
        storageType: {
            type: String,
            enum: ['refrigerated', 'frozen', 'room_temperature'],
            default: 'room_temperature'
        },
        allergens: [{
            type: String,
            enum: ['dairy', 'nuts', 'gluten', 'soy', 'shellfish', 'eggs', 'fish', 'none']
        }],
        dietaryInfo: [{
            type: String,
            enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free']
        }],
        preparedOn: {
            type: Date,
            default: null
        },
        bestByDate: {
            type: Date,
            default: null
        },
        safetyChecklist: {
            properlyStored: {
                type: Boolean,
                default: false
            },
            handlingProcedures: {
                type: Boolean,
                default: false
            },
            noSpoilage: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Additional Information
    notes: {
        type: String,
        default: ''
    },
    
    // Status
    status: {
        type: String,
        enum: ['available', 'reserved', 'completed'],
        default: 'available'
    },
    
    // References
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Add geospatial index for location-based queries
foodListingSchema.index({ location: '2dsphere' });

// Add virtual field to calculate distance (used in queries)
foodListingSchema.virtual('distance').get(function() {
    return this._distance;
});

// Add pre-save middleware to update timestamps
foodListingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add this index if not already present
foodListingSchema.index({ createdAt: -1 });

// Add this method to find nearby listings
foodListingSchema.statics.findNearby = async function(coords, maxDistance = 5000) {
    return this.find({
        status: 'available',
        availableUntil: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

export default mongoose.models.FoodListing || mongoose.model('FoodListing', foodListingSchema);