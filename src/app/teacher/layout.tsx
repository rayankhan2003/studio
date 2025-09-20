
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; 
    }
    if (!user || !user.isTeacher) {
      router.push('/account');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.isTeacher) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying teacher access...</p>
      </div>
    );
  }

  return (
    <>
        {children}
    </>
  );
}

    