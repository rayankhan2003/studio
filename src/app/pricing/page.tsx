
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Smartphone, Banknote, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const paymentMethods = [
  { name: "Visa", icon: CreditCard },
  { name: "Mastercard", icon: CreditCard },
  { name: "Debit Card", icon: CreditCard },
  { name: "Easypaisa", icon: Smartphone },
  { name: "JazzCash", icon: Smartphone },
];

export default function PricingPage() {
  const { toast } = useToast();

  const handleSubscribe = () => {
    // In a real app, this would initiate the payment process.
    // For this prototype, we'll simulate a successful subscription.
    toast({
      title: "Subscription Initiated!",
      description: "You are being redirected to the payment gateway. (This is a mock action)",
    });
    // Simulate redirection or next step
    console.log("User clicked subscribe. Plan: 1000 PKR/month.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Unlock Premium Access
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Get full access to all SmarterCat features, personalized insights, and unlimited practice tests with our simple monthly subscription.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl border-primary border-2 relative overflow-hidden">
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
          <CardContent className="space-y-6">
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Unlimited Custom Tests",
                "Full Access to AI Insights",
                "Detailed Performance Analytics",
                "Complete Test History & Review",
                "Priority Support",
                "Ad-Free Experience",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button onClick={handleSubscribe} className="w-full text-lg py-6">
              Subscribe Now
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By subscribing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">Terms of Use</Link> and acknowledge
              our automatic renewal policy.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Banknote className="h-6 w-6 text-primary" /> Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">We accept a variety of payment methods for your convenience:</p>
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
                Your payment information is processed securely.
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
