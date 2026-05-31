'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { auth as authApi } from '@/lib/api';

type User = { id: string; email: string; name: string | null; role: string } | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ id: string; email: string; name: string | null; role: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ id: string; email: string; name: string | null; role: string }>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => ({} as { id: string; email: string; name: string | null; role: string }),
  register: async () => ({} as { id: string; email: string; name: string | null; role: string }),
  logout: async () => {},
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await authApi.login(email, password);
      setUser(u);
      setLoading(false);
      return u;
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const u = await authApi.register(email, password, name);
      setUser(u);
      setLoading(false);
      return u;
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
