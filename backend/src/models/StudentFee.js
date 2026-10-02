import mongoose from "mongoose";

const studentFeeSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fee_structure_id: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", required: true },
    amount: { type: Number, required: true },                 // total amount due
    paid_amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },
    due_date: { type: String, required: true },
    academic_year: { type: String, required: true },
    semester: { type: Number, default: 1 },
  },
  { timestamps: true }
);

studentFeeSchema.index({ student_id: 1, fee_structure_id: 1 }, { unique: true });
studentFeeSchema.index({ status: 1 });
studentFeeSchema.index({ student_id: 1, status: 1 });

studentFeeSchema.virtual("balance").get(function () {
  return Math.max(0, this.amount - this.paid_amount);
});

export default mongoose.model("StudentFee", studentFeeSchema);