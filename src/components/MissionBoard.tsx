import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dailyMissions, weeklySchedule } from '@/data/mockData';
import type { Mission } from '@/data/mockData';

const levelColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };
const levelLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function getWeekOfMonth(): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // Adjust for Monday as first day of week
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  // Calculate which week the current date falls into
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

function getPeriodLabel(weekNum: number): string {
  const now = new Date();
  const currentDate = now.getDate();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // Calculate Monday of current week
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 6 days from Monday
  const currentMonday = new Date(now);
  currentMonday.setDate(currentDate - daysFromMonday);
  
  // Calculate Friday of current week
  const currentFriday = new Date(currentMonday);
  currentFriday.setDate(currentMonday.getDate() + 4);
  
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(currentMonday)} - ${fmt(currentFriday)}`;
}

type MissionStatus = 'available' | 'pending' | 'approved';

function MissionRow({ mission, onUpload }: { mission: Mission; onUpload: (id: string, file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<MissionStatus>(mission.completed ? 'approved' : 'available');
  const [uploading, setUploading] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: status === 'available' ? 1.01 : 1 }}
      className="flex items-center justify-between bg-[#2b0033] p-4 rounded-xl border border-purple-900 gap-3"
    >
      {/* LEFT */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-2xl shrink-0">{mission.icon}</div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate font-pixel text-xs">{mission.title}</h3>
          <p className={`text-xs ${levelColor[mission.difficulty]}`}>{levelLabel[mission.difficulty]}</p>
          <p className="text-xs text-gray-400 capitalize">{mission.category}</p>
          {status === 'available' && timeBonus > 0 && (
            <p className="text-xs text-cyan-400 font-semibold">⚡ +{timeBonus} time bonus</p>
          )}
          {status === 'pending' && (
            <p className="text-xs text-amber-400 font-semibold">⏳ Pending — verified every Wednesday</p>
          )}
        </div>
      </div>

      {/* POINTS */}
      <div className="bg-green-400 text-black px-3 py-1 rounded font-bold text-sm shrink-0">
        {status === 'approved' ? mission.points : mission.points + timeBonus} PTS
      </div>

      {/* ACTION */}
      <div className="flex gap-2 items-center shrink-0">
        {status === 'approved' && (
          <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
            <Check size={14} /> Done
          </div>
        )}
        {status === 'pending' && (
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            <Loader2 size={14} className="animate-spin" /> Pending
          </div>
        )}
        {status === 'available' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Upload size={14} className="mr-1" />}
              Upload
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function MissionBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const weekNum = getWeekOfMonth();
  const scheduledIds = weeklySchedule[weekNum];
  const weekMissions = dailyMissions.filter(m => scheduledIds.includes(m.id));
  const hoursLeft = getHoursLeft();
  const period = getPeriodLabel(weekNum);
  const completedCount = weekMissions.filter(m => m.completed).length;

  const handleUpload = (id: string, file: File) => {
    if (!user) { navigate('/auth'); return; }
    console.log('upload mock', id, file.name);
  };

  return (
    <div className="bg-[#1a001f] text-white p-6 rounded-2xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <div className="bg-green-400 text-black px-4 py-2 rounded font-semibold font-pixel text-xs">
          WEEK {weekNum} — YOUR MISSION
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-300">{period}</span>
          <div className="text-xs text-yellow-400 mt-0.5">⏱ {hoursLeft.toFixed(1)} hrs left</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-purple-900/50 rounded-full h-1.5 mb-2">
        <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-1.5 rounded-full transition-all"
          style={{ width: `${weekMissions.length ? (completedCount / weekMissions.length) * 100 : 0}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mb-4">⚡ Time bonus = sisa jam × 0.1 &nbsp;|&nbsp; ✅ Verified every Wednesday</p>

      {/* MISSIONS */}
      <div className="space-y-3">
        {weekMissions.map(mission => (
          <MissionRow key={mission.id} mission={mission} onUpload={handleUpload} />
        ))}
      </div>

      {/* FOOTNOTE */}
      <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
        <span>{completedCount}/{weekMissions.length} completed</span>
        <span className="italic">Mission rotates every week</span>
      </div>
    </div>
  );
}
