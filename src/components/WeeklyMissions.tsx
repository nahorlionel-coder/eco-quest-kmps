import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, Clock, Info, Lock, Upload, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMissions, type MissionWithStatus } from '@/hooks/useMissions';

// ─── Photo criteria per mission ───────────────────────────────────────────────
const photoCriteria: Record<string, string> = {
  'Use Public Transportation': 'Selfie di dalam bus / kereta / angkot',
  'Carpooling':                'Selfie bersama rekan kerja di dalam kendaraan',
  'Bike to Work':              'Selfie pakai perlengkapan bersepeda, tampilkan sepedanya',
  'Use Own Tumbler':           'Foto tumbler + minuman di dalamnya',
  'Use Reusable Bag':          'Foto tas + barang belanjaan di dalamnya',
  'Tabung Biru':               'Foto puntung rokok + Tabung Biru',
  'Donate Plastic Utensils':   'Selfie bersama pedagang, tampilkan alat makan plastiknya',
  'Use Own Food Container':    'Foto wadah makan + makanan di dalamnya',
  'KG Waste Station':          'Screenshot aplikasi Rekosistem, tampilkan tanggalnya',
  'Meatless Consumption':      'Foto 1 piring makanan, tidak boleh ada produk hewani',
  'No Gorengan':               'Foto 1 piring makanan, tidak boleh ada gorengan',
  'Workout at Gym':            'Selfie pakai pakaian olahraga, background gym',
  'Running at GBK':            'Selfie pakai pakaian olahraga, background GBK Senayan',
  '10,000 Steps':              'Screenshot Strava / smartwatch, tampilkan tanggal & jumlah langkah',
  'Electricity Patrol':        'Foto ruang meeting dengan lampu mati',
  'Declutter Inbox':           'Screenshot inbox email: sebelum & sesudah, tampilkan angkanya',
  'KOGNISI Course':            'Screenshot KOGNISI, tampilkan kursus yang sudah selesai',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getHoursLeft(): number {
  const now = new Date();
  const daysUntilFriday = now.getDay() <= 5 ? 5 - now.getDay() : 0;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  friday.setHours(23, 59, 0, 0);
  return Math.max(0, (friday.getTime() - now.getTime()) / (1000 * 60 * 60));
}

function getPeriodLabel(): string {
  const now = new Date();
  const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(friday)}`;
}

const categoryLabel: Record<string, string> = {
  energy: 'Energi', waste: 'Sampah', commute: 'Transportasi', food: 'Kesehatan',
};
const categoryColor: Record<string, string> = {
  energy:  'bg-yellow-400/15 text-yellow-500 border-yellow-400/30',
  waste:   'bg-green-400/15 text-green-500 border-green-400/30',
  commute: 'bg-blue-400/15 text-blue-500 border-blue-400/30',
  food:    'bg-orange-400/15 text-orange-500 border-orange-400/30',
};
const difficultyColor: Record<string, string> = {
  easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400',
};
const difficultyLabel: Record<string, string> = {
  easy: 'Mudah', medium: 'Sedang', hard: 'Sulit',
};

// ─── Mission Card ─────────────────────────────────────────────────────────────
function MissionCard({ mission, speedBonus, onComplete }: {
  mission: MissionWithStatus;
  speedBonus: number;
  onComplete: (id: string, opts?: { photoFile?: File }) => void;
}) {
  const totalPoints = mission.points + (mission.completed || mission.pending ? 0 : speedBonus);
  const criteria = photoCriteria[mission.title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className={`overflow-hidden transition-all duration-200 ${
        mission.completed ? 'opacity-60 bg-muted/30' :
        mission.pending   ? 'opacity-75 border-amber-400/30' :
        'hover:shadow-md hover:border-primary/30'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">

            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${categoryColor[mission.category]}`}>
              {mission.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className={`font-semibold text-sm leading-tight ${mission.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {mission.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-medium ${difficultyColor[mission.difficulty]}`}>
                      {difficultyLabel[mission.difficulty]}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{categoryLabel[mission.category]}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  {speedBonus > 0 && !mission.completed && !mission.pending ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground line-through">+{mission.points}</span>
                      <Badge variant="points" className="text-sm font-bold">+{totalPoints} pts</Badge>
                      <span className="text-xs text-cyan-400 flex items-center gap-0.5 mt-0.5">
                        <Zap className="w-3 h-3" />+{speedBonus}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="points" className="font-bold">+{mission.points} pts</Badge>
                  )}
                </div>
              </div>

              {/* Status / Action */}
              <div className="mt-3">
                {mission.completed && (
                  <div className="flex items-center gap-1.5 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Selesai</span>
                  </div>
                )}
                {mission.pending && (
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">Menunggu verifikasi admin</span>
                  </div>
                )}
                {!mission.completed && !mission.pending && (
                  <div className="flex items-center gap-2">
                    {mission.type === 'photo' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="cursor-pointer">
                            <input
                              type="file" accept="image/*" capture="environment"
                              className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) onComplete(mission.id, { photoFile: f }); }}
                            />
                            <Button size="sm" variant="outline" className="gap-1.5 h-8" asChild>
                              <span><Camera className="w-3.5 h-3.5" />Upload Foto</span>
                            </Button>
                          </label>
                        </TooltipTrigger>
                        {criteria && (
                          <TooltipContent side="top" className="max-w-64 p-3">
                            <p className="font-semibold text-xs mb-1">📋 Kriteria foto:</p>
                            <p className="text-xs leading-relaxed">{criteria}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
                    {mission.type === 'check-in' && (
                      <Button size="sm" variant="outline" className="gap-1.5 h-8"
                        onClick={() => onComplete(mission.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5" />Check-in
                      </Button>
                    )}
                    {criteria && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-64 p-3">
                          <p className="font-semibold text-xs mb-1">📋 Kriteria foto:</p>
                          <p className="text-xs leading-relaxed">{criteria}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function WeeklyMissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { missions, loading, completeMission } = useMissions();

  const hoursLeft   = getHoursLeft();
  const speedBonus  = Math.round(hoursLeft * 0.1);
  const period      = getPeriodLabel();
  const isWeekday   = [1, 2, 3, 4, 5].includes(new Date().getDay());

  const completed   = missions.filter(m => m.completed).length;
  const pending     = missions.filter(m => m.pending).length;
  const total       = missions.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Guest ──
  if (!user) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Misi Minggu Ini</h3>
              <p className="text-sm text-muted-foreground">
                Masuk atau buat akun untuk melihat dan menyelesaikan misi eco-friendly minggu ini.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/auth')}>Masuk / Daftar</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎯 Misi Minggu Ini
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{period}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary leading-none">
            {completed}<span className="text-base text-muted-foreground font-normal">/{total}</span>
          </div>
          <div className="text-xs text-muted-foreground">selesai</div>
        </div>
      </motion.div>

      {/* ── Progress ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Progress value={progressPct} className="h-2.5" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{progressPct}% selesai</span>
          {pending > 0 && <span className="text-amber-400">⏳ {pending} menunggu verifikasi</span>}
          {completed === total && total > 0 && <span className="text-primary font-semibold">🎉 Semua selesai!</span>}
        </div>
      </motion.div>

      {/* ── Warnings ── */}
      <AnimatePresence>
        {!isWeekday && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400 font-medium">Misi aktif Senin–Jumat. Kamu tetap bisa upload foto hari ini.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speed Bonus Banner ── */}
      {speedBonus > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-cyan-400">Speed Bonus Aktif</p>
                <p className="text-xs text-muted-foreground">Selesaikan sekarang, dapat <span className="text-cyan-400 font-semibold">+{speedBonus} poin</span> ekstra per misi</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-cyan-400">{hoursLeft.toFixed(0)} jam</div>
              <div className="text-xs text-muted-foreground">tersisa</div>
            </div>
          </div>
          <div className="mt-2 w-full bg-muted/40 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.max(2, (hoursLeft / 120) * 100)}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Mission List ── */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Memuat misi...</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Belum ada misi tersedia minggu ini.</div>
      ) : (
        <div className="space-y-2">
          {missions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              speedBonus={speedBonus}
              onComplete={completeMission}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      <p className="text-xs text-center text-muted-foreground pb-2">
        ✅ Foto diverifikasi admin setiap hari Rabu
      </p>
    </div>
  );
}
