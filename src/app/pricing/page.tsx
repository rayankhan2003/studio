
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Smartphone, Banknote, ShieldCheck, UserPlus, Calendar, School, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

interface SubscriptionFormData {
  fullName: string;
  dob: string;
  educationBoard: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const initialFormData: SubscriptionFormData = {
  fullName: '',
  dob: '',
  educationBoard: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
};

export default function PricingPage() {
  const { toast } = useToast();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDemo = () => {
    toast({
      title: "Demo Plan Activated!",
      description: "You can now access up to 25 sample questions. (This is a mock feature)",
    });
    // Potentially redirect to /test/custom or a specific demo test
  };
  
  const handlePremiumSubscribeSubmit = () => {
    // In a real app, this would validate data and then initiate payment.
    console.log("Mock Premium Subscription Data:", formData);
    toast({
      title: "Information Captured (Mock)",
      description: "Redirecting to payment gateway... You may receive an SMS from your bank for confirmation. (This is a mock action)",
      duration: 7000,
    });
    setIsPremiumDialogOpen(false);
    setFormData(initialFormData); // Reset form
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
              Get a taste of SmarterCat.
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
            <Button onClick={handleStartDemo} className="w-full text-lg py-6" variant="outline">
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

      {/* Premium Subscription Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={(open) => {
        setIsPremiumDialogOpen(open);
        if (!open) setFormData(initialFormData); // Reset form if dialog is closed
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary"/> Subscribe to SmarterCat Premium
            </DialogTitle>
            <DialogDescription>
              Please provide some basic information to proceed with your premium subscription. Payment details are for mock purposes only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g., Aisha Khan" />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="educationBoard">Education Board</Label>
              <Input id="educationBoard" name="educationBoard" value={formData.educationBoard} onChange={handleInputChange} placeholder="e.g., BISE Lahore, Federal Board" />
            </div>
            
            <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold mb-2 text-muted-foreground">Payment Details (Mock)</p>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date (MM/YY)</Label>
                    <Input id="cardExpiry" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input id="cardCvc" name="cardCvc" value={formData.cardCvc} onChange={handleInputChange} placeholder="•••" />
                  </div>
                </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsPremiumDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePremiumSubscribeSubmit}>
              Proceed to Payment (Mock)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Banknote className="h-6 w-6 text-primary" /> Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">We accept a variety of payment methods for your convenience (mock integration):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex flex-col items-center p-3 border rounded-md bg-muted/30">
                  <method.icon className="h-8 w-8 text-primary mb-1" />
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Secure & Flexible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Your payment information is processed securely (mock).
            </p>
            <p>
              Subscriptions automatically renew each month. You can cancel your subscription at any time from your account settings.
            </p>
            <p>
              If a payment fails, we'll notify you and attempt to process it again. You can update your payment method if needed.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="text-center mt-16 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
          Have more questions about our subscription? Visit our FAQ page or contact support.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/faq">
            <Button variant="outline">View FAQs</Button>
          </Link>
          <Link href="/contact">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

