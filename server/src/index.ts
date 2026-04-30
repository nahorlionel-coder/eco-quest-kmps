import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import passport from "passport";
import { attachUser } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import googleRoutes from "./routes/google.js";
import profileRoutes from "./routes/profiles.js";
import missionRoutes from "./routes/missions.js";
import rewardRoutes from "./routes/rewards.js";
import roleRoutes from "./routes/roles.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(passport.initialize());
app.use(attachUser);

// Static serve uploaded files
app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/auth", authRoutes);
app.use("/auth", googleRoutes);
app.use("/profiles", profileRoutes);
app.use("/missions", missionRoutes);
app.use("/rewards", rewardRoutes);
app.use("/roles", roleRoutes);
app.use("/upload", uploadRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Internal error" });
});

app.listen(PORT, () => {
  console.log(`🌿 EcoQuest API ready on http://localhost:${PORT}`);
});
