import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi, apiToken, type ApiUser } from '@/lib/api';

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  signOut: () => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  refetch: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!apiToken.get()) { setUser(null); setLoading(false); return; }
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      apiToken.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, []);

  const signOut = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
