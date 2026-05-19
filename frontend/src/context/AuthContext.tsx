import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

interface AuthUser {
  sub: string;
  rol: 'SERVIDOR_PUBLICO' | 'JEFE_TALENTO_HUMANO';
  correo: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (tipoDocumento: string, numeroDocumento: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) { setIsLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.data as AuthUser);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchMe(); }, [fetchMe]);

  const login = async (tipoDocumento: string, numeroDocumento: string, password: string) => {
    const res = await authApi.login({ tipoDocumento, numeroDocumento, password });
    const { accessToken, refreshToken } = res.data as { accessToken: string; refreshToken: string; rol: string };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const me = await authApi.me();
    setUser(me.data as AuthUser);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    try { await authApi.logout({ refreshToken }); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};