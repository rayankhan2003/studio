
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
  isSuperAdmin: boolean; // True only for the main admin
  isInstitutionalAdmin: boolean; // True for institutional admins
  institutionId?: string; // Add institution ID for context
  institutionName?: string; // Add institution name for display
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

  const login = useCallback((name: string, email?: string) => {
    let newUser: User;
    
    const subAdminsRaw = typeof window !== 'undefined' ? localStorage.getItem('path2med-sub-admins') : null;
    const subAdmins = subAdminsRaw ? JSON.parse(subAdminsRaw) : [];
    const subAdminData = subAdmins.find((sa: any) => sa.email === email);

    const institutionalAdminsRaw = typeof window !== 'undefined' ? localStorage.getItem('path2med-institutional-subscriptions') : null;
    const institutionalAdmins = institutionalAdminsRaw ? JSON.parse(institutionalAdminsRaw) : [];
    const institutionalAdminData = institutionalAdmins.find((ia: any) => ia.adminEmail === email);

    if (email === SUPER_ADMIN_EMAIL) {
      // Handle Super Admin Login
      newUser = {
        name,
        email,
        isAdmin: true,
        isSuperAdmin: true,
        isInstitutionalAdmin: false,
      };
    } else if (subAdminData) {
      // Handle Sub-Admin Login
      newUser = {
        name,
        email,
        isAdmin: true,
        isSuperAdmin: false,
        isInstitutionalAdmin: false,
        permissions: subAdminData.permissions,
      };
    } else if (institutionalAdminData) {
        // Handle Institutional Admin Login
        newUser = {
            name: institutionalAdminData.adminName,
            email: institutionalAdminData.adminEmail,
            isAdmin: false,
            isSuperAdmin: false,
            isInstitutionalAdmin: true,
            institutionId: institutionalAdminData.id,
            institutionName: institutionalAdminData.institutionName,
        };
    }
    else {
      // Handle Regular User Login
      newUser = {
        name,
        email,
        isAdmin: false,
        isSuperAdmin: false,
        isInstitutionalAdmin: false,
      };
    }

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
