import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MissionWithStatus {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'energy' | 'waste' | 'commute' | 'food';
  type: 'check-in' | 'photo' | 'qr';
  icon: string;
  completed: boolean;
  pending: boolean;
  is_sponsored: boolean;
  sponsor_name: string | null;
  redirect_url: string | null;
  sort_order: number;
  frequency: 'daily' | 'weekly';
  difficulty: 'easy' | 'medium' | 'hard';
  is_bonus: boolean;
  unlock_level: number;
  hoursLeft?: number;
  speedBonus?: number;
}

// Get current week's Monday
function getCurrentWeekMonday(): Date {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get current week's Friday
function getCurrentWeekFriday(): Date {
  const monday = getCurrentWeekMonday();
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 0);
  return friday;
}

function getHoursLeft(): number {
  const friday = getCurrentWeekFriday();
  const left = (friday.getTime() - Date.now()) / (1000 * 60 * 60);
  return Math.max(0, Math.round(left));
}

function calcSpeedBonus(basePoints: number): number {
  const start = getCurrentWeekMonday().getTime();
  const hoursElapsed = (Date.now() - start) / (1000 * 60 * 60);
  if (hoursElapsed < 24) return Math.round(basePoints * 0.5);
  if (hoursElapsed < 48) return Math.round(basePoints * 0.3);
  if (hoursElapsed < 72) return Math.round(basePoints * 0.15);
  return 0;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function useMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    if (!user) { setLoading(false); return; }

    const periodStart = getCurrentWeekMonday().toISOString().split('T')[0];
    const periodEnd = getCurrentWeekFriday().toISOString().split('T')[0];

    // Check existing assignments for this period
    const { data: existing } = await supabase
      .from('user_mission_assignments')
      .select('mission_id, is_bonus')
      .eq('user_id', user.id)
      .eq('period_start', periodStart);

    let assignedIds: string[] = (existing || []).map(a => a.mission_id);

    // If no assignments yet, create them
    if (assignedIds.length === 0) {
      const { data: allMissions } = await supabase
        .from('missions')
        .select('id, difficulty, is_bonus, unlock_level')
        .eq('active', true)
        .eq('frequency', 'weekly');

      if (allMissions) {
        const profile = await supabase.from('profiles').select('level').eq('user_id', user.id).single();
        const userLevel = profile.data?.level ?? 1;

        const defaultPool = allMissions.filter(m => !(m as any).is_bonus);
        const bonusPool = allMissions.filter(m => (m as any).is_bonus && userLevel >= ((m as any).unlock_level ?? 1));

        const hard = pickRandom(defaultPool.filter(m => (m as any).difficulty === 'hard'), 1);
        const medium = pickRandom(defaultPool.filter(m => (m as any).difficulty === 'medium'), 2);
        const easy = pickRandom(defaultPool.filter(m => (m as any).difficulty === 'easy'), 2);
        const bonus = pickRandom(bonusPool, Math.min(5, bonusPool.length));

        const toAssign = [
          ...hard.map(m => ({ user_id: user.id, mission_id: m.id, period_start: periodStart, period_end: periodEnd, is_bonus: false })),
          ...medium.map(m => ({ user_id: user.id, mission_id: m.id, period_start: periodStart, period_end: periodEnd, is_bonus: false })),
          ...easy.map(m => ({ user_id: user.id, mission_id: m.id, period_start: periodStart, period_end: periodEnd, is_bonus: false })),
          ...bonus.map(m => ({ user_id: user.id, mission_id: m.id, period_start: periodStart, period_end: periodEnd, is_bonus: true })),
        ];

        if (toAssign.length > 0) {
          await supabase.from('user_mission_assignments').insert(toAssign);
          assignedIds = toAssign.map(a => a.mission_id);
        }
      }
    }

    if (assignedIds.length === 0) { setLoading(false); return; }

    // Fetch full mission data for assigned ids
    const { data: missionsData } = await supabase
      .from('missions')
      .select('*')
      .in('id', assignedIds);

    if (!missionsData) { setLoading(false); return; }

    // Check completions for this period
    const { data: completions } = await supabase
      .from('mission_completions')
      .select('mission_id, status')
      .eq('user_id', user.id)
      .eq('week_start', periodStart);

    const completedIds = (completions || []).filter(c => (c as any).status === 'approved').map(c => c.mission_id);
    const pendingIds = (completions || []).filter(c => (c as any).status === 'pending').map(c => c.mission_id);

    const assignmentMap = Object.fromEntries((existing || []).map(a => [a.mission_id, a.is_bonus]));

    const mapped: MissionWithStatus[] = missionsData.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      points: m.points,
      category: m.category as MissionWithStatus['category'],
      type: m.type as MissionWithStatus['type'],
      icon: m.icon,
      completed: completedIds.includes(m.id),
      pending: pendingIds.includes(m.id),
      is_sponsored: m.is_sponsored ?? false,
      sponsor_name: m.sponsor_name ?? null,
      redirect_url: m.redirect_url ?? null,
      sort_order: m.sort_order ?? 0,
      frequency: ((m as any).frequency ?? 'weekly') as 'daily' | 'weekly',
      difficulty: ((m as any).difficulty ?? 'medium') as 'easy' | 'medium' | 'hard',
      is_bonus: assignmentMap[m.id] ?? false,
      unlock_level: (m as any).unlock_level ?? 1,
      hoursLeft: getHoursLeft(),
      speedBonus: !completedIds.includes(m.id) ? calcSpeedBonus(m.points) : undefined,
    }));

    mapped.sort((a, b) => {
      const order = { hard: 0, medium: 1, easy: 2 };
      return order[a.difficulty] - order[b.difficulty];
    });

    setMissions(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchMissions(); }, [user]);

  const completeMission = async (missionId: string, options?: { photoFile?: File; qrCode?: string }) => {
    if (!user) { toast.error('Silakan login terlebih dahulu'); return false; }

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed || mission.pending) return false;

    let photoUrl: string | null = null;

    if (options?.photoFile) {
      const ext = options.photoFile.name.split('.').pop();
      const path = `${user.id}/${missionId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('mission-photos').upload(path, options.photoFile);
      if (uploadError) { toast.error('Gagal mengupload foto'); return false; }
      const { data: urlData } = supabase.storage.from('mission-photos').getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    const isPhotoMission = mission.type === 'photo' && options?.photoFile;
    const status = isPhotoMission ? 'pending' : 'approved';
    const speedBonus = !isPhotoMission ? calcSpeedBonus(mission.points) : 0;
    const totalPoints = mission.points + speedBonus;
    const periodStart = getCurrentWeekMonday().toISOString().split('T')[0];

    const { data: insertedData, error } = await supabase
      .from('mission_completions')
      .insert({
        user_id: user.id,
        mission_id: missionId,
        points_earned: totalPoints,
        photo_url: photoUrl,
        qr_code: options?.qrCode || null,
        status,
        week_start: periodStart,
      })
      .select('id')
      .single();

    if (error) {
      toast.error(error.code === '23505' ? 'Misi ini sudah diselesaikan' : 'Gagal menyelesaikan misi');
      return false;
    }

    if (isPhotoMission && insertedData) {
      toast.info('📸 Foto sedang diverifikasi AI...');
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, pending: true } : m));
      try {
        const resp = await supabase.functions.invoke('verify-photo', {
          body: { completion_id: insertedData.id, photo_url: photoUrl, mission_title: mission.title, mission_description: mission.description },
        });
        if (resp.data?.status === 'approved') {
          toast.success(`+${totalPoints} poin! 🎉 Foto terverifikasi AI!`);
          setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true, pending: false } : m));
        } else {
          toast.info('📋 Foto menunggu verifikasi manual admin');
        }
      } catch {
        toast.info('📋 Foto akan diverifikasi oleh admin');
      }
    } else {
      const bonusMsg = speedBonus > 0 ? ` (+${speedBonus} speed bonus! ⚡)` : '';
      toast.success(`+${totalPoints} poin! 🎉 ${mission.title} selesai!${bonusMsg}`);
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));
    }

    return true;
  };

  return { missions, loading, completeMission, refetch: fetchMissions };
}
