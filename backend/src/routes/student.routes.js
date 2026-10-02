import { Router } from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const { search } = req.query;
    const q = {};
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    res.json(await Student.find(q).sort({ student_id: 1 }));
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ detail: "Not found" });
    res.json(s);
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const data = { ...req.body };
    const password = data.password || "student123";
    delete data.password;

    if (!data.student_id?.trim() || !data.name?.trim() || !data.email?.trim()) {
      return res.status(400).json({ detail: "Student ID, name, and email are required" });
    }

    if (await Student.findOne({ student_id: data.student_id }))
      return res.status(400).json({ detail: "Student ID exists" });
    if (await Student.findOne({ email: data.email }))
      return res.status(400).json({ detail: "Email exists" });

    const s = await Student.create(data);
    await User.create({
      email: data.email,
      password_hash: await bcrypt.hash(password, 10),
      role: "student",
      ref_id: s._id,
    });
    res.json(s);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.password;
    const s = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(s);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await User.deleteOne({ ref_id: req.params.id, role: "student" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;