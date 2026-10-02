import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who receives it
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who sent it (null for system-generated)
    sent_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sent_by_name: { type: String, default: "System" },
    sent_by_role: {
      type: String,
      enum: ["admin", "teacher", "system"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "attendance", "warning", "modification", "announcement"],
      default: "general",
    },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ sent_by: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);