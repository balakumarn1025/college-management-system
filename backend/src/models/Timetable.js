import mongoose from "mongoose";
const schema = new mongoose.Schema({
  class_id: { type: String, required: true },
  day_of_week: { type: String, required: true },
  period_number: { type: Number, required: true },
  start_time: String,
  end_time: String,
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
}, { timestamps: true });
schema.index({ class_id: 1, day_of_week: 1, period_number: 1 }, { unique: true });
export default mongoose.model("Timetable", schema);