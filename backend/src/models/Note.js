import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // File info
    file_url: { type: String, required: true },        // e.g. "/uploads/notes/xxx.pdf"
    file_name: { type: String, required: true },        // original filename
    file_type: { type: String, default: "" },           // pdf, docx, etc.
    file_size: { type: Number, default: 0 },            // bytes

    // Classification
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    class_id: { type: String, default: "" },            // "CSE-1A"
    semester: { type: Number, default: 1 },
    academic_year: { type: String, default: "2025-2026" },
    unit: { type: String, default: "" },                // "Unit 1", "Chapter 2"

    // Ownership
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploaded_by_name: { type: String, default: "" },
    uploaded_by_role: {
      type: String,
      enum: ["admin", "teacher"],
      required: true,
    },

    // Stats
    download_count: { type: Number, default: 0 },
    is_published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

noteSchema.index({ subject_id: 1, class_id: 1 });
noteSchema.index({ uploaded_by: 1 });
noteSchema.index({ createdAt: -1 });

export default mongoose.model("Note", noteSchema);