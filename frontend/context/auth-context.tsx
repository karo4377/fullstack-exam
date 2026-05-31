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
import type { UpdateProfilePayload, UserProfile } from '@/lib/user-profile';

type User = UserProfile | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (
    email: string,
    password: string,
    data?: { firstName?: string; lastName?: string; name?: string },
  ) => Promise<UserProfile>;
  updateProfile: (data: UpdateProfilePayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => ({} as UserProfile),
  register: async () => ({} as UserProfile),
  updateProfile: async () => ({} as UserProfile),
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

  const login = useCallback(async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      data?: { firstName?: string; lastName?: string; name?: string },
    ) => {
      const u = await authApi.register(email, password, data);
      setUser(u);
      setLoading(false);
      return u;
    },
    [],
  );

  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    const u = await authApi.updateProfile(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
