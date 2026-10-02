import mongoose from "mongoose";

const schema = new mongoose.Schema({
  teacher_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  subject_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  class_ids: [String],
}, { timestamps: true });

export default mongoose.model("Teacher", schema);