/*import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["192.168.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MongoDB Error: MONGO_URI is not defined");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;*/
import dns from "node:dns";
import mongoose from "mongoose";

// ======================================================
// DNS FIX
// Some networks/ISPs (and some serverless environments)
// don't reliably resolve MongoDB Atlas SRV records with
// the default resolver. Using public DNS (Google/Cloudflare)
// fixes this both locally and on Vercel.
// ======================================================
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ======================================================
// SERVERLESS-FRIENDLY CONNECTION CACHING
// ======================================================

let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MongoDB Error: MONGO_URI is not defined");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB Atlas Connected Successfully");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;