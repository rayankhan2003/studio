
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Chrome, Facebook, Mail, LogIn, UserPlus } from "lucide-react";

export default function AccountAuthPage() {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // State for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleSocialAuth = (provider: 'Google' | 'Facebook') => {
    toast({
      title: `Mock ${provider} Authentication`,
      description: `Initiating ${authMode} with ${provider}... (This is a mock action)`,
    });
    // In a real app, you'd redirect to the provider or open a popup.
    // After successful auth, you might set a loggedIn state or redirect.
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Login Error", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    toast({
      title: "Mock Email Login",
      description: `Attempting to log in with email: ${loginEmail}. (This is a mock action)`,
    });
    // Mock success:
    // setLoggedIn(true); // If managing a logged-in state on this page
    // router.push('/dashboard'); // Or redirect
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
    toast({
      title: "Mock Email Signup",
      description: `Attempting to sign up user: ${signupName} with email: ${signupEmail}. (This is a mock action)`,
    });
    // Mock success:
    // setLoggedIn(true);
    // router.push('/dashboard');
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
            {authMode === 'login' ? 'Log in to access your SmarterCat dashboard.' : 'Sign up to start your SmarterCat journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Auth Buttons */}
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

          {/* Email/Password Form */}
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
