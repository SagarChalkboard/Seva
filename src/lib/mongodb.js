import mongoose from 'mongoose';

// Get the connection string from environment variable
let MONGODB_URI = process.env.MONGODB_URI;

// If we're in development, modify the connection string
if (process.env.NODE_ENV !== 'production') {
    // Strip any existing query parameters
    const baseUri = MONGODB_URI.split('?')[0];
    // Add development-specific parameters
    MONGODB_URI = `${baseUri}?ssl=true&tlsAllowInvalidCertificates=true&directConnection=true`;
}

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Development specific options
            ...(process.env.NODE_ENV !== 'production' && {
                ssl: true,
                tlsAllowInvalidCertificates: true,
                directConnection: true
            })
        };

        try {
            console.log('Connecting to MongoDB...');
            cached.promise = mongoose.connect(MONGODB_URI, opts);
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connected successfully!');
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection failed:', e);
        throw e;
    }
}

export default dbConnect;