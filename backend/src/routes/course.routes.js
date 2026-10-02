import { Router } from "express";
import Course from "../models/Course.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const q = {};
    if (req.query.department_id) q.department_id = req.query.department_id;
    const list = await Course.find(q)
      .populate("department_id", "code name")
      .sort({ code: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const c = await Course.create(req.body);
    res.status(201).json(c);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const c = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!c) return res.status(404).json({ detail: "Course not found" });
    res.json(c);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;