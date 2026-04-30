import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthedRequest, requireAuth } from "../middleware/auth.js";

const router = Router();

// Public-ish: any logged-in user can view profiles (mirrors RLS "view all profiles")
router.get("/", requireAuth, async (_req, res) => {
  const profiles = await prisma.profile.findMany({
    orderBy: { points: "desc" },
  });
  res.json(profiles);
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
  res.json(profile);
});

const UpdateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// Users can update SAFE fields only (not points/level/streak — server-controlled)
router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.profile.update({
    where: { userId: req.userId! },
    data: parsed.data,
  });
  res.json(updated);
});

export default router;
