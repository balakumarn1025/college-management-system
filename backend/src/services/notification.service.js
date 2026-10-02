import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

/**
 * Send notification to one specific student by their student_id (STU001)
 */
export async function sendToStudent({
  student_id,
  title,
  message,
  type = "announcement",
  sender,
}) {
  const student = await Student.findById(student_id);
  if (!student) throw Object.assign(new Error("Student not found"), { status: 404 });

  const user = await User.findOne({ ref_id: student._id, role: "student" });
  if (!user) throw Object.assign(new Error("Student user account not found"), { status: 404 });

  const notif = await Notification.create({
    user_id: user._id,
    sent_by: sender.sub,
    sent_by_name: sender.name || "Teacher",
    sent_by_role: sender.role,
    title,
    message,
    type,
  });

  return notif;
}

/**
 * Send notification to all students in a class (e.g., "CSE-1A")
 */
export async function sendToClass({
  class_id,
  title,
  message,
  type = "announcement",
  sender,
}) {
  // class_id format: "CSE-1A" → year=1, section=A
  const parts = class_id.split("-");
  if (parts.length !== 2) {
    throw Object.assign(new Error("Invalid class ID format"), { status: 400 });
  }
  const year = parseInt(parts[1][0]);
  const section = parts[1].slice(1);

  const students = await Student.find({ year, section });
  if (students.length === 0) {
    throw Object.assign(new Error("No students found in this class"), { status: 404 });
  }

  const userIds = await User.find({
    ref_id: { $in: students.map((s) => s._id) },
    role: "student",
  }).distinct("_id");

  const docs = userIds.map((uid) => ({
    user_id: uid,
    sent_by: sender.sub,
    sent_by_name: sender.name || "Teacher",
    sent_by_role: sender.role,
    title,
    message,
    type,
  }));

  const inserted = await Notification.insertMany(docs);
  return { sent: inserted.length, class_id };
}

/**
 * Send to all students (admin only typically)
 */
export async function sendToAllStudents({
  title,
  message,
  type = "announcement",
  sender,
}) {
  const users = await User.find({ role: "student" }).distinct("_id");
  if (users.length === 0) {
    throw Object.assign(new Error("No students found"), { status: 404 });
  }

  const docs = users.map((uid) => ({
    user_id: uid,
    sent_by: sender.sub,
    sent_by_name: sender.name || "Admin",
    sent_by_role: sender.role,
    title,
    message,
    type,
  }));

  const inserted = await Notification.insertMany(docs);
  return { sent: inserted.length };
}

/**
 * Get all notifications sent by a specific teacher
 */
export async function getSentNotifications(senderId, limit = 50) {
  const docs = await Notification.find({ sent_by: senderId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Group by (title + message + createdAt bucket) to show one row per send batch
  // Simpler: just return as-is
  return docs.map((d) => ({
    _id: d._id,
    title: d.title,
    message: d.message,
    type: d.type,
    is_read: d.is_read,
    createdAt: d.createdAt,
  }));
}

/**
 * Get summary of sent notification batches (grouped by minute)
 */
export async function getSentBatches(senderId) {
  const docs = await Notification.find({ sent_by: senderId })
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("user_id", "email")
    .lean();

  // Group by title + message + minute
  const groups = {};
  for (const d of docs) {
    const minute = new Date(d.createdAt).toISOString().slice(0, 16);
    const key = `${d.title}|${d.message}|${minute}`;
    if (!groups[key]) {
      groups[key] = {
        title: d.title,
        message: d.message,
        type: d.type,
        createdAt: d.createdAt,
        recipients: [],
      };
    }
    groups[key].recipients.push({
      email: d.user_id?.email,
      is_read: d.is_read,
    });
  }

  return Object.values(groups).map((g) => ({
    ...g,
    recipient_count: g.recipients.length,
    read_count: g.recipients.filter((r) => r.is_read).length,
  }));
}