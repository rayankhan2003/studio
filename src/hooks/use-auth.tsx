
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define the permissions structure
export interface SubAdminPermissions {
  canManageQuestions: boolean;
  canViewUsers: boolean;
  canManageEvents: boolean;
  canManageBlogs: boolean;
  canViewRevenue: boolean;
  canEditPaymentSettings: boolean;
  canViewAnalytics: boolean;
  canManageSubAdmins: boolean;
  canDeleteContent: boolean;
}

export interface User {
  name: string;
  email?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean; // True only for the main admin
  permissions?: SubAdminPermissions; // For sub-admins
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Special credential for the super admin
const SUPER_ADMIN_EMAIL = 'admin142@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smartercat-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('smartercat-user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((name: string, email?: string) => {
    const isSuper = email === SUPER_ADMIN_EMAIL;
    const newUser: User = { 
      name,
      email,
      isAdmin: true, // All admins are admins, but only one is super
      isSuperAdmin: isSuper,
    };
    // In a real app, if it's a sub-admin, you would fetch their permissions here
    // and attach them to the newUser object. For now, only super-admin is fully handled.
    if (!isSuper) {
        const subAdminsRaw = localStorage.getItem('smartercat-sub-admins');
        const subAdmins = subAdminsRaw ? JSON.parse(subAdminsRaw) : [];
        const subAdminData = subAdmins.find((sa: any) => sa.email === email);
        if (subAdminData) {
            newUser.permissions = subAdminData.permissions;
        }
    }

    localStorage.setItem('smartercat-user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smartercat-user');
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
