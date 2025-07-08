
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything until auth state is loaded
    }

    // If user is not an admin, redirect to login
    if (!user || !user.isAdmin) {
      router.push('/account');
      return;
    }

    // If user is a sub-admin trying to access the manager page, redirect to dashboard
    if (!user.isSuperAdmin && pathname === '/admin/manager') {
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

  // Show a redirecting message if a sub-admin is on the wrong page
  if (!user.isSuperAdmin && pathname === '/admin/manager') {
     return (
       <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Access Denied. Redirecting...</p>
      </div>
     );
  }

  return (
    <>
    <Header />
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 bg-muted/30">
        {children}
      </main>
    </div>
    </>
  );
}
