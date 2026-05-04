import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMissions } from '@/hooks/useMissions';

export function FloatingMissionIcon() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { missions } = useMissions();

  const completedCount = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const remaining = user ? totalMissions - completedCount : '?';

  return (
    <motion.div
      className="fixed top-1/2 right-4 sm:right-6 z-50 -translate-y-1/2"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0, y: [0, -10, 0] }}
      transition={{
        scale: { duration: 0.5, ease: "backOut" },
        rotate: { duration: 0.5, ease: "backOut" },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        onClick={() => navigate('/')}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 sm:p-4 rounded-full shadow-2xl border-2 border-white/20"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Target className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {remaining}
        </motion.div>
      </motion.button>

      <motion.div
        className="absolute bottom-full right-0 mb-2 bg-black/80 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {user ? `${completedCount}/${totalMissions} missions completed` : 'Login untuk misi'}
      </motion.div>
    </motion.div>
  );
}
