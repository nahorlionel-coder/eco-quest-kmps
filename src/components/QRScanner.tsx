import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, History, CheckCircle, Clock, X, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useMissions } from '@/hooks/useMissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Submission {
  id: string;
  mission_title: string;
  photo_url: string;
  status: string;
  points_earned: number;
  completed_at: string;
  ai_result?: string;
}

export function QRScanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { missions } = useMissions();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('mission_completions')
        .select('*')
        .eq('user_id', user.id)
        .not('photo_url', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const enriched = data.map(d => ({
          id: d.id,
          mission_title: d.mission_title || 'Unknown Mission',
          photo_url: d.photo_url,
          status: (d as any).status || 'pending',
          points_earned: d.points_earned,
          completed_at: d.completed_at,
          ai_result: (d as any).ai_result,
        }));
        setSubmissions(enriched);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [user]);

  // Get photo missions
  const photoMissions = missions.filter(m => m.type === 'photo');

  const handlePhotoUpload = async (file: File) => {
    if (!selectedMission || !user) return;
    
    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/${selectedMission.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mission-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(fileName);

      // Save completion record
      const { error: insertError } = await supabase
        .from('mission_completions')
        .insert({
          user_id: user.id,
          mission_id: selectedMission.id,
          mission_title: selectedMission.title,
          photo_url: publicUrl,
          points_earned: selectedMission.points,
          completion_date: new Date().toISOString().split('T')[0],
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success('Foto berhasil diupload! Menunggu verifikasi admin.');
      setSelectedMission(null);
      
      // Refresh submissions
      const { data } = await supabase
        .from('mission_completions')
        .select('*')
        .eq('user_id', user.id)
        .not('photo_url', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const enriched = data.map(d => ({
          id: d.id,
          mission_title: d.mission_title || 'Unknown Mission',
          photo_url: d.photo_url,
          status: (d as any).status || 'pending',
          points_earned: d.points_earned,
          completed_at: d.completed_at,
          ai_result: (d as any).ai_result,
        }));
        setSubmissions(enriched);
      }
      
    } catch (error: any) {
      toast.error('Gagal upload foto: ' + error.message);
    }
    setUploading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-primary/20 text-primary">✅ Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">❌ Ditolak</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-400">⏳ Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
        <span className="text-3xl">📸</span>
        <h2 className="text-2xl font-bold font-display">Photo Center</h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Foto
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Riwayat ({submissions.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            {!user ? (
              <Card variant="glass">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="font-bold font-display text-lg mb-2">Login Diperlukan</h3>
                  <p className="text-muted-foreground mb-4">Silakan login untuk upload foto misi</p>
                  <Button onClick={() => navigate('/auth')} variant="glow">
                    Login Sekarang
                  </Button>
                </CardContent>
              </Card>
            ) : photoMissions.length === 0 ? (
              <Card variant="glass">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="font-bold font-display text-lg mb-2">Tidak Ada Misi Foto</h3>
                  <p className="text-muted-foreground">Belum ada misi yang memerlukan foto saat ini</p>
                </CardContent>
              </Card>
            ) : !selectedMission ? (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Pilih Misi untuk Upload Foto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {photoMissions.map((mission, index) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedMission(mission)}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{mission.icon}</div>
                        <div>
                          <h4 className="font-semibold">{mission.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{mission.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="points">+{mission.points} pts</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{mission.category}</div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card variant="glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{selectedMission.icon}</span>
                      {selectedMission.title}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMission(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm">{selectedMission.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">{selectedMission.category}</Badge>
                      <Badge variant="points">+{selectedMission.points} poin</Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photo-upload" className="text-sm font-medium">Upload Foto Bukti</Label>
                    <div className="mt-2">
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📷 Ambil foto yang jelas menunjukkan aktivitas eco-friendly Anda
                    </p>
                  </div>

                  {uploading && (
                    <div className="text-center py-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Mengupload foto...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Riwayat Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-muted-foreground">Belum ada foto yang diupload</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <button
                          onClick={() => setPreviewImage(submission.photo_url)}
                          className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors flex-shrink-0"
                        >
                          <img 
                            src={submission.photo_url} 
                            alt="Submission" 
                            className="w-full h-full object-cover"
                          />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{submission.mission_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.completed_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {submission.ai_result && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              AI: {submission.ai_result}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          {getStatusBadge(submission.status)}
                          <div className="text-sm font-semibold mt-1">
                            +{submission.points_earned} pts
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Foto</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
