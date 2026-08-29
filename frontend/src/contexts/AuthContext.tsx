import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import type { User } from '@/api/apiInterface';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  role: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'campusone_auth';

const MOCK_USERS: Record<string, User> = {
  student: {
    id: 'stu-001',
    name: 'Aryan Sharma',
    email: 'aryan.sharma@campusone.edu',
    role: 'student',
    department: 'Computer Science',
    avatarUrl: undefined,
  },
  faculty: {
    id: 'fac-001',
    name: 'Dr. Priya Menon',
    email: 'priya.menon@campusone.edu',
    role: 'faculty',
    department: 'Computer Science',
    avatarUrl: undefined,
  },
  admin: {
    id: 'admin-001',
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh.kumar@campusone.edu',
    role: 'admin',
    department: 'Administration',
    avatarUrl: undefined,
  },
  finance: {
    id: 'fin-001',
    name: 'CA Suresh Reddy',
    email: 'suresh.reddy@campusone.edu',
    role: 'finance_officer',
    department: 'Finance',
    avatarUrl: undefined,
  },
  library: {
    id: 'lib-001',
    name: 'Ms. Kavita Iyer',
    email: 'kavita.iyer@campusone.edu',
    role: 'librarian',
    department: 'Library',
    avatarUrl: undefined,
  },
  management: {
    id: 'mgmt-001',
    name: 'Dr. Aparna Singh',
    email: 'aparna.singh@campusone.edu',
    role: 'management',
    department: 'Executive',
    avatarUrl: undefined,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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

export { MOCK_USERS };
