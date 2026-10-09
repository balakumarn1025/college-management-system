import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -------- Notes upload --------
const notesDir = path.join(__dirname, "..", "..", "uploads", "notes");
fs.mkdirSync(notesDir, { recursive: true });

const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, notesDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const NOTES_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "text/plain",
];

export const uploadNote = multer({
  storage: notesStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (NOTES_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

// -------- Profile image upload --------
const profileDir = path.join(__dirname, "..", "..", "uploads", "profiles");
fs.mkdirSync(profileDir, { recursive: true });

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only PNG, JPG, JPEG, WEBP allowed"));
  },
});