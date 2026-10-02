import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },       // "Tuition Fee"
    description: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    academic_year: { type: String, required: true },          // "2025-2026"
    semester: { type: Number, default: 1 },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    due_date: { type: String, required: true },               // YYYY-MM-DD
    is_mandatory: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feeStructureSchema.index({ academic_year: 1, semester: 1 });

export default mongoose.model("FeeStructure", feeStructureSchema);