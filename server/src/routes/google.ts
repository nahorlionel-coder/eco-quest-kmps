import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma.js";
import { signJwt } from "../lib/jwt.js";

const router = Router();

const enabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (enabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google"));

          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                googleId: profile.id,
                fullName: profile.displayName,
                profile: { create: { displayName: profile.displayName, avatarUrl: profile.photos?.[0]?.value } },
              },
            });
          } else if (!user.googleId) {
            user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
          }
          done(null, user);
        } catch (e) {
          done(e as Error);
        }
      }
    )
  );

  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth?error=google` }),
    (req, res) => {
      const user = req.user as { id: string; email: string };
      const token = signJwt({ sub: user.id, email: user.email });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  );
} else {
  router.get("/google", (_req, res) =>
    res.status(503).json({ error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env" })
  );
}

export default router;
