
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define the permissions structure
export interface SubAdminPermissions {
  canManageQuestions: boolean;
  canViewUsers: boolean;
  canManageEvents: boolean;
  canManageBlogs: boolean;
  canViewAnalytics: boolean;
  canEditPaymentSettings: boolean;
  canManageSubAdmins: boolean;
  canDeleteContent: boolean;
}

export interface User {
  name: string;
  email?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInstitutionalAdmin: boolean;
  isTeacher?: boolean;
  institutionId?: string;
  institutionName?: string;
  permissions?: SubAdminPermissions;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('path2med-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('path2med-user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUser: User) => {
    localStorage.setItem('path2med-user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('path2med-user');
    setUser(null);
  }, []);

  const value = { user, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
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

    