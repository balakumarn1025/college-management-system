import FeeStructure from "../models/FeeStructure.js";
import StudentFee from "../models/StudentFee.js";
import FeePayment from "../models/FeePayment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ---------- Fee Structures ----------
export async function listStructures(filter = {}) {
  return FeeStructure.find(filter).sort({ academic_year: -1, semester: 1 });
}

export async function createStructure(data) {
  return FeeStructure.create(data);
}

export async function updateStructure(id, data) {
  const s = await FeeStructure.findByIdAndUpdate(id, data, { new: true });
  if (!s) throw Object.assign(new Error("Fee structure not found"), { status: 404 });
  return s;
}

export async function deleteStructure(id) {
  const linked = await StudentFee.countDocuments({ fee_structure_id: id });
  if (linked > 0) {
    throw Object.assign(
      new Error(`Cannot delete — ${linked} student(s) already assigned to this fee`),
      { status: 400 }
    );
  }
  await FeeStructure.findByIdAndDelete(id);
  return { message: "Deleted" };
}

// ---------- Assign structure to students ----------
export async function assignStructure(feeStructureId, { student_ids = [], class_id, year, section }) {
  const structure = await FeeStructure.findById(feeStructureId);
  if (!structure) throw Object.assign(new Error("Fee structure not found"), { status: 404 });

  let students = [];
  if (student_ids.length > 0) {
    students = await Student.find({ _id: { $in: student_ids } });
  } else if (class_id) {
    // class_id like "CSE-1A"
    const parts = class_id.split("-");
    const y = parseInt(parts[1][0]);
    const sec = parts[1].slice(1);
    students = await Student.find({ year: y, section: sec });
  } else if (year && section) {
    students = await Student.find({ year, section });
  } else {
    students = await Student.find();
  }

  if (students.length === 0) {
    throw Object.assign(new Error("No students matched"), { status: 404 });
  }

  const docs = [];
  const skipped = [];
  for (const s of students) {
    const exists = await StudentFee.findOne({
      student_id: s._id,
      fee_structure_id: structure._id,
    });
    if (exists) {
      skipped.push(s.student_id);
      continue;
    }
    docs.push({
      student_id: s._id,
      fee_structure_id: structure._id,
      amount: structure.amount,
      due_date: structure.due_date,
      academic_year: structure.academic_year,
      semester: structure.semester,
    });
  }

  if (docs.length === 0) {
    throw Object.assign(new Error("All matched students already assigned"), { status: 400 });
  }

  await StudentFee.insertMany(docs);

  // Notify students
  const userIds = await User.find({
    ref_id: { $in: students.map((s) => s._id) },
    role: "student",
  }).distinct("_id");

  const notifications = userIds.map((uid) => ({
    user_id: uid,
    sent_by_role: "system",
    sent_by_name: "Accounts",
    title: "New Fee Assigned",
    message: `${structure.name} — ₹${structure.amount.toLocaleString()} due by ${structure.due_date}`,
    type: "general",
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return { assigned: docs.length, skipped: skipped.length };
}

// ---------- Student fees ----------
export async function listStudentFees(filter = {}) {
  return StudentFee.find(filter)
    .populate("student_id", "student_id name email year section")
    .populate("fee_structure_id", "name amount due_date academic_year semester")
    .sort({ due_date: 1 });
}

export async function getStudentFeeSummary(studentId) {
  const fees = await StudentFee.find({ student_id: studentId })
    .populate("fee_structure_id", "name description due_date academic_year semester")
    .sort({ due_date: 1 });

  const total = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paid_amount, 0);
  const pending = total - paid;

  // Update overdue status
  const today = new Date().toISOString().slice(0, 10);
  for (const f of fees) {
    if (f.status !== "paid" && f.due_date < today && f.status !== "overdue") {
      f.status = "overdue";
      await f.save();
    }
  }

  return {
    fees,
    summary: {
      total,
      paid,
      pending,
      status: pending === 0 ? "paid" : paid > 0 ? "partial" : "pending",
    },
  };
}

// ---------- Payments ----------
function generateReceipt() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${y}${m}${day}-${rand}`;
}

export async function recordPayment({
  student_fee_id,
  amount,
  method,
  transaction_id = null,
  reference_number = null,
  notes = "",
  recorded_by,
}) {
  if (!["cash", "card", "upi", "netbanking", "cheque", "online"].includes(method)) {
    throw Object.assign(new Error("Invalid payment method"), { status: 400 });
  }
  if (amount <= 0) {
    throw Object.assign(new Error("Amount must be greater than 0"), { status: 400 });
  }

  const sf = await StudentFee.findById(student_fee_id);
  if (!sf) throw Object.assign(new Error("Student fee record not found"), { status: 404 });

  const balance = sf.amount - sf.paid_amount;
  if (amount > balance) {
    throw Object.assign(
      new Error(`Amount exceeds balance. Remaining: ₹${balance}`),
      { status: 400 }
    );
  }

  // Create payment
  const payment = await FeePayment.create({
    receipt_number: generateReceipt(),
    student_fee_id: sf._id,
    student_id: sf.student_id,
    amount,
    method,
    status: "success",
    transaction_id,
    reference_number,
    recorded_by,
    notes,
  });

  // Update student fee
  sf.paid_amount += amount;
  if (sf.paid_amount >= sf.amount) {
    sf.status = "paid";
  } else {
    sf.status = "partial";
  }
  await sf.save();

  // Notify student
  const user = await User.findOne({ ref_id: sf.student_id, role: "student" });
  if (user) {
    await Notification.create({
      user_id: user._id,
      sent_by_role: "system",
      sent_by_name: "Accounts",
      title: "Fee Payment Received",
      message: `₹${amount.toLocaleString()} received via ${method.toUpperCase()}. Receipt: ${payment.receipt_number}`,
      type: "general",
    });
  }

  return payment;
}

export async function listPayments(filter = {}) {
  return FeePayment.find(filter)
    .populate("student_id", "student_id name email")
    .populate({
      path: "student_fee_id",
      populate: { path: "fee_structure_id", select: "name" },
    })
    .sort({ paid_at: -1 })
    .limit(500);
}

export async function getPayment(id) {
  const p = await FeePayment.findById(id)
    .populate("student_id", "student_id name email year section")
    .populate({
      path: "student_fee_id",
      populate: { path: "fee_structure_id", select: "name description academic_year semester" },
    });
  if (!p) throw Object.assign(new Error("Payment not found"), { status: 404 });
  return p;
}

// ---------- Reports ----------
export async function collectionSummary({ from, to } = {}) {
  const match = {};
  if (from || to) {
    match.paid_at = {};
    if (from) match.paid_at.$gte = new Date(from);
    if (to) match.paid_at.$lte = new Date(to);
  }

  const byMethod = await FeePayment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$method",
        count: { $sum: 1 },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const totalCollected = byMethod.reduce((s, r) => s + r.total, 0);

  // Pending amount across all students
  const pendingAgg = await StudentFee.aggregate([
    {
      $group: {
        _id: null,
        totalDue: { $sum: "$amount" },
        totalPaid: { $sum: "$paid_amount" },
      },
    },
  ]);
  const totalDue = pendingAgg[0]?.totalDue || 0;
  const totalPaid = pendingAgg[0]?.totalPaid || 0;

  return {
    total_collected: totalCollected,
    total_due: totalDue,
    total_paid: totalPaid,
    pending: totalDue - totalPaid,
    by_method: byMethod.map((m) => ({
      method: m._id,
      count: m.count,
      total: m.total,
    })),
  };
}