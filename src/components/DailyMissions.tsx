import { motion } from 'framer-motion';
import { Clock, Info, Lock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMissions } from '@/hooks/useMissions';

const photoCriteria: Record<string, string> = {
  'Use Public Transportation':      'Selfie, background: inside bus / train / angkot',
  'Carpooling':                      'Selfie, background: carpool, must capture fellow employees',
  'Bike to Work':                    'Selfie & wearing gears, show the bike',
  'Use Own Tumbler':                 'Capture tumbler + drinks inside',
  'Use Reusable Bag':                'Capture bag + goods inside',
  'Tabung Biru':                     'Capture cigarette butts + "Tabung Biru"',
  'Donate Plastic Utensils':         'Selfie, capture the utensils/chopsticks & the vendors',
  'Use Own Food Container':          'Capture container + foods inside',
  'KG Waste Station':                'Screenshot Rekosistem App, must show date',
  'Meatless Consumption':            'Capture 1 plate of foods, must not contain animal product',
  'No Gorengan':                     'Capture 1 plate of foods, must not contain GORENGAN',
  'Workout at Gym':                  'Selfie & wearing sportswear, background: gym',
  'Running at GBK':                  'Selfie & wearing sportswear, background: GBK Senayan',
  '10,000 Steps':                    'Screenshot Strava app or smartwatch, must show date & number of steps',
  'Electricity Patrol':              'Capture meeting room, lights off',
  'Declutter Inbox':                 'Capture email inbox: before & after, must show numbers',
  'KOGNISI Course':                  'Capture KOGNISI, must show the course completed',
};

const categoryBg = { energy: 'bg-energy/20', waste: 'bg-waste/20', commute: 'bg-commute/20', food: 'bg-food/20' };
const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };
const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function getHoursLeft(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 0;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  friday.setHours(23, 59, 0, 0);
  return Math.max(0, (friday.getTime() - now.getTime()) / (1000 * 60 * 60));
}

function calcSpeedBonus(basePoints: number): number {
  const hoursLeft = getHoursLeft();
  return Math.round(hoursLeft * 0.1);
}

function GuestGate() {
  const navigate = useNavigate();
  return (
    <Card variant="glass" className="border-primary/20">
      <CardContent className="p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-bold font-display text-lg mb-1">Buat Akun untuk Melihat Misi</h3>
          <p className="text-sm text-muted-foreground">Daftar sekarang dan mulai selesaikan misi eco-friendly minggu ini!</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glow" onClick={() => navigate('/auth')}>Buat Akun</Button>
          <Button variant="outline" onClick={() => navigate('/auth')}>Masuk</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyMissions() {
  const { user } = useAuth();
  const { missions, loading, completeMission } = useMissions();
  const hoursLeft = getHoursLeft();
  const isWeekday = [1, 2, 3, 4, 5].includes(new Date().getDay());

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="text-3xl">🎯</span> Misi Minggu Ini
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {user ? 'Upload foto sebagai bukti untuk menyelesaikan misi' : 'Login untuk menyelesaikan misi'}
          </p>
        </div>
        {user && (
          <div className="text-right">
            <div className="text-lg font-bold font-display text-primary">
              {missions.filter(m => m.completed).length}/{missions.length}
            </div>
            <div className="text-xs text-muted-foreground">selesai</div>
          </div>
        )}
      </motion.div>

      {!isWeekday && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">Misi hanya tersedia pada hari kerja (Senin–Jumat)</p>
        </div>
      )}

      <div className="rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
            <Clock className="w-4 h-4" />
            {hoursLeft > 0 ? `${hoursLeft.toFixed(1)} jam tersisa minggu ini` : 'Minggu ini sudah berakhir!'}
          </div>
          <span className="text-xs text-muted-foreground">Sen 00:00 → Jum 23:59</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.max(0, (hoursLeft / 120) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-cyan-300/70 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Time bonus = sisa jam × 0.1 pts &nbsp;|  ✅ Admin verifies every Wednesday
        </p>
      </div>

      {!user ? (
        <GuestGate />
      ) : loading ? (
        <div className="text-center py-8 text-muted-foreground">Memuat misi...</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Belum ada misi tersedia</div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission, index) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            >
              <Card variant={mission.completed || mission.pending ? 'glass' : 'mission'}
                className={`overflow-hidden ${mission.completed || mission.pending ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${categoryBg[mission.category]} shrink-0`}>
                      <span className="text-2xl">{mission.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold font-display truncate">{mission.title}</h3>
                        <span className={`text-xs font-semibold ${difficultyColor[mission.difficulty]}`}>
                          {difficultyLabel[mission.difficulty]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{mission.description}</p>
                      {mission.pending && (
                        <p className="text-xs text-amber-400 mt-1 font-semibold">⏳ Menunggu verifikasi admin</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {(() => {
                        const speedBonus = !mission.completed && !mission.pending ? calcSpeedBonus(mission.points) : 0;
                        return speedBonus > 0 ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs text-muted-foreground line-through">+{mission.points}</span>
                            <Badge variant="points" className="font-bold text-sm">+{mission.points + speedBonus} pts</Badge>
                            <span className="text-xs text-cyan-400 font-semibold flex items-center gap-0.5">
                              <Zap className="w-3 h-3" />+{speedBonus} speed bonus!
                            </span>
                          </div>
                        ) : (
                          <Badge variant="points" className="font-bold">+{mission.points} pts</Badge>
                        );
                      })()}
                      {mission.completed && (
                        <span className="text-xs text-primary font-semibold">✅ Selesai</span>
                      )}
                      {mission.pending && (
                        <span className="text-xs text-amber-400 font-semibold">⏳ Pending</span>
                      )}
                      {!mission.completed && !mission.pending && mission.type === 'photo' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label className="cursor-pointer">
                              <input type="file" accept="image/*" capture="environment" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) completeMission(mission.id, { photoFile: f }); }}
                              />
                              <Button size="sm" asChild><span>📷 Upload</span></Button>
                            </label>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-64 p-3">
                            <p className="font-semibold text-xs mb-1">📋 Kriteria Foto:</p>
                            <p className="text-xs">{photoCriteria[mission.title] ?? 'Upload foto sebagai bukti'}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {!mission.completed && !mission.pending && mission.type === 'check-in' && (
                        <Button size="sm" onClick={() => completeMission(mission.id)}>✅ Check-in</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
