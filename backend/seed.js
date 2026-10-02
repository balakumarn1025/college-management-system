import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";

import User from "./src/models/User.js";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Admin from "./src/models/Admin.js";
import Department from "./src/models/Department.js";
import Course from "./src/models/Course.js";
import Subject from "./src/models/Subject.js";
import Classroom from "./src/models/Classroom.js";
import Timetable from "./src/models/Timetable.js";
import Attendance from "./src/models/Attendance.js";
import AttendanceHistory from "./src/models/AttendanceHistory.js";
import Notification from "./src/models/Notification.js";
import ChatbotMessage from "./src/models/ChatbotMessage.js";

import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/college_ms");
    console.log("[OK] MongoDB connected");

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Admin.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Classroom.deleteMany({}),
      Timetable.deleteMany({}),
      Attendance.deleteMany({}),
      AttendanceHistory.deleteMany({}),
      Notification.deleteMany({}),
      ChatbotMessage.deleteMany({}),
    ]);
    console.log("[OK] Collections cleared");

    console.log("Creating departments...");
    const deptCSE = await Department.create({
      code: "CSE", name: "Computer Science and Engineering", hod_name: "Dr. Kumar",
    });
    const deptECE = await Department.create({
      code: "ECE", name: "Electronics and Communication", hod_name: "Dr. Priya",
    });

    console.log("Creating courses...");
    const courseCSE = await Course.create({
      code: "BE-CSE", name: "B.E. Computer Science",
      department_id: deptCSE._id, duration_years: 4,
    });
    await Course.create({
      code: "BE-ECE", name: "B.E. Electronics",
      department_id: deptECE._id, duration_years: 4,
    });

    console.log("Creating subjects...");
    const subjMath = await Subject.create({
      code: "MA101", name: "Mathematics I", course_id: courseCSE._id, semester: 1, credits: 4,
    });
    const subjPhy = await Subject.create({
      code: "PH101", name: "Physics", course_id: courseCSE._id, semester: 1, credits: 4,
    });
    const subjChem = await Subject.create({
      code: "CH101", name: "Chemistry", course_id: courseCSE._id, semester: 1, credits: 3,
    });
    const subjEng = await Subject.create({
      code: "EN101", name: "English", course_id: courseCSE._id, semester: 1, credits: 3,
    });

    console.log("Creating classrooms...");
    const room101 = await Classroom.create({
      room_number: "101", building: "Main Block", capacity: 60,
    });
    const lab1 = await Classroom.create({
      room_number: "Lab1", building: "Science Block", capacity: 40,
    });

    console.log("Creating admin...");
    const adminDoc = await Admin.create({
      name: "Admin User", email: "admin@college.edu",
    });
    await User.create({
      email: "admin@college.edu",
      password_hash: await bcrypt.hash("admin123", 10),
      role: "admin", ref_id: adminDoc._id, is_active: true,
    });

    console.log("Creating teachers...");
    const teacher1 = await Teacher.create({
      teacher_id: "TCH001", name: "Teacher A",
      email: "teacherA@college.edu", phone: "9000000001",
      department_id: deptCSE._id, subject_ids: [subjMath._id], class_ids: ["CSE-1A"],
    });
    await User.create({
      email: "teacherA@college.edu",
      password_hash: await bcrypt.hash("teacher123", 10),
      role: "teacher", ref_id: teacher1._id, is_active: true,
    });

    const teacher2 = await Teacher.create({
      teacher_id: "TCH002", name: "Teacher B",
      email: "teacherB@college.edu", phone: "9000000002",
      department_id: deptCSE._id, subject_ids: [subjPhy._id], class_ids: ["CSE-1A"],
    });
    await User.create({
      email: "teacherB@college.edu",
      password_hash: await bcrypt.hash("teacher123", 10),
      role: "teacher", ref_id: teacher2._id, is_active: true,
    });

    const teacher3 = await Teacher.create({
      teacher_id: "TCH003", name: "Teacher C",
      email: "teacherC@college.edu", phone: "9000000003",
      department_id: deptCSE._id, subject_ids: [subjChem._id], class_ids: ["CSE-1A"],
    });
    await User.create({
      email: "teacherC@college.edu",
      password_hash: await bcrypt.hash("teacher123", 10),
      role: "teacher", ref_id: teacher3._id, is_active: true,
    });

    console.log("Creating students...");
    const studentsData = [
      ["STU001", "Arun", "arun@college.edu", "8000000001"],
      ["STU002", "Kumar", "kumar@college.edu", "8000000002"],
      ["STU003", "Ravi", "ravi@college.edu", "8000000003"],
      ["STU004", "Priya", "priya@college.edu", "8000000004"],
      ["STU005", "Divya", "divya@college.edu", "8000000005"],
    ];
    for (const [sid, name, email, phone] of studentsData) {
      const s = await Student.create({
        student_id: sid, name, email, phone,
        department_id: deptCSE._id, course_id: courseCSE._id,
        year: 1, semester: 1, section: "A",
        dob: "2005-01-01", address: "Chennai", profile_image: "",
      });
      await User.create({
        email, password_hash: await bcrypt.hash("student123", 10),
        role: "student", ref_id: s._id, is_active: true,
      });
    }

    console.log("Creating timetable...");
    const periods = [
      { period_number: 1, start_time: "09:00", end_time: "10:00", subject_id: subjMath._id, teacher_id: teacher1._id, room_id: room101._id },
      { period_number: 2, start_time: "10:00", end_time: "11:00", subject_id: subjPhy._id, teacher_id: teacher2._id, room_id: room101._id },
      { period_number: 3, start_time: "11:15", end_time: "12:15", subject_id: subjChem._id, teacher_id: teacher3._id, room_id: lab1._id },
      { period_number: 4, start_time: "12:15", end_time: "13:15", subject_id: subjEng._id, teacher_id: teacher1._id, room_id: room101._id },
    ];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    for (const day of days) {
      for (const p of periods) {
        await Timetable.create({
          class_id: "CSE-1A", day_of_week: day,
          period_number: p.period_number,
          start_time: p.start_time, end_time: p.end_time,
          subject_id: p.subject_id, teacher_id: p.teacher_id, room_id: p.room_id,
        });
      }
    }

    console.log("Creating sample attendance for today...");
    const today = new Date().toISOString().slice(0, 10);
    const students = await Student.find({ year: 1, section: "A" });

    for (const s of students) {
      const status = s.student_id === "STU001" ? "Absent" : "Present";
      await Attendance.create({
        student_id: s._id, teacher_id: teacher1._id, subject_id: subjMath._id,
        class_id: "CSE-1A", date: today, period_number: 1, status,
        reason: status === "Absent" ? "Arrived late" : null,
      });
    }
    for (const s of students) {
      await Attendance.create({
        student_id: s._id, teacher_id: teacher2._id, subject_id: subjPhy._id,
        class_id: "CSE-1A", date: today, period_number: 2, status: "Present",
      });
      await Attendance.create({
        student_id: s._id, teacher_id: teacher3._id, subject_id: subjChem._id,
        class_id: "CSE-1A", date: today, period_number: 3, status: "Present",
      });
      await Attendance.create({
        student_id: s._id, teacher_id: teacher1._id, subject_id: subjEng._id,
        class_id: "CSE-1A", date: today, period_number: 4, status: "Present",
      });
    }

    const arun = students.find((s) => s.student_id === "STU001");
    const arunPeriod1 = await Attendance.findOne({
      student_id: arun._id, date: today, period_number: 1,
    });
    if (arunPeriod1) {
      await AttendanceHistory.create({
        attendance_id: arunPeriod1._id, student_id: arun._id, subject_id: subjMath._id,
        date: today, period_number: 1,
        old_status: "Absent", new_status: "Present",
        reason: "Student arrived after attendance was initially taken",
        modified_by: teacher1._id,
      });
    }

    console.log("\n================================");
    console.log("[OK] Seed complete");
    console.log("================================");
    console.log("Login credentials:\n");
    console.log("  Admin:    admin@college.edu    / admin123");
    console.log("  Teacher:  teacherA@college.edu / teacher123");
    console.log("  Teacher:  teacherB@college.edu / teacher123");
    console.log("  Teacher:  teacherC@college.edu / teacher123");
    console.log("  Student:  arun@college.edu     / student123");
    console.log("================================\n");

    await mongoose.connection.close();
    console.log("[OK] Connection closed");
    process.exit(0);
  } catch (err) {
    console.error("[ERROR] Seed failed:", err.message);
    console.error(err.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();