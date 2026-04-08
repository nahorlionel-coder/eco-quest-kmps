import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dailyMissions, weeklySchedule } from '@/data/mockData';

function getWeekOfMonth(): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const currentDate = now.getDate();
  const weekNumber = Math.ceil((currentDate + adjustedFirstDay) / 7);
  return Math.min(weekNumber, 4);
}

export function FloatingMissionIcon() {
  const navigate = useNavigate();
  
  const weekNum = getWeekOfMonth();
  const scheduledIds = weeklySchedule[weekNum];
  const weekMissions = dailyMissions.filter(m => scheduledIds.includes(m.id));
  const completedCount = weekMissions.filter(m => m.completed).length;
  const totalMissions = weekMissions.length;

  const handleClick = () => {
    navigate('/your-mission');
  };

  return (
    <motion.div
      className="fixed top-1/2 right-4 sm:right-6 z-50 -translate-y-1/2"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        y: [0, -10, 0],
      }}
      transition={{
        scale: { duration: 0.5, ease: "backOut" },
        rotate: { duration: 0.5, ease: "backOut" },
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { rotate: { duration: 0.3 } }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        onClick={handleClick}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 sm:p-4 rounded-full shadow-2xl border-2 border-white/20"
        whileHover={{
          boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <Target className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
        
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {totalMissions - completedCount}
        </motion.div>
        
        <motion.div
          className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full"
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full"
          animate={{
            scale: [0, 1, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </motion.button>
      
      <motion.div
        className="absolute bottom-full right-0 mb-2 bg-black/80 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {completedCount}/{totalMissions} missions completed
      </motion.div>
    </motion.div>
  );
}