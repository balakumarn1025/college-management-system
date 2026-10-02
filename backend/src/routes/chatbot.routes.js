import { Router } from "express";
import { handleMessage, getHistory } from "../services/chatbot.service.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

// POST /api/chatbot/message
router.post("/message", async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ detail: "message required" });
    const result = await handleMessage(message, req.user);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /api/chatbot/history
router.get("/history", async (req, res, next) => {
  try {
    res.json(await getHistory(req.user.sub));
  } catch (e) { next(e); }
});

export default router;