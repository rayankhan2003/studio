
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; 
    }
    // Redirect if not loading and user is not an institutional student
    if (!user || !user.isInstitutionalStudent) {
      router.push('/account');
    }
  }, [user, isLoading, router]);

  // Show a loading spinner while verifying auth
  if (isLoading || !user || !user.isInstitutionalStudent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying student access...</p>
      </div>
    );
  }

  // Render the layout for authenticated institutional students
  return <>{children}</>;
}
