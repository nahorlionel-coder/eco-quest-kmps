import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthedRequest, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const list = await prisma.reward.findMany({
    where: { available: true },
    orderBy: { pointsCost: "asc" },
  });
  res.json(list);
});

const RedeemSchema = z.object({
  rewardId: z.string(),
  rewardTitle: z.string().optional(),
  pointsCost: z.number().int().min(0),
});

// Atomic redeem (mirrors redeem_reward RPC from Supabase)
router.post("/redeem", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = RedeemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { rewardId, rewardTitle, pointsCost } = parsed.data;

  try {
    const redemption = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { userId: req.userId! } });
      if (!profile) throw new Error("Profile not found");
      if (profile.points < pointsCost) throw new Error("Insufficient points");

      await tx.profile.update({
        where: { userId: req.userId! },
        data: { points: { decrement: pointsCost } },
      });

      return tx.rewardRedemption.create({
        data: {
          userId: req.userId!,
          rewardId,
          rewardTitle: rewardTitle ?? null,
          pointsSpent: pointsCost,
        },
      });
    });

    res.json(redemption);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Redeem failed" });
  }
});

router.get("/redemptions/me", requireAuth, async (req: AuthedRequest, res) => {
  const list = await prisma.rewardRedemption.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

// --- Admin ---
const UpsertReward = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  pointsCost: z.number().int().min(0),
  image: z.string().optional().nullable(),
  category: z.string().default("Merchandise"),
  available: z.boolean().default(true),
  isSponsored: z.boolean().default(false),
  sponsorName: z.string().optional().nullable(),
});

router.post("/admin", requireAdmin, async (req, res) => {
  const parsed = UpsertReward.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await prisma.reward.create({ data: parsed.data }));
});

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  const parsed = UpsertReward.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await prisma.reward.update({ where: { id: req.params.id }, data: parsed.data }));
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  await prisma.reward.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
