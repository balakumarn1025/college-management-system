import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { uploadProfileImage } from "../middleware/upload.js";
import {
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
} from "../services/profile.service.js";

const router = Router();
router.use(authRequired);

// GET /api/profile — current user's profile
router.get("/", async (req, res, next) => {
  try { res.json(await getProfile(req.user)); } catch (e) { next(e); }
});

// PUT /api/profile — update text fields
router.put("/", async (req, res, next) => {
  try { res.json(await updateProfile(req.user, req.body)); } catch (e) { next(e); }
});

// POST /api/profile/image — upload profile picture
router.post("/image", uploadProfileImage.single("image"), async (req, res, next) => {
  try { res.json(await updateProfileImage(req.user, req.file)); } catch (e) { next(e); }
});

// POST /api/profile/change-password
router.post("/change-password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    res.json(await changePassword(req.user, currentPassword, newPassword));
  } catch (e) { next(e); }
});

export default router;