import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },
  servings: {
    type: Number
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  availableUntil: {
    type: Date,
    required: [true, 'Availability time is required']
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'completed'],
    default: 'available'
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.FoodListing || mongoose.model('FoodListing', foodListingSchema);
