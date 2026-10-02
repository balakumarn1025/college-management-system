import Note from "../models/Note.js";
import Subject from "../models/Subject.js";
import fs from "fs";
import path from "path";

export async function listNotes({
  subject_id,
  class_id,
  semester,
  search,
  uploaded_by,
} = {}) {
  const q = {};
  if (subject_id) q.subject_id = subject_id;
  if (class_id) q.class_id = class_id;
  if (semester) q.semester = Number(semester);
  if (uploaded_by) q.uploaded_by = uploaded_by;
  if (search) q.title = { $regex: search, $options: "i" };

  const notes = await Note.find(q)
    .populate("subject_id", "code name")
    .sort({ createdAt: -1 });

  return notes;
}

export async function getNote(id) {
  const n = await Note.findById(id).populate("subject_id", "code name");
  if (!n) throw Object.assign(new Error("Note not found"), { status: 404 });
  return n;
}

export async function createNote({ body, file, user, name }) {
  const { title, description, subject_id, class_id, semester, unit, academic_year } = body;

  if (!title) throw Object.assign(new Error("Title is required"), { status: 400 });
  if (!subject_id) throw Object.assign(new Error("Subject is required"), { status: 400 });
  if (!file) throw Object.assign(new Error("File is required"), { status: 400 });

  const subject = await Subject.findById(subject_id);
  if (!subject) {
    // Cleanup file
    try { fs.unlinkSync(file.path); } catch {}
    throw Object.assign(new Error("Subject not found"), { status: 404 });
  }

  const ext = path.extname(file.originalname).replace(".", "").toLowerCase();

  const note = await Note.create({
    title,
    description: description || "",
    file_url: `/uploads/notes/${file.filename}`,
    file_name: file.originalname,
    file_type: ext,
    file_size: file.size,
    subject_id,
    class_id: class_id || "",
    semester: semester ? Number(semester) : 1,
    unit: unit || "",
    academic_year: academic_year || "2025-2026",
    uploaded_by: user.sub,
    uploaded_by_name: name || user.email,
    uploaded_by_role: user.role,
  });

  return getNote(note._id);
}

export async function updateNote(id, body, user) {
  const n = await Note.findById(id);
  if (!n) throw Object.assign(new Error("Note not found"), { status: 404 });

  // Only uploader or admin can edit
  if (user.role !== "admin" && String(n.uploaded_by) !== String(user.sub)) {
    throw Object.assign(new Error("Not allowed to edit this note"), { status: 403 });
  }

  const allowed = ["title", "description", "class_id", "semester", "unit", "academic_year", "is_published"];
  for (const key of allowed) {
    if (body[key] !== undefined) n[key] = body[key];
  }
  await n.save();
  return getNote(id);
}

export async function deleteNote(id, user) {
  const n = await Note.findById(id);
  if (!n) throw Object.assign(new Error("Note not found"), { status: 404 });

  if (user.role !== "admin" && String(n.uploaded_by) !== String(user.sub)) {
    throw Object.assign(new Error("Not allowed to delete this note"), { status: 403 });
  }

  // Delete physical file
  const filePath = path.join(process.cwd(), n.file_url);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

  await Note.findByIdAndDelete(id);
  return { message: "Deleted" };
}

export async function incrementDownload(id) {
  await Note.updateOne({ _id: id }, { $inc: { download_count: 1 } });
}

export async function getNotesForStudent(student) {
  // Determine class_id like "CSE-1A"
  const class_id = student?.section
    ? `CSE-${student.year}${student.section}`  // adjust prefix if needed
    : null;

  const q = { is_published: true };
  if (class_id) {
    q.$or = [
      { class_id },
      { class_id: "" },           // shared with all
      { class_id: null },
    ];
  }

  return Note.find(q)
    .populate("subject_id", "code name")
    .sort({ createdAt: -1 });
}