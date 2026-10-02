import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ["user", "assistant"] },
  message: String,
}, { timestamps: true });
export default mongoose.model("ChatbotMessage", schema);