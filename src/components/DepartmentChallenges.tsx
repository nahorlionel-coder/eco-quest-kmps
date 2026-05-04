import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Crown, Swords, Trophy, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Data ─────────────────────────────────────────────────────────────────────
const weeklyChampions = {
  individual: [
    {
      week: 1, period: 'Mar 31 – Apr 4',
      top3: [
        { rank: 1, name: 'Siti Rahayu',  dept: 'Marketing',   points: 95,  avatar: '👩' },
        { rank: 2, name: 'Ahmad Wijaya', dept: 'Finance',     points: 88,  avatar: '👨' },
        { rank: 3, name: 'Budi Santoso', dept: 'Engineering', points: 80,  avatar: '🧑' },
      ],
    },
    {
      week: 2, period: 'Apr 7 – Apr 11',
      top3: [
        { rank: 1, name: 'Maya Putri',   dept: 'R&D',    points: 102, avatar: '👩' },
        { rank: 2, name: 'Riko Pratama', dept: 'Design', points: 91,  avatar: '👨' },
        { rank: 3, name: 'Dewi Lestari', dept: 'HR',     points: 85,  avatar: '👩' },
      ],
    },
    {
      week: 3, period: 'Apr 14 – Apr 18',
      top3: [
        { rank: 1, name: 'Andi Saputra',   dept: 'Engineering', points: 110, avatar: '👨' },
        { rank: 2, name: 'Lisa Anggraeni', dept: 'Operations',  points: 98,  avatar: '👩' },
        { rank: 3, name: 'Siti Rahayu',    dept: 'Marketing',   points: 90,  avatar: '👩' },
      ],
    },
    {
      week: 4, period: 'Apr 21 – Apr 25',
      top3: [
        { rank: 1, name: 'Ahmad Wijaya', dept: 'Finance',     points: 99, avatar: '👨' },
        { rank: 2, name: 'Budi Santoso', dept: 'Engineering', points: 93, avatar: '🧑' },
        { rank: 3, name: 'Maya Putri',   dept: 'R&D',         points: 87, avatar: '👩' },
      ],
    },
  ],
  department: [
    { week: 1, period: 'Mar 31 – Apr 4',  name: 'Marketing',   totalPoints: 420, memberCount: 8  },
    { week: 2, period: 'Apr 7 – Apr 11',  name: 'Engineering', totalPoints: 390, memberCount: 10 },
    { week: 3, period: 'Apr 14 – Apr 18', name: 'Finance',     totalPoints: 445, memberCount: 7  },
    { week: 4, period: 'Apr 21 – Apr 25', name: 'R&D',         totalPoints: 360, memberCount: 6  },
  ],
};

const rankMedal = ['🥇', '🥈', '🥉'];
const rankColor = [
  'border-yellow-400/40 bg-yellow-400/10',
  'border-gray-400/40 bg-gray-400/10',
  'border-amber-600/40 bg-amber-600/10',
];
const rankTextColor = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];

