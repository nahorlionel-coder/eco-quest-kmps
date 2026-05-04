import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Crown, Loader2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Entry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  department: string | null;
  points: number;
  rank: number;
}

interface DeptEntry {
  name: string;
  totalPoints: number;
  memberCount: number;
  avgPoints: number;
  rank: number;
}

const medalEmoji = ['🥇', '🥈', '🥉'];
const medalBg = [
  'bg-yellow-400/15 border-yellow-400/40',
  'bg-gray-400/15 border-gray-400/40',
  'bg-amber-600/15 border-amber-600/40',
];
const medalText = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

// ─── Podium ───────────────────────────────────────────────────────────────────
function Podium({ entries }: { entries: Entry[] }) {
  if (entries.length < 3) return null;
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ['h-16', 'h-24', 'h-12'];
  const podiumColors = [
    'bg-gradient-to-t from-gray-500 to-gray-400',
    'bg-gradient-to-t from-yellow-600 to-yellow-400',
    'bg-gradient-to-t from-amber-700 to-amber-500',
  ];

  return (
    <div className="flex items-end justify-center gap-3 mb-6 pt-4">
      {podiumOrder.map((entryIdx, podiumIdx) => {
        const e = entries[entryIdx];
        return (
          <motion.div key={e.user_id} className="flex flex-col items-center gap-2 flex-1"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: podiumIdx * 0.15 }}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl border-2 border-white/20">
                👤
              </div>
              <span className="absolute -top-2 -right-1 text-base">{medalEmoji[entryIdx]}</span>
            </div>
            {/* Name */}
            <p className="text-xs font-semibold text-center truncate w-full px-1">
              {(e.display_name || 'User').split(' ')[0]}
            </p>
            {/* Podium block */}
            <div className={`w-full ${heights[podiumIdx]} ${podiumColors[podiumIdx]} rounded-t-lg flex flex-col items-center justify-center`}>
              <p className="text-white font-bold text-sm">{e.points.toLocaleString()}</p>
              <p className="text-white/70 text-xs">pts</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Individual Row ───────────────────────────────────────────────────────────
function IndividualRow({ entry, maxPoints, isMe }: { entry: Entry; maxPoints: number; isMe: boolean }) {
  const isTop3 = entry.rank <= 3;
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.03 }}
    >
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isMe ? 'border-primary/50 bg-primary/10' :
        isTop3 ? `${medalBg[entry.rank - 1]}` :
        'border-transparent bg-muted/30 hover:bg-muted/50'
      }`}>
        {/* Rank */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
          isTop3 ? medalText[entry.rank - 1] : 'text-muted-foreground'
        }`}>
          {isTop3 ? medalEmoji[entry.rank - 1] : `#${entry.rank}`}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">👤</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{entry.display_name || 'EcoWarrior'}</p>
            {isMe && <Badge className="text-xs px-1.5 py-0 h-5">Kamu</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{entry.department || '—'}</p>
          {isTop3 && (
            <Progress value={(entry.points / maxPoints) * 100} className="h-1 mt-1" />
          )}
        </div>

        {/* Points */}
        <div className="text-right shrink-0">
          <p className={`font-bold text-base ${isTop3 ? medalText[entry.rank - 1] : ''}`}>
            {entry.points.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">pts</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Department Row ───────────────────────────────────────────────────────────
function DeptRow({ dept, maxPoints }: { dept: DeptEntry; maxPoints: number }) {
  const isTop3 = dept.rank <= 3;
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: dept.rank * 0.05 }}
    >
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isTop3 ? `${medalBg[dept.rank - 1]}` : 'border-transparent bg-muted/30 hover:bg-muted/50'
      }`}>
        {/* Rank */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
          isTop3 ? medalText[dept.rank - 1] : 'text-muted-foreground'
        }`}>
          {isTop3 ? medalEmoji[dept.rank - 1] : `#${dept.rank}`}
        </div>

        {/* Icon */}
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{dept.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />{dept.memberCount} anggota · rata-rata {dept.avgPoints} pts
          </p>
          {isTop3 && (
            <Progress value={(dept.totalPoints / maxPoints) * 100} className="h-1 mt-1" />
          )}
        </div>

        {/* Points */}
        <div className="text-right shrink-0">
          <p className={`font-bold text-base ${isTop3 ? medalText[dept.rank - 1] : ''}`}>
            {dept.totalPoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">total pts</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profilesApi.list()
      .then(data => setEntries(
        [...data]
          .sort((a: any, b: any) => b.points - a.points)
          .map((p: any, i: number) => ({
            user_id: p.userId,
            display_name: p.displayName || 'EcoWarrior',
            avatar_url: p.avatarUrl,
            department: p.department,
            points: p.points,
            rank: i + 1,
          }))
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Department aggregation
  const deptMap = new Map<string, { total: number; count: number }>();
  entries.forEach(e => {
    const dept = e.department || 'Lainnya';
    const prev = deptMap.get(dept) || { total: 0, count: 0 };
    deptMap.set(dept, { total: prev.total + e.points, count: prev.count + 1 });
  });
  const departments: DeptEntry[] = Array.from(deptMap.entries())
    .map(([name, { total, count }]) => ({
      name, totalPoints: total, memberCount: count,
      avgPoints: Math.round(total / count), rank: 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((d, i) => ({ ...d, rank: i + 1 }));

  const maxIndividual = entries[0]?.points || 1;
  const maxDept = departments[0]?.totalPoints || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">🏆 Leaderboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Peringkat berdasarkan total poin</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {entries.length} peserta
        </Badge>
      </motion.div>

      <Tabs defaultValue="individual">
        <TabsList className="w-full">
          <TabsTrigger value="individual" className="flex-1 gap-2">
            <Crown className="w-4 h-4" /> Individu
          </TabsTrigger>
          <TabsTrigger value="department" className="flex-1 gap-2">
            <Building2 className="w-4 h-4" /> Departemen
          </TabsTrigger>
        </TabsList>

        {/* ── Individual ── */}
        <TabsContent value="individual" className="mt-4 space-y-2">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Belum ada data</p>
          ) : (
            <>
              <Podium entries={entries} />
              <div className="space-y-2">
                {entries.map(entry => (
                  <IndividualRow
                    key={entry.user_id}
                    entry={entry}
                    maxPoints={maxIndividual}
                    isMe={user?.id === entry.user_id}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Department ── */}
        <TabsContent value="department" className="mt-4 space-y-2">
          {departments.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {departments.map(dept => (
                <DeptRow key={dept.name} dept={dept} maxPoints={maxDept} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── The Three Barons ── */}
      {entries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="overflow-hidden border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent">
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">The Three Barons</h3>
                  <p className="text-xs text-muted-foreground">Top 3 peserta bulan ini berdasarkan total poin</p>
                </div>
                <Badge variant="outline" className="ml-auto border-yellow-400/50 text-yellow-500 text-xs">
                  Bulanan
                </Badge>
              </div>

              <div className="space-y-2">
                {entries.slice(0, 3).map((entry, i) => {
                  const titles = ['Baron Emas', 'Baron Perak', 'Baron Perunggu'];
                  const colors = [
                    'from-yellow-400 to-yellow-600',
                    'from-gray-400 to-gray-500',
                    'from-amber-600 to-amber-700',
                  ];
                  return (
                    <motion.div key={entry.user_id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${colors[i]} shadow`}
                    >
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">
                        {medalEmoji[i]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{entry.display_name || 'EcoWarrior'}</p>
                        <p className="text-white/70 text-xs">{entry.department || '—'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-bold">{entry.points.toLocaleString()} pts</p>
                        <p className="text-white/70 text-xs">{titles[i]}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                🔄 Reset setiap awal bulan · Pengumuman setiap Jumat terakhir
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Weekly Knights, Lucky Draw, Battle Arena ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 gap-3"
      >
        {/* Weekly Knights */}
        <Card className="border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow text-xl shrink-0">
                ⚔️
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Weekly Knights</h4>
                <p className="text-xs text-muted-foreground">Top 3 poin tertinggi setiap minggu</p>
              </div>
              <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs shrink-0">Mingguan</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-purple-500/10 rounded-lg p-2 text-center">
                <p className="text-purple-400 font-semibold">🏅 Pemenang</p>
                <p className="text-muted-foreground mt-0.5">Top 3</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-2 text-center">
                <p className="text-purple-400 font-semibold">📊 Basis</p>
                <p className="text-muted-foreground mt-0.5">Poin mingguan</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-2 text-center">
                <p className="text-purple-400 font-semibold">⏰ Reset</p>
                <p className="text-muted-foreground mt-0.5">Setiap Senin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lucky Draw */}
        <Card className="border-green-400/30 bg-gradient-to-br from-green-500/10 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow text-xl shrink-0">
                🎲
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Lucky Draw</h4>
                <p className="text-xs text-muted-foreground">Undian berhadiah setiap akhir bulan</p>
              </div>
              <Badge variant="outline" className="border-green-400/50 text-green-400 text-xs shrink-0">Bulanan</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-500/10 rounded-lg p-2 text-center">
                <p className="text-green-400 font-semibold">🎟️ Pemenang</p>
                <p className="text-muted-foreground mt-0.5">1 orang</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2 text-center">
                <p className="text-green-400 font-semibold">📌 Syarat</p>
                <p className="text-muted-foreground mt-0.5">Min. 50 pts</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2 text-center">
                <p className="text-green-400 font-semibold">⭐ Bonus</p>
                <p className="text-muted-foreground mt-0.5">Newbie 2×</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battle Arena */}
        <Card className="border-red-400/30 bg-gradient-to-br from-red-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow text-xl shrink-0">
                🔥
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Battle Arena</h4>
                <p className="text-xs text-muted-foreground">Juara minggu 1 vs 2, minggu 3 vs 4</p>
              </div>
              <Badge variant="outline" className="border-red-400/50 text-red-400 text-xs shrink-0">Live</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-red-500/10 rounded-lg p-2 text-center">
                <p className="text-red-400 font-semibold">🏆 Format</p>
                <p className="text-muted-foreground mt-0.5">W1 vs W2</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-2 text-center">
                <p className="text-red-400 font-semibold">📊 Basis</p>
                <p className="text-muted-foreground mt-0.5">Poin mingguan</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-2 text-center">
                <p className="text-red-400 font-semibold">🔄 Siklus</p>
                <p className="text-muted-foreground mt-0.5">Per bulan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
