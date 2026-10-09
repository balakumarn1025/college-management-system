import mongoose from "mongoose";

const schema = new mongoose.Schema({
  teacher_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  subject_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  class_ids: [String],
  profile_image: { type: String, default: "" },   // ← NEW
  bio: { type: String, default: "" },              // ← NEW (short intro)
  qualification: { type: String, default: "" },    // ← NEW (e.g. M.Tech)
  experience_years: { type: Number, default: 0 },  // ← NEW
}, { timestamps: true });

export default mongoose.model("Teacher", schema);