// ─── Battle Card (W1 vs W2 / W3 vs W4) ───────────────────────────────────────
function BattleCard({
  weekA, weekB, type,
}: {
  weekA: number;
  weekB: number;
  type: 'individual' | 'department';
}) {
  if (type === 'individual') {
    const a = weeklyChampions.individual.find(c => c.week === weekA)!;
    const b = weeklyChampions.individual.find(c => c.week === weekB)!;

    // Tentukan pemenang per rank
    const results = [0, 1, 2].map(i => {
      const pa = a.top3[i], pb = b.top3[i];
      return { pa, pb, winner: pa.points > pb.points ? 'a' : pb.points > pa.points ? 'b' : 'tie' };
    });
    const winsA = results.filter(r => r.winner === 'a').length;
    const winsB = results.filter(r => r.winner === 'b').length;
    const overallWinner = winsA > winsB ? 'a' : winsB > winsA ? 'b' : 'tie';

    return (
      <Card className="overflow-hidden">
        {/* Top bar */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-destructive" />
              <span className="font-bold text-sm">Week {weekA} vs Week {weekB}</span>
            </div>
            <Badge variant="outline" className="text-xs border-yellow-400/40 text-yellow-400">
              {overallWinner === 'tie' ? '🤝 Seri' : `Week ${overallWinner === 'a' ? weekA : weekB} Menang`}
            </Badge>
          </div>

          {/* Matchups */}
          <div className="space-y-3">
            {results.map(({ pa, pb, winner }, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{rankMedal[i]}</span>
                  <span className="text-xs text-muted-foreground">Rank {i + 1}</span>
                </div>
                <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2">
                  {/* Player A */}
                  <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${winner === 'a' ? rankColor[0] : 'bg-muted/30 border-transparent'}`}>
                    <span className="text-lg shrink-0">{pa.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate">{pa.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{pa.dept}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${winner === 'a' ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      {pa.points}
                    </span>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <span className="text-xs font-black text-destructive">VS</span>
                  </div>

                  {/* Player B */}
                  <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${winner === 'b' ? rankColor[0] : 'bg-muted/30 border-transparent'}`}>
                    <span className={`text-xs font-bold shrink-0 ${winner === 'b' ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      {pb.points}
                    </span>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-semibold text-xs truncate">{pb.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{pb.dept}</p>
                    </div>
                    <span className="text-lg shrink-0">{pb.avatar}</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/40">
                  <motion.div
                    className="bg-yellow-400 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(pa.points / (pa.points + pb.points)) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                  <div className="bg-blue-400 h-full flex-1" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Week {weekA}</span>
                  <span>Week {weekB}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Department battle
  const a = weeklyChampions.department.find(c => c.week === weekA)!;
  const b = weeklyChampions.department.find(c => c.week === weekB)!;
  const winner = a.totalPoints > b.totalPoints ? 'a' : b.totalPoints > a.totalPoints ? 'b' : 'tie';
  const total = a.totalPoints + b.totalPoints;

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Week {weekA} vs Week {weekB}</span>
          </div>
          <Badge variant="outline" className="text-xs border-primary/40 text-primary">
            {winner === 'tie' ? '🤝 Seri' : `${winner === 'a' ? a.name : b.name} Menang`}
          </Badge>
        </div>

        {/* Dept cards */}
        <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-3">
          <div className={`p-3 rounded-xl border text-center space-y-1 ${winner === 'a' ? 'border-primary/40 bg-primary/10' : 'border-transparent bg-muted/30'}`}>
            {winner === 'a' && <Trophy className="w-4 h-4 text-primary mx-auto" />}
            <div className="text-2xl">🏢</div>
            <p className="font-bold text-sm">{a.name}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />{a.memberCount} orang
            </p>
            <p className={`text-base font-bold ${winner === 'a' ? 'text-primary' : ''}`}>{a.totalPoints} pts</p>
            <p className="text-xs text-muted-foreground">Week {a.week}</p>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-xs font-black text-destructive">VS</span>
          </div>

          <div className={`p-3 rounded-xl border text-center space-y-1 ${winner === 'b' ? 'border-primary/40 bg-primary/10' : 'border-transparent bg-muted/30'}`}>
            {winner === 'b' && <Trophy className="w-4 h-4 text-primary mx-auto" />}
            <div className="text-2xl">🏢</div>
            <p className="font-bold text-sm">{b.name}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />{b.memberCount} orang
            </p>
            <p className={`text-base font-bold ${winner === 'b' ? 'text-primary' : ''}`}>{b.totalPoints} pts</p>
            <p className="text-xs text-muted-foreground">Week {b.week}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="space-y-1">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/40">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(a.totalPoints / total) * 100}%` }}
              transition={{ duration: 1 }}
            />
            <div className="bg-gradient-to-r from-accent to-orange-400 h-full flex-1" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{a.name} — {a.totalPoints} pts</span>
            <span>{b.totalPoints} pts — {b.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Hall of Fame ─────────────────────────────────────────────────────────────
function HallOfFame() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏅</span>
        <h3 className="font-bold text-base">Hall of Fame — Juara Mingguan</h3>
      </div>
      <div className="space-y-3">
        {weeklyChampions.individual.map((champ, i) => {
          const dept = weeklyChampions.department.find(d => d.week === champ.week)!;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-3">
                    Week {champ.week} &nbsp;·&nbsp; {champ.period}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top 3 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Top Individu
                      </p>
                      {champ.top3.map((p, j) => (
                        <div key={j} className={`flex items-center gap-2 p-2 rounded-lg border ${rankColor[j]}`}>
                          <span className="text-sm shrink-0">{rankMedal[j]}</span>
                          <span className="text-base shrink-0">{p.avatar}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.dept}</p>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${rankTextColor[j]}`}>{p.points}</span>
                        </div>
                      ))}
                    </div>
                    {/* Top Dept */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Top Departemen
                      </p>
                      <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border border-primary/30 bg-primary/10 text-center gap-1">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-2xl">🏢</span>
                        <p className="font-bold text-sm">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{dept.memberCount} anggota</p>
                        <p className="text-sm font-bold text-primary">{dept.totalPoints} pts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function DepartmentChallenges() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">⚔️ Battle Arena</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Juara minggu 1 vs 2, dan minggu 3 vs 4
          </p>
        </div>
        <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">
          Monthly
        </Badge>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="individual">
        <TabsList className="w-full">
          <TabsTrigger value="individual" className="flex-1 gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Individu
          </TabsTrigger>
          <TabsTrigger value="department" className="flex-1 gap-2">
            <Building2 className="w-4 h-4" /> Departemen
          </TabsTrigger>
          <TabsTrigger value="hof" className="flex-1 gap-2">
            <Trophy className="w-4 h-4" /> Hall of Fame
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="individual" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <BattleCard weekA={1} weekB={2} type="individual" />
              <BattleCard weekA={3} weekB={4} type="individual" />
            </motion.div>
          </TabsContent>

          <TabsContent value="department" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <BattleCard weekA={1} weekB={2} type="department" />
              <BattleCard weekA={3} weekB={4} type="department" />
            </motion.div>
          </TabsContent>

          <TabsContent value="hof" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <HallOfFame />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
