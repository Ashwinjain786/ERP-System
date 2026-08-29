import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

import type { User, LoginUserInput } from '@/api/apiInterface';
import { loginUser as apiLoginUser, getCurrentUser as apiGetCurrentUser, logoutUser as apiLogoutUser, setApiConfig } from '@/api/apiCall';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginUserInput) => Promise<User | undefined | void>;
  logout: () => void;
  role: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'campusone_jwt_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await apiGetCurrentUser();
      setUser(data as unknown as User);
    } catch (error) {
      console.error('Failed to fetch current user', error);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      setApiConfig({ headers: { Authorization: '' } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setApiConfig({ headers: { Authorization: `Bearer ${token}` } });
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (input: LoginUserInput) => {
    setIsLoading(true);
    try {
      const res = await apiLoginUser(input);
      if (res && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setApiConfig({ headers: { Authorization: `Bearer ${res.token}` } });
        setUser(res.user as unknown as User);
        return res.user as unknown as User;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogoutUser();
    } catch (e) {
      console.error('Logout failed', e);
    }
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    setApiConfig({ headers: { Authorization: '' } });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        role: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
