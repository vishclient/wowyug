import mongoose from "mongoose";

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || "";

// In development, allow the app to continue without MongoDB
const isDev = import.meta.env.DEV;

if (!MONGODB_URI && !isDev) {
  throw new Error("Please define the VITE_MONGODB_URI environment variable");
}

/**
 * We use a cached connection to maintain it across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Use globalThis which is available in both browser and Node environments
const globalAny = globalThis as any;
let cached = globalAny.mongoose;

if (!cached) {
  cached = globalAny.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If we're in development and don't have a MongoDB URI, return a mock connection
  if (!MONGODB_URI && import.meta.env.DEV) {
    console.warn("No MongoDB URI provided. Using mock database connection.");
    return { connection: { readyState: 1 } };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
