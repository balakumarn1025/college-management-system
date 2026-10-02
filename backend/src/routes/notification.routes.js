import { Router } from "express";
import Notification from "../models/Notification.js";
import {
  sendToStudent,
  sendToClass,
  sendToAllStudents,
  getSentBatches,
} from "../services/notification.service.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

// GET /api/notifications — my inbox
router.get("/", async (req, res, next) => {
  try {
    const list = await Notification.find({ user_id: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(list);
  } catch (e) { next(e); }
});

// PUT /api/notifications/read-all
router.put("/read-all", async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.sub },
      { $set: { is_read: true } }
    );
    res.json({ message: "All marked read" });
  } catch (e) { next(e); }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res, next) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, user_id: req.user.sub },
      { $set: { is_read: true } }
    );
    res.json({ message: "Read" });
  } catch (e) { next(e); }
});

// ============ TEACHER / ADMIN SEND ============

// POST /api/notifications/send
// body: { target: "student" | "class" | "all",
//         student_id?, class_id?, title, message, type? }
router.post("/send", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const { target, student_id, class_id, title, message, type } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ detail: "Title and message are required" });
    }

    // Get sender info
    let senderName = req.user.email;
    const TeacherModel = (await import("../models/Teacher.js")).default;
    const AdminModel = (await import("../models/Admin.js")).default;
    if (req.user.role === "teacher" && req.user.ref_id) {
      const t = await TeacherModel.findById(req.user.ref_id);
      senderName = t?.name || req.user.email;
    } else if (req.user.role === "admin" && req.user.ref_id) {
      const a = await AdminModel.findById(req.user.ref_id);
      senderName = a?.name || req.user.email;
    }

    const sender = {
      sub: req.user.sub,
      name: senderName,
      role: req.user.role,
    };

    if (target === "student") {
      if (!student_id) {
        return res.status(400).json({ detail: "student_id required" });
      }
      const n = await sendToStudent({ student_id, title, message, type, sender });
      return res.json({ message: "Sent to 1 student", sent: 1, id: n._id });
    }

    if (target === "class") {
      if (!class_id) {
        return res.status(400).json({ detail: "class_id required" });
      }
      const result = await sendToClass({ class_id, title, message, type, sender });
      return res.json({ message: `Sent to ${result.sent} students`, ...result });
    }

    if (target === "all") {
      if (req.user.role !== "admin") {
        return res.status(403).json({ detail: "Only admin can send to all" });
      }
      const result = await sendToAllStudents({ title, message, type, sender });
      return res.json({ message: `Sent to ${result.sent} students`, ...result });
    }

    return res.status(400).json({ detail: "Invalid target" });
  } catch (e) { next(e); }
});

// GET /api/notifications/sent — notifications sent by this teacher (grouped)
router.get("/sent", requireRoles("admin", "teacher"), async (req, res, next) => {
  try {
    const batches = await getSentBatches(req.user.sub);
    res.json(batches);
  } catch (e) { next(e); }
});

export default router;