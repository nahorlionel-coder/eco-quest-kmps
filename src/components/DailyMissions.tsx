import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, Loader2, Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dailyMissions, weeklySchedule } from '@/data/mockData';
import type { Mission } from '@/data/mockData';

const categoryBg = { energy: 'bg-energy/20', waste: 'bg-waste/20', commute: 'bg-commute/20', food: 'bg-food/20' };
const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };
const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function getWeekOfMonth(): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const currentDate = now.getDate();
  const weekNumber = Math.ceil((currentDate + adjustedFirstDay) / 7);
  
  return Math.min(weekNumber, 4); // Cap at week 4
}

function getHoursLeft(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 0;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  friday.setHours(23, 59, 0, 0);
  return Math.max(0, (friday.getTime() - now.getTime()) / (1000 * 60 * 60));
}

type MissionStatus = 'available' | 'pending' | 'approved';

function MissionCard({ mission, onUpload }: { mission: Mission; onUpload: (id: string, file: File) => void }) {
  const [status, setStatus] = useState<MissionStatus>(mission.completed ? 'approved' : 'available');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoursLeft = getHoursLeft();
  const timeBonus = Math.round(hoursLeft * 0.1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUpload(mission.id, file);
    setTimeout(() => { setUploading(false); setStatus('pending'); }, 800);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: status === 'available' ? 1.02 : 1 }} className="relative"
    >
      <Card variant={status !== 'available' ? 'glass' : 'mission'}
        className={`overflow-hidden ${status !== 'available' ? 'opacity-70' : ''}`}
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
              {status === 'available' && timeBonus > 0 && (
                <p className="text-xs text-cyan-400 mt-1 font-semibold">⚡ +{timeBonus} time bonus if done now</p>
              )}
              {status === 'pending' && (
                <p className="text-xs text-amber-400 mt-1 font-semibold">⏳ Waiting for admin verification (every Wednesday)</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="points" className="font-bold">
                +{status === 'approved' ? mission.points : mission.points + timeBonus}
              </Badge>
              {status === 'approved' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-primary"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">Done</span>
                </motion.div>
              )}
              {status === 'pending' && (
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-semibold">Pending</span>
                </div>
              )}
              {status === 'available' && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={handleFileChange} />
                  <Button size="sm" variant={mission.category === 'food' ? 'food' : mission.category === 'energy' ? 'energy' : mission.category === 'commute' ? 'commute' : 'default'}
                    onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DailyMissions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const weekNum = getWeekOfMonth();
  const scheduledIds = weeklySchedule[weekNum];
  const weekMissions = dailyMissions.filter(m => scheduledIds.includes(m.id));
  const hoursLeft = getHoursLeft();
  const isWeekday = [1, 2, 3, 4, 5].includes(new Date().getDay());

  const handleUpload = (id: string, file: File) => {
    if (!user) { navigate('/auth'); return; }
    console.log('upload mock', id, file.name);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="text-3xl">🎯</span> Week {weekNum} Missions
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {user ? 'Upload photo as proof to complete missions' : 'Login to complete missions'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-display text-primary">{weekMissions.filter(m => m.completed).length}/{weekMissions.length}</div>
          <div className="text-xs text-muted-foreground">completed</div>
        </div>
      </motion.div>

      {/* Not weekday warning */}
      {!isWeekday && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">Missions are only available on weekdays (Mon–Fri)</p>
        </div>
      )}

      {/* Time banner */}
      <div className="rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
            <Clock className="w-4 h-4" />
            {hoursLeft > 0 ? `${hoursLeft.toFixed(1)} hrs left this week` : 'Week ended!'}
          </div>
          <span className="text-xs text-muted-foreground">Mon 00:00 → Fri 23:59</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.max(0, (hoursLeft / 120) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          ⚡ Time bonus = sisa jam × 0.1 pts &nbsp;|&nbsp; ✅ Admin verifies every Wednesday
        </p>
      </div>

      {/* Mission list */}
      <div className="space-y-3">
        {weekMissions.map((mission, index) => (
          <motion.div key={mission.id} initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
          >
            <MissionCard mission={mission} onUpload={handleUpload} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
