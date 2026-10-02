import { Router } from "express";
import {
  getRoster,
  saveBulk,
  modifySingle,
  studentPercentage,
  percentageBySubject,
} from "../services/attendance.service.js";
import Attendance from "../models/Attendance.js";
import AttendanceHistory from "../models/AttendanceHistory.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

// GET /api/attendance/class/:classId?date=&period_number=&subject_id=
router.get("/class/:classId", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const { date, period_number, subject_id } = req.query;
    if (!date || !period_number || !subject_id) {
      return res.status(400).json({ detail: "date, period_number and subject_id required" });
    }
    const roster = await getRoster(
      req.params.classId,
      date,
      Number(period_number),
      subject_id
    );
    res.json(roster);
  } catch (e) { next(e); }
});

// POST /api/attendance  (bulk save)
router.post("/", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const result = await saveBulk(req.body, req.user.ref_id || req.user.sub);
    res.json(result);
  } catch (e) { next(e); }
});

// PUT /api/attendance/:id  (single modify with reason)
router.put("/:id", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const { status, reason } = req.body || {};
    const result = await modifySingle(
      req.params.id,
      status,
      reason,
      req.user.ref_id || req.user.sub
    );
    res.json(result);
  } catch (e) { next(e); }
});

// GET /api/attendance?date=&class_id=&subject_id=
router.get("/", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const q = {};
    if (req.query.date) q.date = req.query.date;
    if (req.query.class_id) q.class_id = req.query.class_id;
    if (req.query.subject_id) q.subject_id = req.query.subject_id;

    const list = await Attendance.find(q)
      .populate("student_id", "student_id name")
      .populate("subject_id", "code name")
      .populate("teacher_id", "name")
      .sort({ date: -1, period_number: 1 });

    res.json(
      list.map((a) => ({
        _id: a._id,
        student_id: a.student_id?._id,
        student_code: a.student_id?.student_id,
        student_name: a.student_id?.name,
        subject_id: a.subject_id?._id,
        subject_name: a.subject_id?.name,
        teacher_name: a.teacher_id?.name,
        class_id: a.class_id,
        date: a.date,
        period_number: a.period_number,
        status: a.status,
        reason: a.reason,
      }))
    );
  } catch (e) { next(e); }
});

// GET /api/attendance/student/:sid
router.get("/student/:sid", async (req, res, next) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user.ref_id) !== String(req.params.sid)
    ) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    const list = await Attendance.find({ student_id: req.params.sid })
      .populate("subject_id", "code name")
      .sort({ date: -1, period_number: 1 });
    res.json(list);
  } catch (e) { next(e); }
});

// GET /api/attendance/subject/:sid
router.get("/subject/:sid", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const list = await Attendance.find({ subject_id: req.params.sid })
      .populate("student_id", "student_id name")
      .sort({ date: -1 });
    res.json(list);
  } catch (e) { next(e); }
});

// GET /api/attendance/percentage/:sid
router.get("/percentage/:sid", async (req, res, next) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user.ref_id) !== String(req.params.sid)
    ) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    res.json(await studentPercentage(req.params.sid));
  } catch (e) { next(e); }
});

// GET /api/attendance/percentage-by-subject/:sid
router.get("/percentage-by-subject/:sid", async (req, res, next) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user.ref_id) !== String(req.params.sid)
    ) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    res.json(await percentageBySubject(req.params.sid));
  } catch (e) { next(e); }
});

// GET /api/attendance/history
router.get("/history", requireRoles("teacher", "admin"), async (req, res, next) => {
  try {
    const q = {};
    if (req.query.student_id) q.student_id = req.query.student_id;
    if (req.query.attendance_id) q.attendance_id = req.query.attendance_id;

    const list = await AttendanceHistory.find(q)
      .populate("student_id", "student_id name")
      .populate("subject_id", "code name")
      .populate("modified_by", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(
      list.map((h) => ({
        _id: h._id,
        date: h.date,
        period_number: h.period_number,
        student_code: h.student_id?.student_id,
        student_name: h.student_id?.name,
        subject_name: h.subject_id?.name,
        old_status: h.old_status,
        new_status: h.new_status,
        reason: h.reason,
        modified_by_name: h.modified_by?.name || "System",
        modified_at: h.createdAt,
      }))
    );
  } catch (e) { next(e); }
});

// GET /api/attendance/history/student/:sid
router.get("/history/student/:sid", async (req, res, next) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user.ref_id) !== String(req.params.sid)
    ) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    const list = await AttendanceHistory.find({ student_id: req.params.sid })
      .populate("subject_id", "code name")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { next(e); }
});

export default router;