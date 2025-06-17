
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Smartphone, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentMethods = [
  { name: "Visa", icon: CreditCard },
  { name: "Mastercard", icon: CreditCard },
  { name: "Debit Card", icon: CreditCard },
  { name: "Easypaisa", icon: Smartphone },
  { name: "JazzCash", icon: Smartphone },
];

interface PremiumFormData {
  fullName: string;
  dob: string;
  educationBoard: string;
  mobileNumber: string;
  email: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const initialPremiumFormData: PremiumFormData = {
  fullName: '',
  dob: '',
  educationBoard: '',
  mobileNumber: '',
  email: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
};

interface DemoInfoData {
  fullName: string;
  dob: string;
  educationBoard: string;
  mobileNumber: string;
  email: string;
}

const initialDemoInfoData: DemoInfoData = {
  fullName: '',
  dob: '',
  educationBoard: '',
  mobileNumber: '',
  email: '',
};

export default function PricingPage() {
  const { toast } = useToast();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState<boolean>(false);
  const [premiumFormData, setPremiumFormData] = useState<PremiumFormData>(initialPremiumFormData);

  const [isDemoInfoDialogOpen, setIsDemoInfoDialogOpen] = useState<boolean>(false);
  const [demoInfoData, setDemoInfoData] = useState<DemoInfoData>(initialDemoInfoData);

  const handlePremiumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPremiumFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoInfoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDemoInfoData(prev => ({ ...prev, [name]: value }));
  };

  const handleActivateDemoSubmit = () => {
    if (!demoInfoData.fullName || !demoInfoData.email) {
        toast({
            title: "Missing Information",
            description: "Please fill in at least Full Name and Email for the demo.",
            variant: "destructive",
        });
        return;
    }
    toast({
      title: "Demo Information Captured!",
      description: "You can now access up to 25 sample questions. (This is a mock feature)",
    });
    setIsDemoInfoDialogOpen(false);
    setDemoInfoData(initialDemoInfoData);
  };
  
