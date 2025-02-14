// src/lib/mongodb.js
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    // Instead of throwing an error, provide a default or log a warning
    console.warn('No MONGODB_URI found, checking connection string');
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Sagar:Ilovecoding786@clusterfood.nzvnq.mongodb.net/?retryWrites=true&w=majority&appName=ClusterFood";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    try {
        if (cached.conn) {
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
            };

            cached.promise = mongoose.connect(MONGODB_URI, opts);
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Instead of failing, return null or handle the error gracefully
        return null;
    }
}

export default dbConnect;