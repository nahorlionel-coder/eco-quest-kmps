import { motion } from 'framer-motion';
import { Check, Upload, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMissions, type MissionWithStatus } from '@/hooks/useMissions';

const levelColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };
const levelLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function getHoursLeft(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 0;
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
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} - ${fmt(friday)}`;
}

function MissionRow({ mission, onComplete }: { mission: MissionWithStatus; onComplete: (id: string, opts?: any) => void }) {
  const hoursLeft = getHoursLeft();
  const timeBonus = Math.round(hoursLeft * 0.1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-[#2b0033] p-4 rounded-xl border border-purple-900 gap-3"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-2xl shrink-0">{mission.icon}</div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate font-pixel text-xs">{mission.title}</h3>
          <p className={`text-xs ${levelColor[mission.difficulty]}`}>{levelLabel[mission.difficulty]}</p>
          <p className="text-xs text-gray-400 capitalize">{mission.category}</p>
          {!mission.completed && !mission.pending && timeBonus > 0 && (
            <p className="text-xs text-cyan-400 font-semibold">⚡ +{timeBonus} time bonus</p>
          )}
          {mission.pending && (
            <p className="text-xs text-amber-400 font-semibold">⏳ Pending — verified every Wednesday</p>
          )}
        </div>
      </div>

      <div className="bg-green-400 text-black px-3 py-1 rounded font-bold text-sm shrink-0">
        {mission.points + (mission.completed ? 0 : timeBonus)} PTS
      </div>

      <div className="flex gap-2 items-center shrink-0">
        {mission.completed && (
          <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
            <Check size={14} /> Done
          </div>
        )}
        {mission.pending && (
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            <Loader2 size={14} className="animate-spin" /> Pending
          </div>
        )}
        {!mission.completed && !mission.pending && mission.type === 'photo' && (
          <label className="cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onComplete(mission.id, { photoFile: f }); }}
            />
            <Button variant="secondary" size="sm" asChild><span><Upload size={14} className="mr-1 inline" />Upload</span></Button>
          </label>
        )}
        {!mission.completed && !mission.pending && mission.type === 'check-in' && (
          <Button variant="secondary" size="sm" onClick={() => onComplete(mission.id)}>
            <Check size={14} className="mr-1" />Check-in
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function MissionBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { missions, loading, completeMission } = useMissions();
  const hoursLeft = getHoursLeft();
  const period = getPeriodLabel();
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="bg-[#1a001f] text-white p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <div className="bg-green-400 text-black px-4 py-2 rounded font-semibold font-pixel text-xs">
          YOUR MISSION THIS WEEK
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-300">{period}</span>
          <div className="text-xs text-yellow-400 mt-0.5">⏱ {hoursLeft.toFixed(1)} hrs left</div>
        </div>
      </div>

      {user && (
        <>
          <div className="w-full bg-purple-900/50 rounded-full h-1.5 mb-2">
            <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-1.5 rounded-full transition-all"
              style={{ width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-4">⚡ Time bonus = sisa jam × 0.1 &nbsp;|&nbsp; ✅ Verified every Wednesday</p>
        </>
      )}

      {!user ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Lock className="w-10 h-10 text-purple-400" />
          <p className="text-gray-300 text-sm">Buat akun untuk melihat dan menyelesaikan misi minggu ini</p>
          <Button onClick={() => navigate('/auth')} className="bg-green-400 text-black hover:bg-green-300">
            Buat Akun / Masuk
          </Button>
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-gray-400">Memuat misi...</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Belum ada misi tersedia</div>
      ) : (
        <div className="space-y-3">
          {missions.map(mission => (
            <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
          ))}
        </div>
      )}

      {user && (
        <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
          <span>{completedCount}/{missions.length} completed</span>
          <span className="italic">Mission rotates every week</span>
        </div>
      )}
    </div>
  );
}
