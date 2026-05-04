import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiToken } from '@/lib/api';
import { toast } from 'sonner';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Login Google gagal, coba lagi');
      navigate('/auth', { replace: true });
      return;
    }

    if (token) {
      apiToken.set(token);
      toast.success('Selamat datang! 🌿');
      navigate('/', { replace: true });
      return;
    }

    navigate('/auth', { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Memproses login...</p>
    </div>
  );
}