  const handlePremiumSubscribeSubmit = () => {
    if (!premiumFormData.fullName || !premiumFormData.email || !premiumFormData.cardNumber) {
         toast({
            title: "Missing Information",
            description: "Please fill in Full Name, Email, and Card Number to subscribe.",
            variant: "destructive",
        });
        return;
    }
    toast({
      title: "Information Captured (Mock)",
      description: "Redirecting to payment gateway... You may receive an SMS from your bank for confirmation. (This is a mock action)",
      duration: 7000,
    });
    setIsPremiumDialogOpen(false);
    setPremiumFormData(initialPremiumFormData);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Start with our Demo plan to get a feel for SmarterCat, or unlock the full potential of your exam preparation with SmarterCat Premium.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Demo Plan Card */}
        <Card className="shadow-lg flex flex-col">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Demo Plan</CardTitle>
            <CardDescription className="text-xl font-semibold text-accent">
              Free
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Get a taste of SmarterCat. Provide some basic info to start.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Access to 25 sample questions",
                "Limited Analytics Preview",
                "Basic Test Features",
                "Try before you subscribe",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button onClick={() => setIsDemoInfoDialogOpen(true)} className="w-full text-lg py-6" variant="outline">
              Start Demo
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan Card */}
        <Card className="shadow-xl border-primary border-2 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold transform translate-x-8 translate-y-8 rotate-45">
            POPULAR
          </div>
          <CardHeader className="text-center pt-10">
            <CardTitle className="text-3xl mb-2">SmarterCat Premium</CardTitle>
            <CardDescription className="text-xl font-semibold text-primary">
              1000 PKR / month
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Billed monthly. Cancel anytime.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Unlimited Custom Tests",
                "Full Access to AI Insights",
                "Detailed Performance Analytics",
                "Complete Test History & Review",
                "Past MDCAT Papers Practice",
                "Goal Setting Features",
                "Priority Support",
                "Ad-Free Experience",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-auto">
            <Button onClick={() => setIsPremiumDialogOpen(true)} className="w-full text-lg py-6">
              Subscribe Now
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By subscribing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">Terms of Use</Link> and acknowledge
              our automatic renewal policy.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Demo Information Dialog */}
      <Dialog open={isDemoInfoDialogOpen} onOpenChange={(open) => {
        setIsDemoInfoDialogOpen(open);
        if (!open) setDemoInfoData(initialDemoInfoData);
      }}>
        <DialogContent className="sm:max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-accent" /> Start SmarterCat Demo
            </DialogTitle>
            <DialogDescription>
              Please provide some basic information to activate your demo access. This information helps us tailor your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="demoFullName">Full Name</Label>
              <Input id="demoFullName" name="fullName" value={demoInfoData.fullName} onChange={handleDemoInfoInputChange} placeholder="e.g., Aisha Khan" />
            </div>
            <div>
              <Label htmlFor="demoDob">Date of Birth</Label>
              <Input id="demoDob" name="dob" type="date" value={demoInfoData.dob} onChange={handleDemoInfoInputChange} />
            </div>
            <div>
              <Label htmlFor="demoEducationBoard">Education Board</Label>
              <Input id="demoEducationBoard" name="educationBoard" value={demoInfoData.educationBoard} onChange={handleDemoInfoInputChange} placeholder="e.g., BISE Lahore, Federal Board" />
            </div>
            <div>
              <Label htmlFor="demoMobileNumber">Mobile Number</Label>
              <Input id="demoMobileNumber" name="mobileNumber" type="tel" value={demoInfoData.mobileNumber} onChange={handleDemoInfoInputChange} placeholder="e.g., 03xxxxxxxxx" />
            </div>
            <div>
              <Label htmlFor="demoEmail">Email Address</Label>
              <Input id="demoEmail" name="email" type="email" value={demoInfoData.email} onChange={handleDemoInfoInputChange} placeholder="e.g., aisha.khan@example.com" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsDemoInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleActivateDemoSubmit}>
              Activate Demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Subscription Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={(open) => {
        setIsPremiumDialogOpen(open);
        if (!open) setPremiumFormData(initialPremiumFormData);
      }}>
        <DialogContent className="sm:max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" /> Subscribe to SmarterCat Premium
            </DialogTitle>
            <DialogDescription>
              Enter your details to unlock all premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="text-sm font-semibold text-muted-foreground col-span-full">Personal Information</h3>
            <div>
              <Label htmlFor="premiumFullName">Full Name</Label>
              <Input id="premiumFullName" name="fullName" value={premiumFormData.fullName} onChange={handlePremiumInputChange} placeholder="As on your CNIC/Passport" />
            </div>
            <div>
              <Label htmlFor="premiumDob">Date of Birth</Label>
              <Input id="premiumDob" name="dob" type="date" value={premiumFormData.dob} onChange={handlePremiumInputChange} />
            </div>
            <div>
              <Label htmlFor="premiumEducationBoard">Education Board</Label>
              <Input id="premiumEducationBoard" name="educationBoard" value={premiumFormData.educationBoard} onChange={handlePremiumInputChange} placeholder="e.g., BISE Lahore, Federal Board" />
            </div>
            <div>
              <Label htmlFor="premiumMobileNumber">Mobile Number (for OTP)</Label>
              <Input id="premiumMobileNumber" name="mobileNumber" type="tel" value={premiumFormData.mobileNumber} onChange={handlePremiumInputChange} placeholder="e.g., 03xxxxxxxxx" />
            </div>
             <div>
              <Label htmlFor="premiumEmail">Email Address</Label>
              <Input id="premiumEmail" name="email" type="email" value={premiumFormData.email} onChange={handlePremiumInputChange} placeholder="e.g., your.email@example.com" />
            </div>

            <h3 className="text-sm font-semibold text-muted-foreground col-span-full pt-2">Payment Details (Mock)</h3>
             <div className="flex space-x-2 mb-2 overflow-x-auto py-1">
                {paymentMethods.map(method => (
                  <Button key={method.name} variant="outline" size="sm" className="flex-shrink-0 text-xs h-8 px-2">
                    <method.icon className="h-3 w-3 mr-1.5" /> {method.name}
                  </Button>
                ))}
              </div>
            <div>
              <Label htmlFor="premiumCardNumber">Card Number</Label>
              <Input id="premiumCardNumber" name="cardNumber" value={premiumFormData.cardNumber} onChange={handlePremiumInputChange} placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="premiumCardExpiry">Expiry Date</Label>
                <Input id="premiumCardExpiry" name="cardExpiry" value={premiumFormData.cardExpiry} onChange={handlePremiumInputChange} placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="premiumCardCvc">CVC/CVV</Label>
                <Input id="premiumCardCvc" name="cardCvc" value={premiumFormData.cardCvc} onChange={handlePremiumInputChange} placeholder="•••" />
              </div>
            </div>
             <p className="text-xs text-muted-foreground pt-1">
                This is a mock payment form. No real transaction will occur.
              </p>
          </div>
          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPremiumDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePremiumSubscribeSubmit}>
              Pay 1000 PKR & Subscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
