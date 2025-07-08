
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/account'); // Redirect non-admins to the login page
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying access...</p>
      </div>
    );
  }

  // A super admin is identified by having permissions property set to null or undefined.
  // A sub-admin will have a permissions object.
  const isSuperAdmin = user.isSuperAdmin;

  // A simple example of route protection based on permissions
  // This would be expanded as more modules are built.
  // For now, we only protect the admin manager page.
  const pathname = useRouter();
  if (pathname.pathname === '/admin/manager' && !isSuperAdmin) {
     router.push('/admin/dashboard');
     return (
       <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Access Denied. Redirecting...</p>
      </div>
     )
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
