import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trophy, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DailyMissions } from '@/components/DailyMissions';
import { dailyMissions, weeklySchedule } from '@/data/mockData';
import ecoPattern from '@/assets/eco-pattern.png';

function getWeekOfMonth(): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const currentDate = now.getDate();
  const weekNumber = Math.ceil((currentDate + adjustedFirstDay) / 7);
  return Math.min(weekNumber, 4);
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

function getPeriodLabel(): string {
  const now = new Date();
  const currentDate = now.getDate();
  const currentDay = now.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  const currentMonday = new Date(now);
  currentMonday.setDate(currentDate - daysFromMonday);
  const currentFriday = new Date(currentMonday);
  currentFriday.setDate(currentMonday.getDate() + 4);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(currentMonday)} - ${fmt(currentFriday)}`;
}

export default function YourMission() {
  const navigate = useNavigate();
  
  const weekNum = getWeekOfMonth();
  const scheduledIds = weeklySchedule[weekNum];
  const weekMissions = dailyMissions.filter(m => scheduledIds.includes(m.id));
  const completedCount = weekMissions.filter(m => m.completed).length;
  const totalMissions = weekMissions.length;
  const hoursLeft = getHoursLeft();
  const period = getPeriodLabel();
  const progressPercentage = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${ecoPattern})`,
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Gradient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </motion.button>
            
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                🎯 YOUR MISSION
              </h1>
              <p className="text-white/60 text-xs sm:text-sm">{period}</p>
            </motion.div>
            
            <div className="w-12 sm:w-16" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="container mx-auto px-4 py-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Progress</h3>
                <p className="text-white/60 text-xs sm:text-sm">Week {weekNum}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-white">
                <span className="text-xl sm:text-2xl font-bold">{completedCount}</span>
                <span className="text-white/60 text-sm sm:text-base">/ {totalMissions}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-white/60 text-xs">{progressPercentage.toFixed(0)}% completed</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Time Left</h3>
                <p className="text-white/60 text-xs sm:text-sm">This week</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-white">
                <span className="text-xl sm:text-2xl font-bold">{hoursLeft.toFixed(1)}</span>
                <span className="text-white/60 ml-1 text-sm sm:text-base">hours</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (hoursLeft / 120) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              <p className="text-white/60 text-xs">Until Friday 23:59</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Speed Bonus</h3>
                <p className="text-white/60 text-xs sm:text-sm">Active now</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-white">
                <span className="text-xl sm:text-2xl font-bold">+{Math.round(hoursLeft * 0.1)}</span>
                <span className="text-white/60 ml-1 text-sm sm:text-base">pts</span>
              </div>
              <p className="text-yellow-400 text-xs font-semibold">⚡ Complete missions faster for bonus points!</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 pb-8"
      >
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10">
          <DailyMissions />
        </div>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}