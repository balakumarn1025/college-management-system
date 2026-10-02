import { Router } from "express";
import Department from "../models/Department.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    res.json(await Department.find().sort({ code: 1 }));
  } catch (e) { next(e); }
});

router.post("/", requireRoles("admin"), async (req, res, next) => {
  try {
    const d = await Department.create(req.body);
    res.status(201).json(d);
  } catch (e) { next(e); }
});

router.put("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const d = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!d) return res.status(404).json({ detail: "Department not found" });
    res.json(d);
  } catch (e) { next(e); }
});

router.delete("/:id", requireRoles("admin"), async (req, res, next) => {
  try {
    const d = await Department.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ detail: "Department not found" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;