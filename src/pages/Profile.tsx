import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, LogOut, Trophy, Flame, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  points: number;
  level: number;
  streak: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
      setDepartment(data.department || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, department })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Gagal menyimpan profil');
    } else {
      toast.success('Profil berhasil diperbarui! ✨');
      setEditing(false);
      fetchProfile();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const stats = [
    { icon: Trophy, label: 'Poin', value: profile?.points || 0, color: 'text-primary' },
    { icon: Star, label: 'Level', value: profile?.level || 1, color: 'text-secondary' },
    { icon: Flame, label: 'Streak', value: `${profile?.streak || 0} hari`, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-6 max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="mb-6 overflow-hidden">
            {/* Banner */}
            <div className="h-28 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
            </div>

            <CardContent className="-mt-12 relative">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 border-4 border-card shadow-glow-sm">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : null}
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {(profile?.display_name || user?.email)?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold font-display mt-4">
                  {profile?.display_name || 'EcoWarrior'}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                {profile?.department && (
                  <Badge variant="outline" className="mt-2 border-primary/30 text-primary">
                    {profile.department}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {stats.map((stat) => (
            <Card key={stat.label} variant="glass" className="text-center p-4">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-bold font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Edit Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Edit Profil</CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button variant="glow" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editing}
                  className="bg-muted/50 border-white/10"
                  placeholder="Nama kamu"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Departemen</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!editing}
                  className="bg-muted/50 border-white/10"
                  placeholder="Engineering, Marketing, dll."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted/50 border-white/10 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
