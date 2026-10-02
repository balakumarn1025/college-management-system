import { Router } from "express";
import {
  listStructures,
  createStructure,
  updateStructure,
  deleteStructure,
  assignStructure,
  listStudentFees,
  getStudentFeeSummary,
  recordPayment,
  listPayments,
  getPayment,
  collectionSummary,
} from "../services/fee.service.js";
import { authRequired, requireRoles } from "../middleware/auth.js";
import StudentFee from "../models/StudentFee.js";

const router = Router();
router.use(authRequired);

// ---------- Fee Structures ----------
router.get("/structures", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academic_year) filter.academic_year = req.query.academic_year;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    res.json(await listStructures(filter));
  } catch (e) { next(e); }
});

router.post("/structures", requireRoles("admin"), async (req, res, next) => {
  try { res.status(201).json(await createStructure(req.body)); } catch (e) { next(e); }
});

router.put("/structures/:id", requireRoles("admin"), async (req, res, next) => {
  try { res.json(await updateStructure(req.params.id, req.body)); } catch (e) { next(e); }
});

router.delete("/structures/:id", requireRoles("admin"), async (req, res, next) => {
  try { res.json(await deleteStructure(req.params.id)); } catch (e) { next(e); }
});

router.post("/structures/:id/assign", requireRoles("admin"), async (req, res, next) => {
  try { res.json(await assignStructure(req.params.id, req.body)); } catch (e) { next(e); }
});

// ---------- Student Fees ----------
router.get("/student-fees", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student_id) filter.student_id = req.query.student_id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academic_year) filter.academic_year = req.query.academic_year;
    res.json(await listStudentFees(filter));
  } catch (e) { next(e); }
});

router.get("/my-fees", async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ detail: "Only students can view their own fees" });
    }
    res.json(await getStudentFeeSummary(req.user.ref_id));
  } catch (e) { next(e); }
});

router.get("/student-fees/:studentId/summary", requireRoles("admin", "teacher"), async (req, res, next) => {
  try { res.json(await getStudentFeeSummary(req.params.studentId)); } catch (e) { next(e); }
});

// ---------- Payments ----------
router.post("/payments", async (req, res, next) => {
  try {
    // Student can pay their own; admin/teacher can record any
    const isStudent = req.user.role === "student";
    const payload = { ...req.body, recorded_by: req.user.sub };

    if (isStudent) {
      // Verify the student_fee belongs to them
      const sf = await StudentFee.findById(payload.student_fee_id);
      if (!sf || String(sf.student_id) !== String(req.user.ref_id)) {
        return res.status(403).json({ detail: "Not your fee" });
      }
    } else if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({ detail: "Forbidden" });
    }

    res.status(201).json(await recordPayment(payload));
  } catch (e) { next(e); }
});

router.get("/payments", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student_id) filter.student_id = req.query.student_id;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.from || req.query.to) {
      filter.paid_at = {};
      if (req.query.from) filter.paid_at.$gte = new Date(req.query.from);
      if (req.query.to) filter.paid_at.$lte = new Date(req.query.to);
    }
    res.json(await listPayments(filter));
  } catch (e) { next(e); }
});

router.get("/payments/my", async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ detail: "Forbidden" });
    res.json(await listPayments({ student_id: req.user.ref_id }));
  } catch (e) { next(e); }
});

router.get("/payments/:id", async (req, res, next) => {
  try {
    const p = await getPayment(req.params.id);
    // Student can only see own
    if (req.user.role === "student" && String(p.student_id?._id) !== String(req.user.ref_id)) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    res.json(p);
  } catch (e) { next(e); }
});

// ---------- Reports ----------
router.get("/reports/summary", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    res.json(await collectionSummary({
      from: req.query.from,
      to: req.query.to,
    }));
  } catch (e) { next(e); }
});

export default router;