import mongoose from "mongoose";
const schema = new mongoose.Schema({
  attendance_id: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  date: String,
  period_number: Number,
  old_status: String,
  new_status: String,
  reason: String,
  modified_by: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });
export default mongoose.model("AttendanceHistory", schema);