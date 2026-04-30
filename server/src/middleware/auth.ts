import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

/**
 * Verifies JWT and attaches userId. Optional — does not block if no token.
 */
export async function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const auth = req.header("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const payload = verifyJwt(auth.slice(7));
      req.userId = payload.sub;
      req.userEmail = payload.email;
      const adminRole = await prisma.userRole.findFirst({
        where: { userId: payload.sub, role: "admin" },
      });
      req.isAdmin = !!adminRole;
    } catch {
      // ignore invalid token
    }
  }
  next();
}

/** Requires a valid logged-in user. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ error: "Not authenticated" });
  next();
}

/** Requires admin role. */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!req.isAdmin) return res.status(403).json({ error: "Admin only" });
  next();
}
