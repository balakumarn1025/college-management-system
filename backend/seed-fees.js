import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import FeeStructure from "./src/models/FeeStructure.js";
import StudentFee from "./src/models/StudentFee.js";
import Student from "./src/models/Student.js";
import User from "./src/models/User.js";
import Notification from "./src/models/Notification.js";

dotenv.config({ path: fileURLToPath(new URL("./src/.env", import.meta.url)) });

const FEE_HEADS = [
  { name: "Tuition Fee",     amount: 15000, due_date: "2025-08-15" },
  { name: "Lab Fee",         amount: 3000,  due_date: "2025-08-15" },
  { name: "Library Fee",     amount: 2000,  due_date: "2025-08-15" },
  { name: "Sports Fee",      amount: 1000,  due_date: "2025-08-15" },
  { name: "Exam Fee",        amount: 2000,  due_date: "2025-11-01" },
  { name: "Development Fee", amount: 1000,  due_date: "2025-08-15" },
];

const ACADEMIC_YEAR = "2025-2026";
const SEMESTER = 1;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[OK] MongoDB connected\n");

  // 1. Create fee structures
  const structures = [];
  for (const head of FEE_HEADS) {
    let s = await FeeStructure.findOne({
      name: head.name,
      academic_year: ACADEMIC_YEAR,
      semester: SEMESTER,
    });
    if (!s) {
      s = await FeeStructure.create({
        ...head,
        description: head.name,
        academic_year: ACADEMIC_YEAR,
        semester: SEMESTER,
        is_mandatory: true,
        is_active: true,
      });
      console.log(`[+] Created structure: ${head.name} — ₹${head.amount}`);
    } else {
      console.log(`[=] Structure exists: ${head.name}`);
    }
    structures.push(s);
  }

  const totalPerStudent = structures.reduce((sum, s) => sum + s.amount, 0);
  console.log(`\n[+] Total per student: ₹${totalPerStudent.toLocaleString()}\n`);

  // 2. Get ALL students
  const students = await Student.find({});
  console.log(`[+] Found ${students.length} students\n`);

  if (students.length === 0) {
    console.error("[!] No students in DB. Run `npm run seed` first.");
    process.exit(1);
  }

  // 3. Assign each structure to each student
  let created = 0;
  let skipped = 0;

  for (const st of students) {
    for (const s of structures) {
      const exists = await StudentFee.findOne({
        student_id: st._id,
        fee_structure_id: s._id,
      });
      if (exists) {
        skipped++;
        continue;
      }
      await StudentFee.create({
        student_id: st._id,
        fee_structure_id: s._id,
        amount: s.amount,
        paid_amount: 0,
        status: "pending",
        due_date: s.due_date,
        academic_year: s.academic_year,
        semester: s.semester,
      });
      created++;
    }

    // Notify the student
    const user = await User.findOne({ ref_id: st._id, role: "student" });
    if (user) {
      await Notification.create({
        user_id: user._id,
        sent_by_role: "system",
        sent_by_name: "Accounts",
        title: "Fee Assigned for 2025-2026",
        message: `Total fee: ₹${totalPerStudent.toLocaleString()}. Please pay before 15-Aug-2025.`,
        type: "general",
      });
    }
  }

  console.log(`[OK] Created ${created} fee records`);
  console.log(`[OK] Skipped ${skipped} existing records`);
  console.log(`[OK] Each student owes: ₹${totalPerStudent.toLocaleString()}`);
  console.log(`[OK] Total expected revenue: ₹${(totalPerStudent * students.length).toLocaleString()}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("[ERROR]", e.message);
  process.exit(1);
});