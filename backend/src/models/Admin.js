import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
}, { timestamps: true });
export default mongoose.model("Admin", schema);