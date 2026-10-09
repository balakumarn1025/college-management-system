import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";
import Department from "../models/Department.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import fs from "fs";
import path from "path";

const MODEL_BY_ROLE = { student: Student, teacher: Teacher, admin: Admin };

/**
 * Get full profile for the logged-in user.
 */
export async function getProfile(user) {
  const Model = MODEL_BY_ROLE[user.role];
  if (!Model) throw Object.assign(new Error("Invalid role"), { status: 400 });

  let profile = null;
  if (user.ref_id) {
    profile = await Model.findById(user.ref_id).lean();
  }

  // If no ref_id yet (e.g., admin user without a profile doc), create one lazily
  if (!profile) {
    const created = await Model.create({
      email: user.email,
      name: user.email,
    });
    profile = created.toObject();
    await User.updateOne({ _id: user.sub }, { $set: { ref_id: created._id } });
  }

  // Enrich with populated fields
  if (user.role === "student" && profile.department_id) {
    profile.department = await Department.findById(profile.department_id).lean();
  }
  if (user.role === "student" && profile.course_id) {
    profile.course = await Course.findById(profile.course_id).lean();
  }
  if (user.role === "teacher" && profile.department_id) {
    profile.department = await Department.findById(profile.department_id).lean();
  }
  if (user.role === "teacher" && profile.subject_ids?.length) {
    profile.subjects = await Subject.find({ _id: { $in: profile.subject_ids } }).lean();
  }

  return {
    role: user.role,
    email: user.email,
    ...profile,
  };
}

/**
 * Update profile fields. Only allowed fields per role.
 */
export async function updateProfile(user, body) {
  const Model = MODEL_BY_ROLE[user.role];
  if (!Model) throw Object.assign(new Error("Invalid role"), { status: 400 });

  const ALLOWED = {
    student: ["name", "phone", "dob", "address", "section", "year", "semester"],
    teacher: ["name", "phone", "bio", "qualification", "experience_years"],
    admin: ["name", "phone", "bio"],
  };

  const payload = {};
  for (const key of ALLOWED[user.role]) {
    if (body[key] !== undefined) payload[key] = body[key];
  }

  if (Object.keys(payload).length === 0) {
    throw Object.assign(new Error("No valid fields to update"), { status: 400 });
  }

  const updated = await Model.findByIdAndUpdate(user.ref_id, payload, {
    new: true,
    runValidators: true,
  });

  return updated;
}

/**
 * Update profile image. Deletes the old file first.
 */
export async function updateProfileImage(user, file) {
  if (!file) throw Object.assign(new Error("No file uploaded"), { status: 400 });

  const Model = MODEL_BY_ROLE[user.role];
  const current = await Model.findById(user.ref_id);

  // Delete old image
  if (current?.profile_image) {
    const oldPath = path.join(process.cwd(), current.profile_image);
    try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch {}
  }

  const url = `/uploads/profiles/${file.filename}`;
  const updated = await Model.findByIdAndUpdate(
    user.ref_id,
    { profile_image: url },
    { new: true }
  );

  return { profile_image: updated.profile_image };
}

/**
 * Change password.
 */
export async function changePassword(user, currentPassword, newPassword) {
  const bcrypt = (await import("bcryptjs")).default;
  if (!newPassword || newPassword.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });
  }

  const u = await User.findById(user.sub);
  if (!u) throw Object.assign(new Error("User not found"), { status: 404 });

  const ok = await bcrypt.compare(currentPassword, u.password_hash);
  if (!ok) throw Object.assign(new Error("Current password is incorrect"), { status: 400 });

  u.password_hash = await bcrypt.hash(newPassword, 10);
  await u.save();

  return { message: "Password updated" };
}