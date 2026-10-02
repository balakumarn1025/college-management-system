import { Router } from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import { uploadNote } from "../middleware/upload.js";
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  incrementDownload,
  getNotesForStudent,
} from "../services/note.service.js";
import Student from "../models/Student.js";

const router = Router();
router.use(authRequired);

// GET /api/notes — admin/teacher see all, with filters
router.get("/", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const filter = {
      subject_id: req.query.subject_id,
      class_id: req.query.class_id,
      semester: req.query.semester,
      search: req.query.search,
    };
    // Teacher sees only their own by default
    if (req.user.role === "teacher" && req.query.mine === "1") {
      filter.uploaded_by = req.user.sub;
    }
    res.json(await listNotes(filter));
  } catch (e) { next(e); }
});

// GET /api/notes/my-class — student view
router.get("/my-class", requireRoles("student"), async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.ref_id);
    res.json(await getNotesForStudent(student));
  } catch (e) { next(e); }
});

// GET /api/notes/:id
router.get("/:id", async (req, res, next) => {
  try { res.json(await getNote(req.params.id)); } catch (e) { next(e); }
});

// POST /api/notes — upload (admin/teacher)
router.post(
  "/",
  requireRoles("admin", "teacher"),
  uploadNote.single("file"),
  async (req, res, next) => {
    try {
      // Fetch uploader name
      let name = req.user.email;
      const Teacher = (await import("../models/Teacher.js")).default;
      const Admin = (await import("../models/Admin.js")).default;
      if (req.user.role === "teacher" && req.user.ref_id) {
        name = (await Teacher.findById(req.user.ref_id))?.name || name;
      } else if (req.user.role === "admin" && req.user.ref_id) {
        name = (await Admin.findById(req.user.ref_id))?.name || name;
      }

      res.status(201).json(await createNote({
        body: req.body,
        file: req.file,
        user: req.user,
        name,
      }));
    } catch (e) { next(e); }
  }
);

// PUT /api/notes/:id
router.put("/:id", requireRoles("admin", "teacher"), async (req, res, next) => {
  try { res.json(await updateNote(req.params.id, req.body, req.user)); } catch (e) { next(e); }
});

// DELETE /api/notes/:id
router.delete("/:id", requireRoles("admin", "teacher"), async (req, res, next) => {
  try { res.json(await deleteNote(req.params.id, req.user)); } catch (e) { next(e); }
});

// POST /api/notes/:id/download — increments counter
router.post("/:id/download", async (req, res, next) => {
  try {
    await incrementDownload(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;