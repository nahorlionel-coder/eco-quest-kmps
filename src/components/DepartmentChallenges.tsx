import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Building2, Swords, Trophy, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock weekly champions data
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
        { rank: 1, name: 'Maya Putri',   dept: 'R&D',         points: 102, avatar: '👩' },
        { rank: 2, name: 'Riko Pratama', dept: 'Design',      points: 91,  avatar: '👨' },
        { rank: 3, name: 'Dewi Lestari', dept: 'HR',          points: 85,  avatar: '👩' },
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
        { rank: 1, name: 'Ahmad Wijaya', dept: 'Finance',     points: 99,  avatar: '👨' },
        { rank: 2, name: 'Budi Santoso', dept: 'Engineering', points: 93,  avatar: '🧑' },
        { rank: 3, name: 'Maya Putri',   dept: 'R&D',         points: 87,  avatar: '👩' },
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

const battles = [
  { id: 'w1w2', label: 'Week 1 vs Week 2', weekA: 1, weekB: 2 },
  { id: 'w3w4', label: 'Week 3 vs Week 4', weekA: 3, weekB: 4 },
];

function IndividualBattle({ weekA, weekB, label }: { weekA: number; weekB: number; label: string }) {
  const a = weeklyChampions.individual.find(c => c.week === weekA)!;
  const b = weeklyChampions.individual.find(c => c.week === weekB)!;

  const rankEmoji = ['🥇', '🥈', '🥉'];

  return (
    <Card variant="glass" className="overflow-hidden border-yellow-400/20">
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</span>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs gap-1">
            <Crown className="w-3 h-3" /> Individual
          </Badge>
        </div>

        <div className="space-y-3">
          {[0, 1, 2].map(i => {
            const pa = a.top3[i];
            const pb = b.top3[i];
            const winner = pa.points > pb.points ? 'a' : pb.points > pa.points ? 'b' : 'tie';

            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm">{rankEmoji[i]}</span>
                  <span className="text-xs text-muted-foreground font-semibold">Rank {i + 1} Battle</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {/* Player A */}
                  <div className={`flex items-center gap-2 p-2 rounded-xl ${winner === 'a' ? 'bg-yellow-500/15 border border-yellow-400/40' : 'bg-muted/30'}`}>
                    <span className="text-xl shrink-0">{pa.avatar}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{pa.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{pa.dept}</p>
                      <p className={`text-xs font-bold ${winner === 'a' ? 'text-yellow-400' : 'text-primary'}`}>{pa.points} pts</p>
                    </div>
                    {winner === 'a' && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
                  </div>

                  {/* VS */}
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <Swords className="w-4 h-4 text-destructive" />
                    <span className="text-[10px] font-black text-destructive">VS</span>
                  </motion.div>

                  {/* Player B */}
                  <div className={`flex items-center gap-2 p-2 rounded-xl ${winner === 'b' ? 'bg-yellow-500/15 border border-yellow-400/40' : 'bg-muted/30'}`}>
                    {winner === 'b' && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate">{pb.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{pb.dept}</p>
                      <p className={`text-xs font-bold ${winner === 'b' ? 'text-yellow-400' : 'text-primary'}`}>{pb.points} pts</p>
                    </div>
                    <span className="text-xl shrink-0">{pb.avatar}</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/50">
                  <motion.div className="bg-yellow-400 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(pa.points / (pa.points + pb.points)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                  <div className="bg-blue-400 h-full flex-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DepartmentBattle({ weekA, weekB, label }: { weekA: number; weekB: number; label: string }) {
  const a = weeklyChampions.department.find(c => c.week === weekA)!;
  const b = weeklyChampions.department.find(c => c.week === weekB)!;
  const winner = a.totalPoints > b.totalPoints ? 'a' : b.totalPoints > a.totalPoints ? 'b' : 'tie';

  return (
    <Card variant="glass" className="overflow-hidden border-primary/20">
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1">
            <Building2 className="w-3 h-3" /> Department
          </Badge>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Dept A */}
          <motion.div
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
              winner === 'a' ? 'bg-primary/15 border border-primary/40' : 'bg-muted/30'
            }`}
            animate={winner === 'a' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {winner === 'a' && <Trophy className="w-4 h-4 text-primary" />}
            <span className="text-3xl">🏢</span>
            <div className="text-center">
              <p className="font-bold text-sm">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.memberCount} members</p>
              <p className={`text-sm font-bold mt-1 ${winner === 'a' ? 'text-primary' : 'text-foreground'}`}>
                {a.totalPoints} pts
              </p>
              <p className="text-xs text-muted-foreground">Week {a.week}</p>
            </div>
            {winner === 'a' && (
              <Badge className="bg-primary text-primary-foreground text-xs font-bold">WINNER</Badge>
            )}
          </motion.div>

          {/* VS */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex flex-col items-center gap-1"
          >
            <Shield className="w-6 h-6 text-destructive" />
            <span className="font-black text-destructive text-xs">VS</span>
          </motion.div>

          {/* Dept B */}
          <motion.div
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
              winner === 'b' ? 'bg-primary/15 border border-primary/40' : 'bg-muted/30'
            }`}
            animate={winner === 'b' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {winner === 'b' && <Trophy className="w-4 h-4 text-primary" />}
            <span className="text-3xl">🏢</span>
            <div className="text-center">
              <p className="font-bold text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.memberCount} members</p>
              <p className={`text-sm font-bold mt-1 ${winner === 'b' ? 'text-primary' : 'text-foreground'}`}>
                {b.totalPoints} pts
              </p>
              <p className="text-xs text-muted-foreground">Week {b.week}</p>
            </div>
            {winner === 'b' && (
              <Badge className="bg-primary text-primary-foreground text-xs font-bold">WINNER</Badge>
            )}
          </motion.div>
        </div>

        {/* Score bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{a.totalPoints} pts</span>
            <span>{b.totalPoints} pts</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted/50">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(a.totalPoints / (a.totalPoints + b.totalPoints)) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <motion.div
              className="bg-gradient-to-r from-accent to-orange-400 h-full flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DepartmentChallenges() {
  const [activeTab, setActiveTab] = useState<'individual' | 'department'>('individual');

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
        <span className="text-3xl">⚔️</span>
        <h2 className="text-2xl font-bold font-display">Battle</h2>
        <Badge variant="outline" className="ml-auto border-destructive/40 text-destructive text-xs gap-1">
          <Swords className="w-3 h-3" /> Weekly Champions
        </Badge>
      </motion.div>

      <p className="text-sm text-muted-foreground">
        Weekly champions face off — W1 vs W2, W3 vs W4
      </p>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl">
        <button onClick={() => setActiveTab('individual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'individual' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Crown className="w-4 h-4 text-yellow-400" /> Individual
        </button>
        <button onClick={() => setActiveTab('department')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'department' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4 text-primary" /> Department
        </button>
      </div>

      {/* Battles */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} className="space-y-4"
        >
          {battles.map(b => (
            activeTab === 'individual'
              ? <IndividualBattle key={b.id} weekA={b.weekA} weekB={b.weekB} label={b.label} />
              : <DepartmentBattle key={b.id} weekA={b.weekA} weekB={b.weekB} label={b.label} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Previous Weekly Champions Hall of Fame */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
        <div className="flex items-center gap-2 pt-2">
          <span className="text-xl">🏅</span>
          <h3 className="text-lg font-bold font-display">Previous Weekly Champions</h3>
        </div>

        {weeklyChampions.individual.map((champ, i) => {
          const dept = weeklyChampions.department.find(d => d.week === champ.week)!;
          const rankEmoji = ['🥇', '🥈', '🥉'];
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <Card variant="glass" className="border-yellow-400/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600" />
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-3 uppercase tracking-wide">
                    Week {champ.week} — {champ.period}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top 3 Individual */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-bold">Top Players</span>
                      </div>
                      {champ.top3.map((p, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="text-sm">{rankEmoji[j]}</span>
                          <span className="text-lg">{p.avatar}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.dept}</p>
                          </div>
                          <span className="text-xs text-yellow-400 font-bold ml-auto shrink-0">{p.points}pts</span>
                        </div>
                      ))}
                    </div>
                    {/* Top Dept */}
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-bold">Top Dept</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏢</span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">{dept.memberCount} members</p>
                          <p className="text-xs text-primary font-semibold">{dept.totalPoints} pts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
