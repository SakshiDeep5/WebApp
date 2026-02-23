'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProfile, type User } from '@/lib/api';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((u: User | null, t: string | null) => {
    setUser(u);
    setToken(t);
    if (typeof window !== 'undefined') {
      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) return;
    const { data } = await getProfile(t);
    if (data?.user) {
      setUser(data.user);
      if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u) as User);
      } catch {
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, setAuth, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
