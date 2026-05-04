import { useState, useEffect } from 'react';
import { missionsApi, uploadApi } from '@/lib/api';
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

function getCurrentWeekMonday(): Date {
  const now = new Date();
  const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getCurrentWeekFriday(): Date {
  const friday = new Date(getCurrentWeekMonday());
  friday.setDate(friday.getDate() + 4);
  friday.setHours(23, 59, 59, 0);
  return friday;
}

function getHoursLeft(): number {
  const left = (getCurrentWeekFriday().getTime() - Date.now()) / (1000 * 60 * 60);
  return Math.max(0, Math.round(left));
}

function calcSpeedBonus(basePoints: number): number {
  const friday = getCurrentWeekFriday();
  const hoursLeft = Math.max(0, (friday.getTime() - Date.now()) / (1000 * 60 * 60));
  return Math.round(hoursLeft * 0.1);
}

export function useMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [allMissions, completions] = await Promise.all([
        missionsApi.list(),
        missionsApi.myCompletions(),
      ]);

      const completedIds = completions.filter((c: any) => c.status === 'approved').map((c: any) => c.missionId);
      const pendingIds = completions.filter((c: any) => c.status === 'pending').map((c: any) => c.missionId);

      const mapped: MissionWithStatus[] = allMissions.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        points: m.points,
        category: m.category,
        type: m.type,
        icon: m.icon,
        completed: completedIds.includes(m.id),
        pending: pendingIds.includes(m.id),
        is_sponsored: m.isSponsored ?? false,
        sponsor_name: m.sponsorName ?? null,
        redirect_url: m.redirectUrl ?? null,
        sort_order: m.sortOrder ?? 0,
        frequency: m.frequency ?? 'weekly',
        difficulty: m.difficulty ?? 'medium',
        is_bonus: m.isBonus ?? false,
        unlock_level: m.unlockLevel ?? 1,
        hoursLeft: getHoursLeft(),
        speedBonus: !completedIds.includes(m.id) ? calcSpeedBonus(m.points) : undefined,
      }));

      mapped.sort((a, b) => ({ hard: 0, medium: 1, easy: 2 }[a.difficulty] - { hard: 0, medium: 1, easy: 2 }[b.difficulty]));
      setMissions(mapped);
    } catch {
      toast.error('Gagal memuat misi');
    }
    setLoading(false);
  };

  useEffect(() => { fetchMissions(); }, [user]);

  const completeMission = async (missionId: string, options?: { photoFile?: File; qrCode?: string }) => {
    if (!user) { toast.error('Silakan login terlebih dahulu'); return false; }

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed || mission.pending) return false;

    let photoUrl: string | null = null;

    if (options?.photoFile) {
      try {
        const { url } = await uploadApi.photo(options.photoFile);
        photoUrl = url;
      } catch {
        toast.error('Gagal mengupload foto');
        return false;
      }
    }

    const isPhotoMission = mission.type === 'photo' && options?.photoFile;
    const speedBonus = !isPhotoMission ? calcSpeedBonus(mission.points) : 0;
    const totalPoints = mission.points + speedBonus;

    try {
      const result = await missionsApi.complete({
        missionId,
        photoUrl,
        qrCode: options?.qrCode || null,
        pointsEarned: totalPoints,
      });

      if (isPhotoMission) {
        toast.info('📸 Foto menunggu verifikasi admin');
        setMissions(prev => prev.map(m => m.id === missionId ? { ...m, pending: true } : m));
      } else {
        const bonusMsg = speedBonus > 0 ? ` (+${speedBonus} speed bonus! ⚡)` : '';
        toast.success(`+${totalPoints} poin! 🎉 ${mission.title} selesai!${bonusMsg}`);
        setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));
      }
      return true;
    } catch (e: any) {
      toast.error(e.message === 'Conflict' ? 'Misi ini sudah diselesaikan' : 'Gagal menyelesaikan misi');
      return false;
    }
  };

  return { missions, loading, completeMission, refetch: fetchMissions };
}
