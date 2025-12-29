'use client';

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Smartphone, UserPlus, Zap, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { educationalBoards, provinces, citiesByProvince } from '@/lib/pakistan-data';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/hooks/use-auth';

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
  gender: string;
  province: string;
  city: string;
  educationBoard: string;
  mobileNumber: string;
  email: string;
}

const initialPremiumFormData: PremiumFormData = {
  fullName: '',
  dob: '',
  gender: '',
  province: '',
  city: '',
  educationBoard: '',
  mobileNumber: '',
  email: '',
};

interface DemoInfoData {
  fullName: string;
  dob: string;
  gender: string;
  province: string;
  city: string;
  educationBoard: string;
  mobileNumber: string;
  email: string;
}

const initialDemoInfoData: DemoInfoData = {
  fullName: '',
  dob: '',
  gender: '',
  province: '',
  city: '',
  educationBoard: '',
  mobileNumber: '',
  email: '',
};

interface InstitutionalFormData {
    id: string;
    institutionName: string;
    institutionType: 'Public' | 'Private' | '';
    businessType: 'College' | 'School' | 'Academy' | '';
    province: string;
    city: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    password: '';
    confirmPassword: '';
}

const initialInstitutionalFormData: Omit<InstitutionalFormData, 'id'> = {
    institutionName: '',
    institutionType: '',
    businessType: '',
    province: '',
    city: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
};


interface PlanDetails {
    name: string;
    price: string;
    billing_desc: string;
    api_plan_id: 'monthly' | 'yearly' | 'lifetime' | 'institutional';
}

const boardOptions = educationalBoards.map(board => ({ value: board, label: board }));

