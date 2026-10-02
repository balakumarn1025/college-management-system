import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[OK] MongoDB connected");
  } catch (err) {
    console.error("[ERROR] MongoDB connection failed:", err.message);
    process.exit(1);
  }
}