import { useState, useEffect } from 'react';
import { missionsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Eye, RefreshCw, Loader2, Bot } from 'lucide-react';

interface Completion {
  id: string;
  user_id: string;
  mission_id: string;
  photo_url: string | null;
  points_earned: number;
  status: string;
  ai_result: string | null;
  ai_confidence: number | null;
  completed_at: string;
  completion_date: string;
  mission_title?: string;
  user_name?: string;
}

export function PhotoVerification({ onRefresh }: { onRefresh?: () => void }) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompletions = async () => {
    setLoading(true);
    try {
      const data = await missionsApi.adminCompletions();
      const filtered = filter === 'all' ? data : data.filter((d: any) => d.status === filter);
      setCompletions(filtered.map((d: any) => ({
        id: d.id,
        user_id: d.userId,
        mission_id: d.missionId,
        photo_url: d.photoUrl ?? null,
        points_earned: d.pointsEarned,
        status: d.status,
        ai_result: d.aiResult ?? null,
        ai_confidence: d.aiConfidence ?? null,
        completed_at: d.completedAt,
        completion_date: d.completionDate ?? '',
        mission_title: d.mission?.title ?? 'Unknown',
        user_name: d.user?.profile?.displayName ?? d.user?.email ?? 'Unknown',
      })));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCompletions(); }, [filter]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await missionsApi.review(id, status);
      toast.success(status === 'approved' ? '✅ Foto disetujui, poin ditambahkan!' : '❌ Foto ditolak');
      fetchCompletions();
      onRefresh?.();
    } catch (e: any) {
      toast.error('Gagal memperbarui: ' + e.message);
    }
    setActionLoading(null);
  };

  const statusBadge = (status: string, aiConfidence?: number | null) => {
    switch (status) {
      case 'approved': return <Badge className="bg-primary/20 text-primary">✅ Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">❌ Rejected</Badge>;
      default: return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-amber-600 border-amber-400">⏳ Pending</Badge>
          {aiConfidence != null && (
            <Badge variant="outline" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              {aiConfidence}%
            </Badge>
          )}
        </div>
      );
    }
  };

  const pendingCount = completions.filter(c => c.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Verifikasi Foto</h2>
          {pendingCount > 0 && filter !== 'pending' && (
            <Badge variant="destructive">{pendingCount} pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">⏳ Pending</SelectItem>
              <SelectItem value="approved">✅ Approved</SelectItem>
              <SelectItem value="rejected">❌ Rejected</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={fetchCompletions}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peserta</TableHead>
                <TableHead>Misi</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>AI Result</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading...
                  </TableCell>
                </TableRow>
              ) : completions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : completions.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user_name}</TableCell>
                  <TableCell>{c.mission_title}</TableCell>
                  <TableCell>
                    {c.photo_url && (
                      <button
                        onClick={() => setPreviewUrl(c.photo_url)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                      >
                        <img src={c.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="max-w-48">
                    {c.ai_result ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.ai_result}</p>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">+{c.points_earned}</TableCell>
                  <TableCell>{statusBadge(c.status, c.ai_confidence)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.completed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {c.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="default"
                          onClick={() => handleAction(c.id, 'approved')}
                          disabled={actionLoading === c.id}
                          className="gap-1 h-8"
                        >
                          {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm" variant="destructive"
                          onClick={() => handleAction(c.id, 'rejected')}
                          disabled={actionLoading === c.id}
                          className="gap-1 h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Preview Foto</DialogTitle></DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
