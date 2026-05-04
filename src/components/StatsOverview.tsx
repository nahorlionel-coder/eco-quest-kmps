import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Recycle, Bike, Salad, Trophy, Flame, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getXPProgress, BONUS_UNLOCK_LEVELS, getPlayerTitle } from '@/lib/xp';

export function StatsOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ points: number; level: number; streak: number; display_name: string | null; department: string | null; avatar_url: string | null } | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const data = await profilesApi.me();
        setProfile({
          points: data.points,
          level: data.level,
          streak: data.streak,
          display_name: data.displayName ?? null,
          department: data.department ?? null,
          avatar_url: data.avatarUrl ?? null,
        });
        const all = await profilesApi.list();
        const sorted = [...all].sort((a, b) => b.points - a.points);
        const idx = sorted.findIndex((p: any) => p.userId === data.userId);
        setRank(idx + 1);
      } catch {}
    };
    fetch();
  }, [user]);

  const displayUser = profile ? {
    name: profile.display_name || 'EcoWarrior',
    department: profile.department || '-',
    points: profile.points,
    level: profile.level,
    streak: profile.streak,
    avatar: '/src/assets/aset-eco.svg',
    rank: rank || 0,
  } : {
    name: 'EcoWarrior',
    department: '-',
    points: 0,
    level: 1,
    streak: 0,
    avatar: '/src/assets/aset-eco.svg',
    rank: 0,
  };

  const xp = getXPProgress(displayUser.points);
  const nextUnlock = BONUS_UNLOCK_LEVELS.find(l => l > xp.level);
  const title = getPlayerTitle(xp.level);

  const categoryIcons = {
    energy: { icon: Zap, color: 'energy' as const },
    waste: { icon: Recycle, color: 'waste' as const },
    commute: { icon: Bike, color: 'commute' as const },
    food: { icon: Salad, color: 'food' as const },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card variant="glow" className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-4">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                {displayUser.avatar.startsWith('/') || displayUser.avatar.startsWith('http')
                  ? <img src={displayUser.avatar} alt="avatar" className="w-32 h-32 rounded-full" />
                  : <span className="text-5xl">{displayUser.avatar}</span>}
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-display">{displayUser.name}</h2>
                <p className="text-muted-foreground">{displayUser.department}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm">{title.emoji}</span>
                  <span className="text-sm font-semibold text-primary">{title.title}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="points" className="text-lg px-4 py-2">
                  <Trophy className="w-4 h-4 mr-1" />#{displayUser.rank}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display gradient-text">{displayUser.points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Poin</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="text-3xl font-bold font-display text-secondary">Lv.{xp.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6 text-accent" />
                  <span className="text-3xl font-bold font-display text-accent">{displayUser.streak}</span>
                </div>
                <div className="text-sm text-muted-foreground">Hari Streak</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Level {xp.level}</span>
                <span className="text-primary font-semibold">{xp.current} / {xp.required} XP</span>
              </div>
              <Progress value={xp.percent} indicatorColor="gradient" className="h-3" />
              {nextUnlock && (
                <p className="text-xs text-yellow-400 mt-2 text-right">
                  🔓 Bonus mission unlocks at Lv.{nextUnlock}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 gap-4">
        <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
          {!user ? 'Login untuk melihat statistik kategori' : 'Selesaikan misi untuk melihat statistik per kategori'}
        </div>
      </motion.div>
    </div>
  );
}
