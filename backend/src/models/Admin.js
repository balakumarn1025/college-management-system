import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, unique: true, lowercase: true, sparse: true },
  phone: { type: String, default: "" },
  profile_image: { type: String, default: "" },   // ← NEW
  bio: { type: String, default: "" },              // ← NEW
}, { timestamps: true });

export default mongoose.model("Admin", schema);