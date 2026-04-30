# 🌿 EcoQuest Backend (Self-Hosted PostgreSQL)

Backend Node.js + Express + Prisma + PostgreSQL untuk menggantikan Lovable Cloud (Supabase).

## 📋 Prasyarat

- **Node.js** 20+ (atau Bun)
- **Docker** & Docker Compose (untuk PostgreSQL)
- (opsional) Akun Google Cloud untuk OAuth

## 🚀 Quick Start

```bash
cd server

# 1. Install dependencies
npm install

# 2. Copy env & isi
cp .env.example .env
# Edit .env — minimal ganti JWT_SECRET dengan string acak

# 3. Jalankan PostgreSQL via Docker
docker compose up -d

# 4. Jalankan migrasi database (buat semua tabel)
npx prisma migrate dev --name init

# 5. (opsional) Seed data contoh
npm run seed

# 6. Start API server
npm run dev
```

Server jalan di: **http://localhost:3001**
Health check: `curl http://localhost:3001/health`

## 🎨 Frontend Setup

Di root project (folder atas):

```bash
# 1. Buat .env.local di root
echo 'VITE_API_URL=http://localhost:3001' > .env.local

# 2. Install & jalan
bun install
bun run dev
```

Frontend jalan di: **http://localhost:5173**

> ⚠️ **Penting:** File `src/lib/api.ts` sudah disediakan tapi component frontend (`AuthContext.tsx`, `useMissions.ts`, dll) **masih pakai Supabase**. Lihat bagian "Migrasi Frontend" di bawah.

## 🔐 Bikin Admin Pertama

1. Daftar lewat UI di `/auth` dengan email + password
2. Hit endpoint:
   ```bash
   curl -X POST http://localhost:3001/roles/bootstrap-admin \
     -H "Authorization: Bearer <TOKEN_KAMU>"
   ```
   Atau pakai halaman `/admin-setup` setelah refactor frontend.

## 📦 Migrasi Data dari Supabase Existing

Mau pindahin data lama dari Supabase ke Postgres lokal?

```bash
cd server

# 1. Tambah ke .env (sementara)
echo 'SUPABASE_URL=https://gxmwdyifneavsejdbeil.supabase.co' >> .env
echo 'SUPABASE_SERVICE_ROLE_KEY=<service-role-key-dari-supabase-dashboard>' >> .env

# 2. Install supabase-js (one-time)
npm install @supabase/supabase-js

# 3. Jalankan import
npm run import:supabase
```

⚠️ **Auth users tidak ikut termigrasi** (password Supabase di-hash dengan key internal). Script akan buat placeholder user dengan email `migrated-<uuid>@local.invalid`. Kamu harus:
- Update email manual via Prisma Studio (`npx prisma studio`), ATAU
- Minta user re-register

## 🌐 Google OAuth (opsional)

1. Buka https://console.cloud.google.com → Credentials → Create OAuth Client ID
2. Authorized redirect URI: `http://localhost:3001/auth/google/callback`
3. Isi `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` di `.env`
4. Restart server

## 🧪 Test API

```bash
# Signup
curl -X POST http://localhost:3001/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"test@local.com","password":"password123","fullName":"Test User"}'

# Login → simpan token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"test@local.com","password":"password123"}' | jq -r .token)

# Get me
curl http://localhost:3001/auth/me -H "Authorization: Bearer $TOKEN"

# List missions
curl http://localhost:3001/missions -H "Authorization: Bearer $TOKEN"
```

## 🔧 Tools

```bash
# UI buat liat database
npx prisma studio

# Reset database
npx prisma migrate reset

# Bikin migrasi baru setelah edit schema.prisma
npx prisma migrate dev --name nama_perubahan
```

## 📁 Struktur

```
server/
├── docker-compose.yml      # PostgreSQL container
├── prisma/
│   ├── schema.prisma       # Database schema (8 tabel + enum)
│   └── seed.ts             # Sample data
├── scripts/
│   └── import-from-supabase.ts
├── src/
│   ├── index.ts            # Express entry
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── jwt.ts          # JWT + bcrypt utils
│   ├── middleware/
│   │   └── auth.ts         # JWT verify, requireAuth, requireAdmin
│   └── routes/
│       ├── auth.ts         # signup / login / me
│       ├── google.ts       # Google OAuth
│       ├── profiles.ts
│       ├── missions.ts
│       ├── rewards.ts
│       ├── roles.ts
│       └── upload.ts       # Multer file upload
└── uploads/                # Foto misi (auto-dibuat, gitignored)
```

## 🔄 Migrasi Frontend (TODO Manual)

Frontend masih pakai Supabase agar preview Lovable tetap jalan. Untuk pakai backend lokal, refactor file-file ini:

| File | Yang Perlu Diubah |
|---|---|
| `src/contexts/AuthContext.tsx` | Ganti `supabase.auth.*` → `authApi.*` dari `@/lib/api` |
| `src/hooks/useMissions.ts` | Ganti `supabase.from('missions')...` → `missionsApi.list()` |
| `src/components/Marketplace.tsx` | Ganti `supabase.rpc('redeem_reward', ...)` → `rewardsApi.redeem(...)` |
| `src/components/Leaderboard.tsx` | Ganti `supabase.from('profiles')...` → `profilesApi.list()` |
| `src/pages/Admin.tsx` | Ganti semua query → `missionsApi.adminAll()`, `rewardsApi.create()`, dll |
| `src/pages/AdminSetup.tsx` | Ganti `supabase.from('user_roles').insert(...)` → `rolesApi.bootstrapAdmin()` |
| `src/pages/Profile.tsx` | Ganti → `profilesApi.me()` / `profilesApi.update()` |
| `src/components/admin/PhotoVerification.tsx` | Ganti `createSignedUrl` → langsung pakai `url` dari upload response |
| `src/components/QRScanner.tsx` | Ganti → `missionsApi.complete(...)` |

**Pattern umum:**
```ts
// SEBELUM (Supabase)
const { data, error } = await supabase.from('missions').select('*');
if (error) toast.error(error.message);

// SESUDAH (API lokal)
import { missionsApi } from '@/lib/api';
try {
  const data = await missionsApi.list();
} catch (e: any) { toast.error(e.message); }
```

## 🛡️ Security Notes

- ✅ Password di-hash dengan bcrypt (10 rounds)
- ✅ JWT signed dengan `JWT_SECRET` (GANTI SECRET DI PRODUCTION!)
- ✅ Semua mutasi `points`/`level`/`streak` cuma server-side
- ✅ Admin check via middleware `requireAdmin`
- ✅ File upload dibatasi 10MB & image-only
- ⚠️ Untuk production: pakai HTTPS (Caddy/Nginx), rotate JWT secret berkala, set `CORS_ORIGIN` strict

## 🐳 Production Deploy

```bash
# Build & jalankan via Docker
docker build -t ecoquest-api .
docker run -p 3001:3001 --env-file .env ecoquest-api
```

Atau pakai PM2 / systemd / Railway / Fly.io.
