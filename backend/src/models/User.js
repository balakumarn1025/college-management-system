import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  ref_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);