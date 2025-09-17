'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything until auth state is loaded
    }

    // If not loading and there is no user, or the user is not an institutional admin, redirect
    if (!user || !user.isInstitutionalAdmin) {
      router.push('/account');
    }
  }, [user, isLoading, router]);

  // Show a loading spinner while we verify auth
  if (isLoading || !user || !user.isInstitutionalAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying institutional access...</p>
      </div>
    );
  }

  // Render the layout for authenticated institutional admins
  return (
    <>
      <main className="flex-1 p-6 md:p-8 bg-muted/30">
        {children}
      </main>
    </>
  );
}
