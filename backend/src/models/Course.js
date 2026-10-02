import mongoose from "mongoose";
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  duration_years: { type: Number, default: 4 },
}, { timestamps: true });
export default mongoose.model("Course", schema);