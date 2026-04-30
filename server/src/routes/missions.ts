import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthedRequest, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// List all active missions (any logged-in user)
router.get("/", requireAuth, async (_req, res) => {
  const missions = await prisma.mission.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  res.json(missions);
});

// My completions
router.get("/completions/me", requireAuth, async (req: AuthedRequest, res) => {
  const list = await prisma.missionCompletion.findMany({
    where: { userId: req.userId! },
    orderBy: { completedAt: "desc" },
  });
  res.json(list);
});

const CreateCompletionSchema = z.object({
  missionId: z.string().uuid(),
  missionTitle: z.string().optional(),
  photoUrl: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

router.post("/completions", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateCompletionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const mission = await prisma.mission.findUnique({ where: { id: parsed.data.missionId } });
  if (!mission) return res.status(404).json({ error: "Mission not found" });

  const completion = await prisma.missionCompletion.create({
    data: {
      userId: req.userId!,
      missionId: mission.id,
      missionTitle: parsed.data.missionTitle ?? mission.title,
      photoUrl: parsed.data.photoUrl ?? null,
      qrCode: parsed.data.qrCode ?? null,
      status: parsed.data.status,
      pointsEarned: parsed.data.status === "approved" ? mission.points : 0,
    },
  });

  // Auto-award points only for non-photo, instantly approved completions (e.g. QR)
  if (completion.status === "approved") {
    await prisma.profile.update({
      where: { userId: req.userId! },
      data: { points: { increment: mission.points } },
    });
  }

  res.json(completion);
});

// --- Admin endpoints ---

router.get("/admin/all", requireAdmin, async (_req, res) => {
  const list = await prisma.mission.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(list);
});

router.get("/admin/completions", requireAdmin, async (_req, res) => {
  const list = await prisma.missionCompletion.findMany({
    orderBy: { completedAt: "desc" },
    take: 500,
  });
  res.json(list);
});

const ReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

router.patch("/admin/completions/:id", requireAdmin, async (req, res) => {
  const parsed = ReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.missionCompletion.findUnique({
    where: { id: req.params.id },
    include: { mission: true },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.missionCompletion.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
        reviewedAt: new Date(),
        pointsEarned: parsed.data.status === "approved" ? existing.mission.points : 0,
      },
    });
    if (parsed.data.status === "approved" && existing.status !== "approved") {
      await tx.profile.update({
        where: { userId: existing.userId },
        data: { points: { increment: existing.mission.points } },
      });
    }
    return updated;
  });

  res.json(result);
});

const UpsertMissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  points: z.number().int().min(0).default(10),
  category: z.string().default("energy"),
  type: z.string().default("check-in"),
  icon: z.string().optional().nullable(),
  active: z.boolean().default(true),
  isSponsored: z.boolean().default(false),
  isBonus: z.boolean().default(false),
  unlockLevel: z.number().int().default(0),
  sponsorName: z.string().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
  frequency: z.string().default("weekly"),
  difficulty: z.string().default("medium"),
  sortOrder: z.number().int().default(0),
});

router.post("/admin", requireAdmin, async (req, res) => {
  const parsed = UpsertMissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.mission.create({ data: parsed.data });
  res.json(created);
});

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  const parsed = UpsertMissionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await prisma.mission.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(updated);
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  await prisma.mission.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
