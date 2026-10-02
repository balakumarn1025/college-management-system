import { Router } from "express";
import Subject from "../models/Subject.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const q = {};
    if (req.query.course_id) q.course_id = req.query.course_id;
    if (req.query.semester) q.semester = Number(req.query.semester);
    const list = await Subject.find(q)
      .populate("course_id", "code name")
      .sort({ code: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const s = await Subject.create(req.body);
    res.status(201).json(s);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const s = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!s) return res.status(404).json({ detail: "Subject not found" });
    res.json(s);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;