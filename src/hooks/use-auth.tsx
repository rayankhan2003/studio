
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
  isInstitutionalStudent?: boolean;
  institutionId?: string;
  institutionName?: string;
  permissions?: SubAdminPermissions;
  plan?: 'Demo' | 'Monthly' | '6-Month' | 'Yearly';
  isDemo?: boolean; // Added for demo plan
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
      const storedUserRaw = localStorage.getItem('dojobeacon-user');
      if (storedUserRaw) {
        let storedUser = JSON.parse(storedUserRaw);
        
        // Check for demo plan status
        const subscribersRaw = localStorage.getItem('dojobeacon-subscribers');
        if (subscribersRaw && storedUser.email) {
            const subscribers = JSON.parse(subscribersRaw);
            const currentUserSubscriberInfo = subscribers.find((s: any) => s.email === storedUser.email);
            
            if (currentUserSubscriberInfo && currentUserSubscriberInfo.plan === 'Demo') {
                const subscriptionDate = new Date(currentUserSubscriberInfo.subscriptionDate);
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                if (subscriptionDate > threeDaysAgo) {
                    storedUser = { ...storedUser, isDemo: true, plan: 'Demo' };
                } else {
                    // Demo expired, but what should happen? For now, we'll just not set the isDemo flag.
                    // A more robust implementation might log them out or restrict access further.
                     storedUser = { ...storedUser, isDemo: false, plan: 'Demo Expired' };
                }
            }
        }
        
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('dojobeacon-user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUser: User) => {
    localStorage.setItem('dojobeacon-user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dojobeacon-user');
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
