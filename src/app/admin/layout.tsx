
'use client';

import { useAuth, type SubAdminPermissions } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Loader2 } from 'lucide-react';

const routePermissions: Partial<Record<string, keyof SubAdminPermissions>> = {
  '/admin/questions': 'canManageQuestions',
  '/admin/analytics': 'canViewAnalytics',
  '/admin/settings': 'canEditPaymentSettings',
  '/admin/content': 'canManageBlogs', // This can cover both blogs and events for now
  // '/admin/manager' is handled by the isSuperAdmin check
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything until auth state is loaded
    }

    if (!user || !user.isAdmin) {
      router.push('/account');
      return;
    }
    
    // Super admin can access everything
    if (user.isSuperAdmin) {
      return;
    }

    // Sub-admin specific route protection
    if (pathname === '/admin/manager') {
      router.push('/admin/dashboard');
      return;
    }
    
    const requiredPermission = Object.entries(routePermissions).find(([route]) => pathname.startsWith(route))?.[1];
    
    if (requiredPermission && user.permissions && !user.permissions[requiredPermission]) {
      router.push('/admin/dashboard');
    }

  }, [user, isLoading, router, pathname]);

  // Show a loading spinner while we verify auth
  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying access...</p>
      </div>
    );
  }
  
  // This handles the redirect flash for sub-admins trying to access pages they shouldn't
  const isAccessDenied = !user.isSuperAdmin && (
    pathname === '/admin/manager' ||
    (Object.entries(routePermissions).find(([route]) => pathname.startsWith(route))?.[1] &&
     !user.permissions?.[Object.entries(routePermissions).find(([route]) => pathname.startsWith(route))?.[1] as keyof SubAdminPermissions])
  );
  
  if (isAccessDenied) {
     return (
       <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Access Denied. Redirecting...</p>
      </div>
     );
  }


  return (
    <div className="container mx-auto px-4 py-8 flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 bg-muted/30 ml-4 rounded-lg">
        {children}
      </main>
    </div>
  );
}
