import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signJwt, hashPassword, comparePassword } from "../lib/jwt.js";
import { AuthedRequest, requireAuth } from "../middleware/auth.js";

const router = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  fullName: z.string().min(1).max(100).optional(),
});

router.post("/signup", async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, fullName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      profile: { create: { displayName: fullName ?? email } },
    },
    include: { profile: true },
  });

  const token = signJwt({ sub: user.id, email: user.email });
  res.json({ token, user: sanitize(user) });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
  if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signJwt({ sub: user.id, email: user.email });
  res.json({ token, user: sanitize(user) });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { profile: true, roles: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user: sanitize(user), roles: user.roles.map((r) => r.role), isAdmin: req.isAdmin });
});

router.post("/logout", (_req, res) => {
  // JWT is stateless. Client just deletes the token.
  res.json({ ok: true });
});

function sanitize(u: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

export default router;
