import { Router } from "express";
import Classroom from "../models/Classroom.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    res.json(await Classroom.find().sort({ room_number: 1 }));
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const c = await Classroom.create(req.body);
    res.status(201).json(c);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const c = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!c) return res.status(404).json({ detail: "Classroom not found" });
    res.json(c);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;