
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Chrome, Facebook, Mail, LogIn, UserPlus } from "lucide-react";
import { logActivity } from '@/lib/activity-log';

export default function AccountAuthPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleSocialAuth = (provider: 'Google' | 'Facebook') => {
    toast({
      title: `Mock ${provider} Authentication`,
      description: `Initiating ${authMode} with ${provider}...`,
    });
    // Mock login with a generic name for social auth
    const mockName = provider === 'Google' ? 'Alex Doe' : 'Sam Smith';
    // Social auth not supported for admin roles
    // login(mockName, undefined, false); // Regular user login
    toast({
      title: 'Login Successful!',
      description: `Welcome back, ${mockName}!`,
    });
    router.push('/dashboard');
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Login Error", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }

    // 1. Check for Super Admin credentials
    if (loginEmail === 'admin142@gmail.com' && loginPassword === '142024') {
      login('Super Admin', loginEmail); // This will set isAdmin and isSuperAdmin correctly
      logActivity("Super Admin logged in.");
      toast({
        title: 'Super Admin Login Successful!',
        description: `Welcome back!`,
      });
      router.push('/admin/dashboard');
      return;
    }

    // 2. Check for Sub-Admin credentials from localStorage
    const subAdminsRaw = localStorage.getItem('path2med-sub-admins');
    const subAdmins = subAdminsRaw ? JSON.parse(subAdminsRaw) : [];
    const subAdmin = subAdmins.find((sa: any) => sa.email === loginEmail && sa.password === loginPassword);

    if (subAdmin) {
       if (subAdmin.status === 'Inactive') {
        toast({ title: "Login Failed", description: "Your account is inactive. Please contact the Super Admin.", variant: "destructive" });
        return;
      }
      login(subAdmin.fullName, subAdmin.email); // This will set isAdmin but not isSuperAdmin
      logActivity("Sub-Admin logged in.");
      toast({
        title: 'Admin Login Successful!',
        description: `Welcome back, ${subAdmin.fullName}!`,
      });
      router.push('/admin/dashboard'); // Sub-admins also go to the admin dashboard
      return;
    }

    // 3. Check for Institutional Admin credentials
    const institutionalAdminsRaw = localStorage.getItem('path2med-institutional-subscriptions');
    const institutionalAdmins = institutionalAdminsRaw ? JSON.parse(institutionalAdminsRaw) : [];
    const institutionalAdmin = institutionalAdmins.find((ia: any) => ia.adminEmail === loginEmail && ia.password === loginPassword);

    if (institutionalAdmin) {
      login(institutionalAdmin.adminName, institutionalAdmin.adminEmail); // Sets user as institutional admin
      // logActivity could be enhanced for institutional admins later
      toast({
        title: 'Institutional Login Successful!',
        description: `Welcome, ${institutionalAdmin.adminName}!`,
      });
      router.push('/institution/dashboard'); // Redirect to institutional dashboard
      return;
    }


    // 4. Default user login (mocked)
    // A real app would check a user database here
    const name = loginEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // Regular users can't log in as 'Admin' or with admin emails
    if (name.toLowerCase().includes('admin')) {
        toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
        return;
    }
    // login(name, loginEmail, false); // Regular user login
    toast({
      title: 'Login Successful!',
      description: `Welcome back, ${name}!`,
    });
    router.push('/dashboard');
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({ title: "Signup Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Signup Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    // login(signupName, signupEmail, false); // Regular user signup
    toast({
      title: 'Signup Successful!',
      description: `Welcome, ${signupName}!`,
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {authMode === 'login' ? <LogIn className="h-10 w-10 text-primary" /> : <UserPlus className="h-10 w-10 text-primary" />}
          </div>
          <CardTitle className="text-3xl">
            {authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </CardTitle>
          <CardDescription>
            {authMode === 'login' ? 'Log in to access your dashboard.' : 'Sign up to start your journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button variant="outline" className="w-full text-base py-6" onClick={() => handleSocialAuth('Google')}>
              <Chrome className="mr-2 h-5 w-5" /> {authMode === 'login' ? 'Log In' : 'Sign Up'} with Google
            </Button>
            <Button variant="outline" className="w-full text-base py-6" onClick={() => handleSocialAuth('Facebook')}>
              <Facebook className="mr-2 h-5 w-5" /> {authMode === 'login' ? 'Log In' : 'Sign Up'} with Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email Address</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full text-base py-6">
                <Mail className="mr-2 h-5 w-5" /> Log In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" type="text" placeholder="Aisha Khan" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input id="signup-confirm-password" type="password" placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full text-base py-6">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center block">
          {authMode === 'login' ? (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode('signup')}>
                Sign up
              </Button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode('login')}>
                Log in
              </Button>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

    