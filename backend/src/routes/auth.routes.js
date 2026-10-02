import { Router } from "express";
import { login, getMe, register, googleLogin } from "../services/auth.service.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password required" });
    }
    res.json(await login(email, password));
  } catch (e) { next(e); }
});

// POST /api/auth/register  ← NEW
router.post("/register", async (req, res, next) => {
  try {
    res.status(201).json(await register(req.body));
  } catch (e) { next(e); }
});

// POST /api/auth/google  ← NEW
router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ detail: "Google credential required" });
    }
    res.json(await googleLogin(credential));
  } catch (e) { next(e); }
});

// GET /api/auth/me
router.get("/me", authRequired, async (req, res, next) => {
  try { res.json(await getMe(req.user.sub)); } catch (e) { next(e); }
});

export default router;