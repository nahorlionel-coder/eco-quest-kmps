import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthedRequest, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// View own roles
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const roles = await prisma.userRole.findMany({ where: { userId: req.userId! } });
  res.json(roles);
});

// Bootstrap: become first admin if no admin exists yet
router.post("/bootstrap-admin", requireAuth, async (req: AuthedRequest, res) => {
  const anyAdmin = await prisma.userRole.findFirst({ where: { role: "admin" } });
  if (anyAdmin) return res.status(403).json({ error: "Admin already exists" });

  const created = await prisma.userRole.create({
    data: { userId: req.userId!, role: "admin" },
  });
  res.json(created);
});

router.get("/has-any-admin", requireAuth, async (_req, res) => {
  const any = await prisma.userRole.findFirst({ where: { role: "admin" } });
  res.json({ hasAnyAdmin: !!any });
});

// Admin: assign role to another user
const AssignSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "moderator", "user"]),
});

router.post("/assign", requireAdmin, async (req, res) => {
  const parsed = AssignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const created = await prisma.userRole.create({ data: parsed.data });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.userRole.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
