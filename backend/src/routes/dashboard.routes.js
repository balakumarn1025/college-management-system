import { Router } from "express";
import {
  adminDashboard,
  teacherDashboard,
  studentDashboard,
} from "../services/dashboard.service.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/admin", requireRoles("admin"), async (req, res, next) => {
  try { res.json(await adminDashboard()); } catch (e) { next(e); }
});

router.get("/teacher", requireRoles("teacher"), async (req, res, next) => {
  try { res.json(await teacherDashboard(req.user.ref_id)); } catch (e) { next(e); }
});

router.get("/student", requireRoles("student"), async (req, res, next) => {
  try { res.json(await studentDashboard(req.user.ref_id)); } catch (e) { next(e); }
});

export default router;