
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, CreditCard, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentSettings {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  easypaisaNumber: string;
  jazzcashNumber: string;
}

const initialSettings: PaymentSettings = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  easypaisaNumber: '',
  jazzcashNumber: '',
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PaymentSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSettings = localStorage.getItem('path2med-payment-settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('path2med-payment-settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your payment receiving details have been updated (mock action).",
    });
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Warning</AlertTitle>
        <AlertDescription>
          This is a mock settings page. The data entered here is saved in your browser's local storage and is <strong>not secure</strong>.
          Do not enter real financial information. In a production application, this data must be handled by a secure backend and encrypted.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Receiving Account Details
          </CardTitle>
          <CardDescription>
            Enter the details for where subscription payments should be sent.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-muted-foreground">Bank Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" name="bankName" value={settings.bankName} onChange={handleInputChange} placeholder="e.g., HBL, Meezan Bank" />
                </div>
                <div>
                  <Label htmlFor="accountTitle">Account Title</Label>
                  <Input id="accountTitle" name="accountTitle" value={settings.accountTitle} onChange={handleInputChange} placeholder="e.g., John Doe" />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" name="accountNumber" value={settings.accountNumber} onChange={handleInputChange} placeholder="e.g., 0123456789012345" />
                </div>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" name="iban" value={settings.iban} onChange={handleInputChange} placeholder="e.g., PK12 ABCD 0123456789012345" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-muted-foreground">Mobile Wallets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="easypaisaNumber">Easypaisa Number</Label>
                  <Input id="easypaisaNumber" name="easypaisaNumber" value={settings.easypaisaNumber} onChange={handleInputChange} placeholder="e.g., 03xxxxxxxxx" />
                </div>
                <div>
                  <Label htmlFor="jazzcashNumber">JazzCash Number</Label>
                  <Input id="jazzcashNumber" name="jazzcashNumber" value={settings.jazzcashNumber} onChange={handleInputChange} placeholder="e.g., 03xxxxxxxxx" />
                </div>
              </div>
            </div>
            
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
