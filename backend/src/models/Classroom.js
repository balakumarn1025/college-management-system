import mongoose from "mongoose";
const schema = new mongoose.Schema({
  room_number: { type: String, required: true, unique: true },
  building: String,
  capacity: { type: Number, default: 60 },
}, { timestamps: true });
export default mongoose.model("Classroom", schema);