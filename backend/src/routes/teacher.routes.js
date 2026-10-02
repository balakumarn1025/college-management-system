import { Router } from "express";
import bcrypt from "bcryptjs";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

// GET /api/teachers?search=...
router.get("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const { search } = req.query;
    const q = {};
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { teacher_id: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const list = await Teacher.find(q)
      .populate("department_id", "code name")
      .populate("subject_ids", "code name")
      .sort({ teacher_id: 1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// GET /api/teachers/:id
router.get("/:id", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const t = await Teacher.findById(req.params.id)
      .populate("department_id", "code name")
      .populate("subject_ids", "code name");
    if (!t) return res.status(404).json({ detail: "Teacher not found" });
    res.json(t);
  } catch (e) {
    next(e);
  }
});

// POST /api/teachers
router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const data = { ...req.body };
    const password = data.password || "teacher123";
    delete data.password;

    if (await Teacher.findOne({ teacher_id: data.teacher_id })) {
      return res.status(400).json({ detail: "Teacher ID already exists" });
    }
    if (await Teacher.findOne({ email: data.email })) {
      return res.status(400).json({ detail: "Teacher email already exists" });
    }
    if (await User.findOne({ email: data.email })) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    // Normalize arrays
    if (!Array.isArray(data.subject_ids)) data.subject_ids = [];
    if (!Array.isArray(data.class_ids)) data.class_ids = [];

    const t = await Teacher.create(data);

    await User.create({
      email: data.email,
      password_hash: await bcrypt.hash(password, 10),
      role: "teacher",
      ref_id: t._id,
      is_active: true,
    });

    res.status(201).json(t);
  } catch (e) {
    next(e);
  }
});

// PUT /api/teachers/:id
router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.password;

    if (Array.isArray(data.subject_ids)) {
      data.subject_ids = data.subject_ids.filter(Boolean);
    }
    if (Array.isArray(data.class_ids)) {
      data.class_ids = data.class_ids.filter(Boolean);
    }

    const t = await Teacher.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!t) return res.status(404).json({ detail: "Teacher not found" });

    // Keep user email in sync
    if (data.email) {
      await User.updateOne(
        { ref_id: t._id, role: "teacher" },
        { $set: { email: data.email } }
      );
    }

    res.json(t);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/teachers/:id
router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const t = await Teacher.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ detail: "Teacher not found" });

    await User.deleteOne({ ref_id: t._id, role: "teacher" });

    res.json({ message: "Teacher deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;