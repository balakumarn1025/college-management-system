import { Router } from "express";
import Timetable from "../models/Timetable.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

// GET /api/timetable?class_id=&teacher_id=&day=
router.get("/", async (req, res, next) => {
  try {
    const q = {};
    if (req.query.class_id) q.class_id = req.query.class_id;
    if (req.query.teacher_id) q.teacher_id = req.query.teacher_id;
    if (req.query.day) q.day_of_week = req.query.day;

    const list = await Timetable.find(q)
      .populate("subject_id", "code name")
      .populate("teacher_id", "name teacher_id")
      .populate("room_id", "room_number building")
      .sort({ day_of_week: 1, period_number: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

// GET /api/timetable/class/:classId
router.get("/class/:classId", async (req, res, next) => {
  try {
    const q = { class_id: req.params.classId };
    if (req.query.day) q.day_of_week = req.query.day;
    const list = await Timetable.find(q)
      .populate("subject_id", "code name")
      .populate("teacher_id", "name teacher_id")
      .populate("room_id", "room_number building")
      .sort({ day_of_week: 1, period_number: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

// GET /api/timetable/teacher/:teacherId
router.get("/teacher/:teacherId", async (req, res, next) => {
  try {
    const q = { teacher_id: req.params.teacherId };
    if (req.query.day) q.day_of_week = req.query.day;
    const list = await Timetable.find(q)
      .populate("subject_id", "code name")
      .populate("room_id", "room_number building")
      .sort({ day_of_week: 1, period_number: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const t = await Timetable.create(req.body);
    res.status(201).json(t);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const t = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!t) return res.status(404).json({ detail: "Timetable entry not found" });
    res.json(t);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;