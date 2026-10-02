import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    receipt_number: { type: String, required: true, unique: true },
    student_fee_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentFee", required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "card", "upi", "netbanking", "cheque", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    transaction_id: { type: String, default: null },          // for online payments
    reference_number: { type: String, default: null },        // cheque/UPI reference
    paid_at: { type: Date, default: Date.now },
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

feePaymentSchema.index({ student_id: 1, paid_at: -1 });

export default mongoose.model("FeePayment", feePaymentSchema);