export default function PricingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState<boolean>(false);
  const [premiumFormData, setPremiumFormData] = useState<PremiumFormData>(initialPremiumFormData);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);

  const [isDemoInfoDialogOpen, setIsDemoInfoDialogOpen] = useState<boolean>(false);
  const [demoInfoData, setDemoInfoData] = useState<DemoInfoData>(initialDemoInfoData);
  
  const [isInstitutionalDialogOpen, setIsInstitutionalDialogOpen] = useState<boolean>(false);
  const [institutionalFormData, setInstitutionalFormData] = useState<Omit<InstitutionalFormData, 'id'>>(initialInstitutionalFormData);
  
  const [selectedDemoProvince, setSelectedDemoProvince] = useState('');
  const availableDemoCities = useMemo(() => {
    return selectedDemoProvince ? citiesByProvince[selectedDemoProvince] || [] : [];
  }, [selectedDemoProvince]);
  
  const [selectedPremiumProvince, setSelectedPremiumProvince] = useState('');
  const availablePremiumCities = useMemo(() => {
    return selectedPremiumProvince ? citiesByProvince[selectedPremiumProvince] || [] : [];
  }, [selectedPremiumProvince]);
  
  const [selectedInstitutionalProvince, setSelectedInstitutionalProvince] = useState('');
  const availableInstitutionalCities = useMemo(() => {
      return selectedInstitutionalProvince ? citiesByProvince[selectedInstitutionalProvince] || [] : [];
  }, [selectedInstitutionalProvince]);


  const handlePremiumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPremiumFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePremiumSelectChange = (name: keyof PremiumFormData, value: string) => {
    setPremiumFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'province') {
        setSelectedPremiumProvince(value);
        setPremiumFormData(prev => ({ ...prev, city: '' })); // Reset city on province change
    }
  };
  
   const handleInstitutionalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInstitutionalFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInstitutionalSelectChange = (name: keyof Omit<InstitutionalFormData, 'id'>, value: string) => {
    setInstitutionalFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'province') {
        setSelectedInstitutionalProvince(value);
        setInstitutionalFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const handleDemoInfoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDemoInfoData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDemoInfoSelectChange = (name: keyof DemoInfoData, value: string) => {
    setDemoInfoData(prev => ({ ...prev, [name]: value }));
    if (name === 'province') {
        setSelectedDemoProvince(value);
        setDemoInfoData(prev => ({ ...prev, city: '' })); // Reset city on province change
    }
  };
  
  const handleOpenSubscriptionDialog = (plan: PlanDetails) => {
    setSelectedPlan(plan);
    setIsPremiumDialogOpen(true);
  };

  // Mock data saving for analytics
  const saveSubscriberInfo = (data: DemoInfoData | PremiumFormData, planType: 'Demo' | 'Monthly' | '6-Month' | 'Yearly') => {
    const existingSubscribersRaw = localStorage.getItem('dojobeacon-subscribers');
    const existingSubscribers = existingSubscribersRaw ? JSON.parse(existingSubscribersRaw) : [];

    const newSubscriber = {
        id: `user-${Date.now()}`,
        ...data,
        plan: planType,
        subscriptionDate: new Date().toISOString(),
        paymentMethod: planType !== 'Demo' ? 'Credit Card' : 'N/A', // Mock payment method
        revenue: selectedPlan?.price ? parseInt(selectedPlan.price.split(' ')[0]) : 0,
    };
    
    existingSubscribers.push(newSubscriber);
    localStorage.setItem('dojobeacon-subscribers', JSON.stringify(existingSubscribers));
  };


  const handleActivateDemoSubmit = () => {
    if (!demoInfoData.fullName || !demoInfoData.email || !demoInfoData.gender) {
        toast({
            title: "Missing Information",
            description: "Please fill in at least Full Name, Email and Gender for the demo.",
            variant: "destructive",
        });
        return;
    }
    saveSubscriberInfo(demoInfoData, 'Demo');
    toast({
      title: "Demo Information Captured!",
      description: "You can now access up to 25 sample questions. (This is a mock feature)",
    });
    setIsDemoInfoDialogOpen(false);
    setDemoInfoData(initialDemoInfoData);
    setSelectedDemoProvince('');
  };
  
  const handlePremiumSubscribeSubmit = async () => {
    if (!user) {
        toast({ title: "Login Required", description: "You must be logged in to subscribe.", variant: "destructive" });
        return;
    }
    if (!premiumFormData.fullName || !premiumFormData.email || !premiumFormData.gender) {
         toast({
            title: "Missing Information",
            description: "Please fill in Full Name, Email, and Gender to subscribe.",
            variant: "destructive",
        });
        return;
    }
    
    saveSubscriberInfo(premiumFormData, selectedPlan?.name.split(' ')[0] as 'Monthly' | '6-Month' | 'Yearly' || 'Monthly');
    
    toast({ title: "Redirecting to payment...", description: "Please wait." });
    
    try {
        const response = await fetch('/api/payments/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Assuming token is stored in localStorage after login
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ plan: selectedPlan?.api_plan_id })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create checkout session.');
        }

        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe
        
    } catch (error: any) {
        toast({
            title: 'Payment Error',
            description: error.message || 'Could not initiate payment. Please try again.',
            variant: 'destructive',
        });
    }

    setIsPremiumDialogOpen(false);
    setPremiumFormData(initialPremiumFormData);
    setSelectedPremiumProvince('');
  };
  
    const handleInstitutionalSubscribeSubmit = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "You must be logged in as a Super Admin to subscribe an institution.", variant: "destructive" });
            return;
        }
        if (!institutionalFormData.institutionName || !institutionalFormData.adminName || !institutionalFormData.adminEmail || !institutionalFormData.password) {
            toast({ title: "Missing Information", description: "Institution Name, Admin Name, Admin Email, and Password are required.", variant: "destructive" });
            return;
        }
        if (institutionalFormData.password !== institutionalFormData.confirmPassword) {
            toast({ title: "Password Mismatch", description: "The passwords you entered do not match.", variant: "destructive" });
            return;
        }

        // Mock: save institution locally first to get an ID. In real app, backend would handle this.
        const existingSubscriptionsRaw = localStorage.getItem('dojobeacon-institutional-subscriptions');
        const existingSubscriptions = existingSubscriptionsRaw ? JSON.parse(existingSubscriptionsRaw) : [];
        const newSubscriptionId = `inst-${Date.now()}`;
        const newSubscription: InstitutionalFormData = {
            id: newSubscriptionId,
            ...institutionalFormData,
        };
        existingSubscriptions.push(newSubscription);
        localStorage.setItem('dojobeacon-institutional-subscriptions', JSON.stringify(existingSubscriptions));
        
        toast({ title: "Redirecting to payment...", description: "Please wait." });

         try {
            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ plan: 'institutional', institutionId: newSubscriptionId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                // If checkout fails, remove the temporarily saved institution
                const updatedSubscriptions = existingSubscriptions.filter((sub: any) => sub.id !== newSubscriptionId);
                localStorage.setItem('dojobeacon-institutional-subscriptions', JSON.stringify(updatedSubscriptions));
                throw new Error(errorData.message || 'Failed to create checkout session.');
            }

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe
            
        } catch (error: any) {
            toast({
                title: 'Payment Error',
                description: error.message || 'Could not initiate payment. Please try again.',
                variant: 'destructive',
            });
        }
        
        setIsInstitutionalDialogOpen(false);
        setInstitutionalFormData(initialInstitutionalFormData);
        setSelectedInstitutionalProvince('');
  };

  const premiumFeatures = [
    "Unlimited Custom Tests",
    "Full Access to AI Insights",
    "Detailed Performance Analytics",
    "Complete Test History & Review",
    "Past MDCAT Papers Practice",
    "Goal Setting Features",
    "Priority Support",
    "Ad-Free Experience",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Start with our Demo plan to get a feel for DojoBeacon, or unlock the full potential of your exam preparation with DojoBeacon Premium.
        </p>
      </section>

      {/* Demo Plan Card - Centered */}
      <div className="flex justify-center">
        <Card className="shadow-lg flex flex-col max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Demo Plan</CardTitle>
            <CardDescription className="text-xl font-semibold text-accent">
              Free
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Get a taste of DojoBeacon with a 3-day trial.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <ul className="space-y-3 text-muted-foreground">
              {[
                "3-Day Free Trial",
                "Access to the first chapter of all subjects",
                "Create custom tests from available content",
                "Limited Analytics Preview",
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
              Activate 3-Day Trial
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Premium Plans Section */}
      <section>
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
               <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">DojoBeacon Premium Plans</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get unlimited access to all features and accelerate your preparation.
            </p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Monthly Plan */}
            <Card className="shadow-lg border-2 border-transparent hover:border-primary/50 transition-all flex flex-col">
                 <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl mb-2">Monthly</CardTitle>
                    <CardDescription className="text-xl font-semibold text-primary">
                      1000 PKR / month
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                        Flexible monthly payments.
                    </p>
                 </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-3 text-muted-foreground text-sm">
                       {premiumFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2 mt-auto">
                    <Button onClick={() => handleOpenSubscriptionDialog({ name: 'Monthly Plan', price: '1000 PKR', billing_desc: 'Billed monthly.', api_plan_id: 'monthly' })} className="w-full text-lg py-6" variant="outline">
                        Subscribe
                    </Button>
                </CardFooter>
            </Card>

            {/* 6-Month Plan */}
            <Card className="shadow-xl border-primary border-2 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold transform translate-x-8 translate-y-8 rotate-45">
                    POPULAR
                </div>
                <CardHeader className="text-center pt-10">
                    <CardTitle className="text-2xl mb-2">6-Month</CardTitle>
                    <CardDescription className="text-xl font-semibold text-primary">
                    5000 PKR / 6 months
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                    Save ~16% compared to monthly!
                    </p>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-3 text-muted-foreground text-sm">
                       {premiumFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2 mt-auto">
                    <Button onClick={() => handleOpenSubscriptionDialog({ name: '6-Month Plan', price: '5000 PKR', billing_desc: 'Billed every 6 months.', api_plan_id: 'yearly'  })} className="w-full text-lg py-6">
                    Subscribe
                    </Button>
                </CardFooter>
            </Card>

            {/* 12-Month Plan */}
            <Card className="shadow-lg border-2 border-transparent hover:border-primary/50 transition-all flex flex-col">
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-xs font-semibold transform translate-x-10 translate-y-7 -rotate-45 origin-bottom-left">
                    BEST VALUE
                </div>
                <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl mb-2">Yearly</CardTitle>
                    <CardDescription className="text-xl font-semibold text-primary">
                    10000 PKR / year
                    </CardDescription>
                     <p className="text-sm text-muted-foreground mt-1">
                        2 months free!
                    </p>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-3 text-muted-foreground text-sm">
                        {premiumFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2 mt-auto">
                    <Button onClick={() => handleOpenSubscriptionDialog({ name: 'Yearly Plan', price: '10000 PKR', billing_desc: 'Billed annually.', api_plan_id: 'yearly' })} className="w-full text-lg py-6" variant="outline">
                        Subscribe
                    </Button>
                </CardFooter>
            </Card>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-6">
            By subscribing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">Terms of Use</Link> and acknowledge
            our automatic renewal policy where applicable.
        </p>
      </section>
      
       {/* Institutional Plan Section */}
      <section>
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
               <Building className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl">For Institutions</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Empower your entire school, college, or academy with a dedicated institutional plan.
            </p>
        </div>
        <div className="flex justify-center">
            <Card className="shadow-xl border-accent/80 border-2 flex flex-col max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Institutional Plan</CardTitle>
                <CardDescription className="text-xl font-semibold text-accent">
                  100,000 PKR / year
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlimited teachers and students.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow">
                <ul className="space-y-3 text-muted-foreground sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
                  {[
                    "All Premium Features",
                    "Dedicated Institution Dashboard",
                    "Manage Teachers & Students",
                    "Create Classes & Sections",
                    "Assign Tests to Classes",
                    "Bulk Student Upload",
                    "Approve Student Re-tests",
                    "Downloadable Class Reports (PDF)",
                    "Student Leaderboards (Class & Institution)",
                    "Consolidated Analytics",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button onClick={() => setIsInstitutionalDialogOpen(true)} className="w-full text-lg py-6" variant="default" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                  Subscribe
                </Button>
              </CardFooter>
            </Card>
        </div>
      </section>

      {/* Demo Information Dialog */}
        <Dialog open={isDemoInfoDialogOpen} onOpenChange={(open) => {
            setIsDemoInfoDialogOpen(open);
            if (!open) {
                setDemoInfoData(initialDemoInfoData);
                setSelectedDemoProvince('');
            }
        }}>
            <DialogContent className="sm:max-w-md lg:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-accent" /> Activate Your 3-Day Demo
                    </DialogTitle>
                    <DialogDescription>
                        Please provide some basic information to activate your demo access.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="demoFullName">Full Name</Label>
                          <Input id="demoFullName" name="fullName" value={demoInfoData.fullName} onChange={handleDemoInfoInputChange} placeholder="e.g., Aisha Khan" />
                      </div>
                      <div>
                          <Label htmlFor="demoDob">Date of Birth</Label>
                          <Input id="demoDob" name="dob" type="date" value={demoInfoData.dob} onChange={handleDemoInfoInputChange} />
                      </div>
                    </div>
                     <div>
                        <Label htmlFor="demoGender">Gender</Label>
                        <Select name="gender" onValueChange={(value) => handleDemoInfoSelectChange('gender', value)} value={demoInfoData.gender}>
                            <SelectTrigger id="demoGender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="demoEducationBoard">Education Board</Label>
                         <Combobox
                            options={boardOptions}
                            value={demoInfoData.educationBoard}
                            onChange={(value) => handleDemoInfoSelectChange('educationBoard', value)}
                            placeholder="Select your board..."
                            searchPlaceholder="Search boards..."
                            notFoundMessage="No board found."
                         />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="demoProvince">Province</Label>
                            <Select name="province" onValueChange={(value) => handleDemoInfoSelectChange('province', value)} value={demoInfoData.province}>
                                <SelectTrigger id="demoProvince"><SelectValue placeholder="Select Province" /></SelectTrigger>
                                <SelectContent>
                                    {provinces.map(prov => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="demoCity">City</Label>
                            <Select name="city" onValueChange={(value) => handleDemoInfoSelectChange('city', value)} value={demoInfoData.city} disabled={!selectedDemoProvince}>
                                <SelectTrigger id="demoCity"><SelectValue placeholder="Select City" /></SelectTrigger>
                                <SelectContent>
                                    {availableDemoCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="demoMobileNumber">Mobile Number</Label>
                            <Input id="demoMobileNumber" name="mobileNumber" type="tel" value={demoInfoData.mobileNumber} onChange={handleDemoInfoInputChange} placeholder="e.g., 03xxxxxxxxx" />
                        </div>
                        <div>
                            <Label htmlFor="demoEmail">Email Address</Label>
                            <Input id="demoEmail" name="email" type="email" value={demoInfoData.email} onChange={handleDemoInfoInputChange} placeholder="e.g., aisha.khan@example.com" />
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => setIsDemoInfoDialogOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleActivateDemoSubmit}>Activate Demo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


      {/* Premium Subscription Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={(open) => {
        setIsPremiumDialogOpen(open);
        if (!open) {
            setPremiumFormData(initialPremiumFormData);
            setSelectedPremiumProvince('');
        }
      }}>
        <DialogContent className="sm:max-w-md lg:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" /> Subscribe to {selectedPlan?.name || 'DojoBeacon Premium'}
            </DialogTitle>
            <DialogDescription>
              Enter your details to unlock all premium features. {selectedPlan?.billing_desc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="text-sm font-semibold text-muted-foreground col-span-full">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="premiumFullName">Full Name</Label>
                  <Input id="premiumFullName" name="fullName" value={premiumFormData.fullName} onChange={handlePremiumInputChange} placeholder="As on your CNIC/Passport" />
              </div>
              <div>
                  <Label htmlFor="premiumDob">Date of Birth</Label>
                  <Input id="premiumDob" name="dob" type="date" value={premiumFormData.dob} onChange={handlePremiumInputChange} />
              </div>
            </div>
            <div>
                <Label htmlFor="premiumGender">Gender</Label>
                <Select name="gender" onValueChange={(value) => handlePremiumSelectChange('gender', value)} value={premiumFormData.gender}>
                    <SelectTrigger id="premiumGender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="premiumEducationBoard">Education Board</Label>
                <Combobox
                    options={boardOptions}
                    value={premiumFormData.educationBoard}
                    onChange={(value) => handlePremiumSelectChange('educationBoard', value)}
                    placeholder="Select your board..."
                    searchPlaceholder="Search boards..."
                    notFoundMessage="No board found."
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="premiumProvince">Province</Label>
                    <Select name="province" onValueChange={(value) => handlePremiumSelectChange('province', value)} value={premiumFormData.province}>
                        <SelectTrigger id="premiumProvince"><SelectValue placeholder="Select Province" /></SelectTrigger>
                        <SelectContent>
                            {provinces.map(prov => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="premiumCity">City</Label>
                    <Select name="city" onValueChange={(value) => handlePremiumSelectChange('city', value)} value={premiumFormData.city} disabled={!selectedPremiumProvince}>
                        <SelectTrigger id="premiumCity"><SelectValue placeholder="Select City" /></SelectTrigger>
                        <SelectContent>
                            {availablePremiumCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="premiumMobileNumber">Mobile Number (for OTP)</Label>
                  <Input id="premiumMobileNumber" name="mobileNumber" type="tel" value={premiumFormData.mobileNumber} onChange={handlePremiumInputChange} placeholder="e.g., 03xxxxxxxxx" />
                </div>
                 <div>
                  <Label htmlFor="premiumEmail">Email Address</Label>
                  <Input id="premiumEmail" name="email" type="email" value={premiumFormData.email} onChange={handlePremiumInputChange} placeholder="e.g., your.email@example.com" />
                </div>
            </div>

            <h3 className="text-sm font-semibold text-muted-foreground col-span-full pt-2">Payment Details</h3>
            <p className="text-xs text-muted-foreground pt-1">
              Payments are securely processed via our payment gateway. Your financial details are encrypted and never stored on our servers. You will be redirected to complete the payment.
            </p>
          </div>
          <DialogFooter className="sm:justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPremiumDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePremiumSubscribeSubmit}>
              Subscribe &amp; Pay {selectedPlan?.price || ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Institutional Subscription Dialog */}
        <Dialog open={isInstitutionalDialogOpen} onOpenChange={(open) => {
            setIsInstitutionalDialogOpen(open);
            if (!open) {
                setInstitutionalFormData(initialInstitutionalFormData);
                setSelectedInstitutionalProvince('');
            }
        }}>
            <DialogContent className="sm:max-w-md lg:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Building className="h-6 w-6" /> Subscribe to Institutional Plan
                    </DialogTitle>
                    <DialogDescription>
                        Enter your institution's details to get started. You will be billed 100,000 PKR annually.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold text-muted-foreground">Institution Details</h3>
                    <div>
                        <Label htmlFor="instName">Institution Name</Label>
                        <Input id="instName" name="institutionName" value={institutionalFormData.institutionName} onChange={handleInstitutionalInputChange} placeholder="e.g., City College" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="instType">Institution Type</Label>
                            <Select name="institutionType" onValueChange={(value) => handleInstitutionalSelectChange('institutionType', value as InstitutionalFormData['institutionType'])} value={institutionalFormData.institutionType}>
                                <SelectTrigger id="instType"><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Public">Public (Government)</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="businessType">Business Type</Label>
                            <Select name="businessType" onValueChange={(value) => handleInstitutionalSelectChange('businessType', value as InstitutionalFormData['businessType'])} value={institutionalFormData.businessType}>
                                <SelectTrigger id="businessType"><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="College">College</SelectItem>
                                    <SelectItem value="School">School</SelectItem>
                                    <SelectItem value="Academy">Academy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="instProvince">Province</Label>
                            <Select name="province" onValueChange={(value) => handleInstitutionalSelectChange('province', value)} value={institutionalFormData.province}>
                                <SelectTrigger id="instProvince"><SelectValue placeholder="Select Province" /></SelectTrigger>
                                <SelectContent>
                                    {provinces.map(prov => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="instCity">City</Label>
                            <Select name="city" onValueChange={(value) => handleInstitutionalSelectChange('city', value)} value={institutionalFormData.city} disabled={!selectedInstitutionalProvince}>
                                <SelectTrigger id="instCity"><SelectValue placeholder="Select City" /></SelectTrigger>
                                <SelectContent>
                                    {availableInstitutionalCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-muted-foreground pt-4">Administrator Details</h3>
                     <div>
                        <Label htmlFor="adminName">Admin Full Name</Label>
                        <Input id="adminName" name="adminName" value={institutionalFormData.adminName} onChange={handleInstitutionalInputChange} placeholder="e.g., Dr. Ahmad" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input id="adminEmail" name="adminEmail" type="email" value={institutionalFormData.adminEmail} onChange={handleInstitutionalInputChange} placeholder="e.g., admin@citycollege.edu" />
                        </div>
                        <div>
                            <Label htmlFor="adminPhone">Admin Phone Number</Label>
                            <Input id="adminPhone" name="adminPhone" type="tel" value={institutionalFormData.adminPhone} onChange={handleInstitutionalInputChange} placeholder="e.g., 03xxxxxxxxx" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={institutionalFormData.password} onChange={handleInstitutionalInputChange} placeholder="Create a strong password"/>
                        </div>
                         <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" value={institutionalFormData.confirmPassword} onChange={handleInstitutionalInputChange} placeholder="Repeat your password"/>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsInstitutionalDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleInstitutionalSubscribeSubmit} style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                        Subscribe &amp; Proceed to Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    