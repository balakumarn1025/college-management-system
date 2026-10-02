import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Department from "../models/Department.js";
import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";
import AttendanceHistory from "../models/AttendanceHistory.js";
import Subject from "../models/Subject.js";
import { studentPercentage, percentageBySubject } from "./attendance.service.js";

export async function adminDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [total_students, total_teachers, total_departments, todays_classes, att] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Department.countDocuments(),
    Timetable.countDocuments({ day_of_week: dayName }),
    Attendance.find({ date: today }),
  ]);

  const present = att.filter(a => a.status === "Present").length;
  const absent = att.filter(a => a.status === "Absent").length;
  const late = att.filter(a => a.status === "Late").length;
  const leave = att.filter(a => a.status === "Leave").length;

  const modsRaw = await AttendanceHistory.find().sort({ createdAt: -1 }).limit(5).populate("student_id");
  const mods = modsRaw.map(m => ({
    student_name: m.student_id?.name || "",
    old_status: m.old_status,
    new_status: m.new_status,
    reason: m.reason,
    modified_at: m.createdAt,
  }));

  const deptRows = await Student.aggregate([
    { $group: { _id: "$department_id", count: { $sum: 1 } } },
  ]);
  const dept_chart = [];
  for (const r of deptRows) {
    const d = await Department.findById(r._id);
    dept_chart.push({ name: d?.code || "N/A", students: r.count });
  }

  return {
    total_students, total_teachers, total_departments,
    todays_classes, todays_attendance: att.length,
    present, absent, late, leave,
    recent_modifications: mods, department_chart: dept_chart,
  };
}

export async function teacherDashboard(teacherId) {
  const today = new Date().toISOString().slice(0, 10);
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) return { error: "Teacher not found" };

  const timetable = await Timetable.find({
    teacher_id: teacherId,
    day_of_week: dayName,
  }).sort({ period_number: 1 }).populate("subject_id");

  const classes_today = [];
  for (const t of timetable) {
    const done = await Attendance.countDocuments({
      teacher_id: teacherId,
      date: today,
      period_number: t.period_number,
      subject_id: t.subject_id,
    });
    classes_today.push({
      period: t.period_number,
      subject: t.subject_id?.name || "",
      class_id: t.class_id,
      start: t.start_time,
      end: t.end_time,
      attendance_done: done > 0,
    });
  }
  const pending_attendance = classes_today.filter(c => !c.attendance_done).length;

  const recent = await Attendance.find({ teacher_id: teacherId })
    .sort({ createdAt: -1 }).limit(10).populate("student_id");

  return {
    teacher_name: teacher.name,
    classes_today,
    classes_today_count: classes_today.length,
    pending_attendance,
    recent_attendance: recent.map(r => ({
      student_name: r.student_id?.name || "",
      student_code: r.student_id?.student_id || "",
      status: r.status,
      date: r.date,
      period: r.period_number,
    })),
  };
}

export async function studentDashboard(studentId) {
  const student = await Student.findById(studentId);
  if (!student) return { error: "Student not found" };

  const overall = await studentPercentage(studentId);
  const by_subject = await percentageBySubject(studentId);
  const low_attendance = by_subject.filter(s => s.percentage < 75);

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const all = await Timetable.find({ day_of_week: dayName }).populate("subject_id");
  const cls = `-${student.year}${student.section}`;
  const timetable_today = all
    .filter(t => t.class_id.endsWith(cls))
    .map(t => ({
      period: t.period_number,
      subject: t.subject_id?.name || "",
      start: t.start_time,
      end: t.end_time,
    }))
    .sort((a, b) => a.period - b.period);

  const recent = await Attendance.find({ student_id: studentId })
    .sort({ date: -1 }).limit(8).populate("subject_id");

  return {
    student_name: student.name,
    overall,
    by_subject,
    low_attendance,
    timetable_today,
    recent_attendance: recent.map(r => ({
      date: r.date,
      period: r.period_number,
      subject: r.subject_id?.name || "",
      status: r.status,
    })),
  };
}