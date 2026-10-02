import mongoose from "mongoose";
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  semester: Number,
  credits: { type: Number, default: 3 },
}, { timestamps: true });
export default mongoose.model("Subject", schema);