/**
 * Import data from existing Supabase project into local PostgreSQL via Prisma.
 *
 * Usage:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env (temporarily)
 *   2. Make sure DATABASE_URL points to your new local Postgres
 *   3. Run: npm run import:supabase
 *
 * NOTE: Auth users are NOT migrated automatically — passwords cannot be exported
 * from Supabase. Users will need to re-register, OR you can pre-create them in
 * the loop below with a temporary password.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SUPABASE_KEY);
const prisma = new PrismaClient();

async function dump<T>(table: string): Promise<T[]> {
  const { data, error } = await supa.from(table).select("*");
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function main() {
  console.log("📥 Pulling data from Supabase...");

  const [missions, rewards, profiles, completions, redemptions, assignments, challenges, roles] = await Promise.all([
    dump<any>("missions"),
    dump<any>("rewards"),
    dump<any>("profiles"),
    dump<any>("mission_completions"),
    dump<any>("reward_redemptions"),
    dump<any>("user_mission_assignments"),
    dump<any>("department_challenges"),
    dump<any>("user_roles"),
  ]);

  console.log(`Found: ${missions.length} missions, ${rewards.length} rewards, ${profiles.length} profiles`);

  // 1. Create placeholder users (since we can't migrate auth)
  const userIds = new Set<string>();
  profiles.forEach((p) => userIds.add(p.user_id));
  completions.forEach((c) => userIds.add(c.user_id));
  redemptions.forEach((r) => userIds.add(r.user_id));
  roles.forEach((r) => userIds.add(r.user_id));

  console.log(`Creating ${userIds.size} placeholder users (passwords NOT migrated)...`);
  for (const uid of userIds) {
    const profile = profiles.find((p) => p.user_id === uid);
    const placeholderEmail = `migrated-${uid.slice(0, 8)}@local.invalid`;
    await prisma.user.upsert({
      where: { id: uid },
      create: {
        id: uid,
        email: placeholderEmail,
        fullName: profile?.display_name ?? null,
      },
      update: {},
    });
  }

  console.log("Inserting profiles...");
  for (const p of profiles) {
    await prisma.profile.upsert({
      where: { userId: p.user_id },
      create: {
        id: p.id,
        userId: p.user_id,
        displayName: p.display_name,
        department: p.department,
        avatarUrl: p.avatar_url,
        points: p.points ?? 0,
        level: p.level ?? 1,
        streak: p.streak ?? 0,
        createdAt: new Date(p.created_at),
      },
      update: {},
    });
  }

  console.log("Inserting missions...");
  for (const m of missions) {
    await prisma.mission.upsert({
      where: { id: m.id },
      create: {
        id: m.id, title: m.title, description: m.description, points: m.points,
        category: m.category, type: m.type, icon: m.icon, active: m.active,
        isSponsored: m.is_sponsored, isBonus: m.is_bonus, unlockLevel: m.unlock_level,
        sponsorName: m.sponsor_name, redirectUrl: m.redirect_url,
        frequency: m.frequency, difficulty: m.difficulty, sortOrder: m.sort_order,
        createdAt: new Date(m.created_at),
      },
      update: {},
    });
  }

  console.log("Inserting rewards...");
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      create: {
        id: r.id, title: r.title, description: r.description, pointsCost: r.points_cost,
        image: r.image, category: r.category, available: r.available,
        isSponsored: r.is_sponsored, sponsorName: r.sponsor_name,
        createdAt: new Date(r.created_at),
      },
      update: {},
    });
  }

  console.log("Inserting roles...");
  for (const r of roles) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: r.user_id, role: r.role } },
      create: { id: r.id, userId: r.user_id, role: r.role },
      update: {},
    }).catch(() => null);
  }

  console.log("Inserting completions...");
  for (const c of completions) {
    await prisma.missionCompletion.upsert({
      where: { id: c.id },
      create: {
        id: c.id, userId: c.user_id, missionId: c.mission_id,
        missionTitle: c.mission_title, photoUrl: c.photo_url,
        pointsEarned: c.points_earned, completionDate: new Date(c.completion_date),
        status: c.status, aiResult: c.ai_result, aiConfidence: c.ai_confidence,
        reviewedAt: c.reviewed_at ? new Date(c.reviewed_at) : null,
        completedAt: new Date(c.completed_at),
        weekStart: c.week_start ? new Date(c.week_start) : null,
        qrCode: c.qr_code,
      },
      update: {},
    }).catch((e) => console.warn(`skip completion ${c.id}:`, e.message));
  }

  console.log("Inserting redemptions...");
  for (const r of redemptions) {
    await prisma.rewardRedemption.upsert({
      where: { id: r.id },
      create: {
        id: r.id, userId: r.user_id, rewardId: r.reward_id,
        rewardTitle: r.reward_title, pointsSpent: r.points_spent,
        createdAt: new Date(r.created_at),
      },
      update: {},
    }).catch(() => null);
  }

  console.log("Inserting assignments...");
  for (const a of assignments) {
    await prisma.userMissionAssignment.upsert({
      where: { id: a.id },
      create: {
        id: a.id, userId: a.user_id, missionId: a.mission_id,
        periodStart: new Date(a.period_start), periodEnd: new Date(a.period_end),
        isBonus: a.is_bonus, createdAt: new Date(a.created_at),
      },
      update: {},
    }).catch(() => null);
  }

  console.log("Inserting challenges...");
  for (const c of challenges) {
    await prisma.departmentChallenge.upsert({
      where: { id: c.id },
      create: {
        id: c.id, title: c.title, description: c.description,
        teamA: c.team_a, teamB: c.team_b,
        teamAPoints: c.team_a_points, teamBPoints: c.team_b_points,
        targetPoints: c.target_points, rewardDescription: c.reward_description,
        status: c.status, icon: c.icon,
        startDate: new Date(c.start_date), endDate: new Date(c.end_date),
        createdAt: new Date(c.created_at),
      },
      update: {},
    });
  }

  console.log("✅ Migration complete!");
  console.log("⚠️  Migrated users have placeholder emails. They must reset password or you must update emails manually.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
