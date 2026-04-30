import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { AuthedRequest, requireAuth } from "../middleware/auth.js";

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const PUBLIC_URL = process.env.PUBLIC_URL || "";

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req: AuthedRequest, _file, cb) => {
    const userDir = path.join(UPLOAD_DIR, req.userId!);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 6);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

router.post("/photo", requireAuth, upload.single("file"), (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const relPath = `${req.userId}/${req.file.filename}`;
  res.json({
    path: relPath,
    url: `${PUBLIC_URL}/uploads/${relPath}`,
  });
});

export default router;
