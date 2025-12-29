'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCircle, Shield, Calendar, RefreshCw, XCircle, ArrowRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.email) {
      const subscribersRaw = localStorage.getItem('dojobeacon-subscribers');
      if (subscribersRaw) {
        const subscribers = JSON.parse(subscribersRaw);
        const info = subscribers.find((s: any) => s.email === user.email);
        setSubscriberInfo(info);
      }
    }
  }, [user]);

  const handleCancelSubscription = () => {
    // This is a mock action. In a real app, this would trigger a backend API call.
    console.log("Cancelling subscription for:", user?.email);
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user.isInstitutionalAdmin || user.isTeacher || user.isInstitutionalStudent) {
      router.push('/dashboard'); // Or their respective dashboards
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Redirecting to your dashboard...</p>
        </div>
      );
  }

  const getNextBillingDate = () => {
    if (!subscriberInfo || !subscriberInfo.subscriptionDate) return 'N/A';
    const startDate = new Date(subscriberInfo.subscriptionDate);
    if (subscriberInfo.plan === 'Monthly') {
      startDate.setMonth(startDate.getMonth() + 1);
    } else if (subscriberInfo.plan === '6-Month') {
      startDate.setMonth(startDate.getMonth() + 6);
    } else if (subscriberInfo.plan === 'Yearly') {
      startDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      return 'N/A (Lifetime or Demo)';
    }
    return startDate.toLocaleDateString();
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
               <UserCircle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">My Account</CardTitle>
            <CardDescription>Manage your subscription and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg">
                 <h3 className="font-semibold text-lg mb-2">User Details</h3>
                 <p><strong>Name:</strong> {user.name}</p>
                 <p><strong>Email:</strong> {user.email}</p>
            </div>
            {subscriberInfo ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield /> Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div>
                            <p className="font-semibold">Current Plan</p>
                            <Badge variant="default">{subscriberInfo.plan}</Badge>
                         </div>
                         <div>
                            <p className="font-semibold">Status</p>
                            <Badge variant={user.plan === 'Demo Expired' ? 'destructive' : 'default'}>
                                {user.plan === 'Demo Expired' ? 'Demo Expired' : 'Active'}
                            </Badge>
                         </div>
                        {(subscriberInfo.plan !== 'Demo') && (
                            <div>
                                <p className="font-semibold flex items-center gap-1"><Calendar className="h-4 w-4"/> Next Billing / Renewal Date</p>
                                <p>{getNextBillingDate()}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={() => router.push('/pricing')}><RefreshCw className="mr-2 h-4 w-4"/> Upgrade Plan</Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><XCircle className="mr-2 h-4 w-4"/> Cancel Subscription</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will cancel your subscription at the end of the current billing period. You will lose access to all premium features.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90">
                                    Confirm Cancellation
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            ) : (
                 <Card className="text-center p-6">
                     <CardTitle>No Subscription Found</CardTitle>
                     <CardDescription className="mt-2">You do not have an active subscription. Please visit our pricing page to get started.</CardDescription>
                     <CardFooter className="mt-4">
                        <Button onClick={() => router.push('/pricing')} className="w-full">
                            View Pricing Plans <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                     </CardFooter>
                 </Card>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
