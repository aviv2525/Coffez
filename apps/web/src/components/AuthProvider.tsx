'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@orderbridge/shared';
import { apiFetch, setAuthToken, clearAuthToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await apiFetch<{ user: User; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (error || !data?.accessToken) {
        setLoading(false);
        return { success: false, error: error || 'Login failed' };
      }

      queryClient.clear();
      setAuthToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore logout errors
    }
    clearAuthToken();
    queryClient.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiFetch<User>('/users/me');
      if (error || !data) {
        setUser(null);
        return;
      }
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  };

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      // Try to refresh token first
      const { data: refreshData, error: refreshError } = await apiFetch<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
      });

      if (refreshError || !refreshData?.accessToken) {
        setUser(null);
        return;
      }

      setAuthToken(refreshData.accessToken);

      // Now fetch current user
      const { data: userData, error: userError } = await apiFetch<User>('/users/me');
      if (userError || !userData) {
        setUser(null);
        return;
      }

      setUser(userData);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}