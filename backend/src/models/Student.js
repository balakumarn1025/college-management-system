import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    year: { type: Number, default: 1 },
    semester: { type: Number, default: 1 },
    section: { type: String, default: "A" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    profile_image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);