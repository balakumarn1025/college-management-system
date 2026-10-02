import mongoose from "mongoose";
const schema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  class_id: String,
  date: { type: String, required: true }, // YYYY-MM-DD
  period_number: { type: Number, required: true },
  status: { type: String, enum: ["Present", "Absent", "Late", "Leave"], required: true },
  reason: String,
  modified_by: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });
schema.index({ student_id: 1, date: 1, period_number: 1, subject_id: 1 }, { unique: true });
export default mongoose.model("Attendance", schema);