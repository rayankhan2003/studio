
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, History, ShieldX, CalendarOff, Edit3, AlertCircle, Smartphone, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - replace with actual data fetching in a real application
const mockUser = {
  name: "Aisha Khan",
  email: "aisha.khan@example.com",
};

const mockSubscription = {
  status: "Active", // Could be "Active", "Cancelled", "Past Due", "Inactive"
  planName: "PrepWise Premium",
  price: "1000 PKR/month",
  nextBillingDate: "2024-08-30",
  startDate: "2024-03-30",
  paymentMethodType: "Card", // 'Card', 'Easypaisa', 'JazzCash'
  paymentMethodDetail: "Visa **** 1234"
};

const mockPaymentHistory = [
  { id: "pay_1", date: "2024-07-30", amount: "1000 PKR", status: "Paid", method: "Visa **** 1234" },
  { id: "pay_2", date: "2024-06-30", amount: "1000 PKR", status: "Paid", method: "Visa **** 1234" },
  { id: "pay_3", date: "2024-05-30", amount: "1000 PKR", status: "Failed", method: "Easypaisa" },
  { id: "pay_4", date: "2024-04-30", amount: "1000 PKR", status: "Paid", method: "Visa **** 1234" },
];

type PaymentMethodType = 'card' | 'easypaisa' | 'jazzcash';

export default function AccountPage() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState(mockSubscription);
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');

  const handleCancelSubscription = () => {
    setSubscription(prev => ({ ...prev, status: "Cancelled", nextBillingDate: "N/A" }));
    toast({
      title: "Subscription Cancelled",
      description: "Your PrepWise Premium subscription has been cancelled. You will retain access until the end of your current billing period.",
    });
  };
  
  const handleUpdatePayment = () => {
    let newPaymentMethodDisplay = "";
    if (selectedPaymentType === 'card') {
      newPaymentMethodDisplay = `Card ${cardDetails.name ? `(${cardDetails.name})` : ''}`;
    } else if (selectedPaymentType === 'easypaisa') {
      newPaymentMethodDisplay = `Easypaisa (${mobileWalletNumber})`;
    } else if (selectedPaymentType === 'jazzcash') {
      newPaymentMethodDisplay = `JazzCash (${mobileWalletNumber})`;
    }

    setSubscription(prev => ({
      ...prev,
      paymentMethodType: selectedPaymentType.charAt(0).toUpperCase() + selectedPaymentType.slice(1),
      paymentMethodDetail: newPaymentMethodDisplay || "Updated (Details Mocked)"
    }));

    toast({
      title: "Payment Method Update Attempted",
      description: `Your payment method has been mocked as updated to ${newPaymentMethodDisplay}. (This is a mock action)`,
    });
    setIsUpdatePaymentOpen(false);
    // Reset form fields
    setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
    setMobileWalletNumber('');
  }

  const resetDialogFields = () => {
    setSelectedPaymentType('card');
    setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
    setMobileWalletNumber('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Subscription Details</CardTitle>
              <CardDescription>Manage your PrepWise Premium subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Plan: {subscription.planName}</h3>
                <p className="text-muted-foreground">{subscription.price}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status: 
                  <Badge 
                    variant={subscription.status === "Active" ? "default" : "destructive"} 
                    className={`ml-2 ${subscription.status === "Active" ? 'bg-green-500 hover:bg-green-600' : subscription.status === "Cancelled" ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {subscription.status}
                  </Badge>
                </h3>
              </div>
               <div>
                <h3 className="font-semibold">Current Payment Method:</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  {subscription.paymentMethodType === 'Card' && <CreditCard className="h-5 w-5 text-muted-foreground" />}
                  {(subscription.paymentMethodType === 'Easypaisa' || subscription.paymentMethodType === 'JazzCash') && <Smartphone className="h-5 w-5 text-muted-foreground" />}
                  {subscription.paymentMethodDetail}
                </p>
              </div>
              {subscription.status === "Active" && (
                <div>
                  <h3 className="font-semibold">Next Billing Date:</h3>
                  <p className="text-muted-foreground">{subscription.nextBillingDate}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold">Subscription Start Date:</h3>
                <p className="text-muted-foreground">{subscription.startDate}</p>
              </div>
            </CardContent>
            {subscription.status === "Active" && (
              <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2 justify-end">
                 <Button variant="outline" onClick={() => { resetDialogFields(); setIsUpdatePaymentOpen(true); }}>
                  <CreditCard className="mr-2 h-4 w-4" /> Update Payment Method
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <CalendarOff className="mr-2 h-4 w-4" /> Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        If you cancel, you'll lose access to PrepWise Premium features at the end of your current billing period ({subscription.nextBillingDate}). Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90">
                        Yes, Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
             {subscription.status === "Cancelled" && (
                <CardFooter className="border-t pt-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        Your subscription is cancelled and will not renew. Access remains until the end of your last paid period.
                    </p>
                </CardFooter>
             )}
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-6 w-6 text-primary" /> Payment History
              </CardTitle>
              <CardDescription>Review your past payments and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockPaymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPaymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "Paid" ? "secondary" : "destructive"}
                            className={payment.status === "Paid" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No payment history found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <p className="font-semibold">{mockUser.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <p className="font-semibold">{mockUser.email}</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full" disabled>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Not Implemented)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Payment Method Dialog */}
      <AlertDialog open={isUpdatePaymentOpen} onOpenChange={(open) => {
          setIsUpdatePaymentOpen(open);
          if (!open) resetDialogFields();
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Select your payment type and enter the new details. This is a mock form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={selectedPaymentType} onValueChange={(value) => setSelectedPaymentType(value as PaymentMethodType)}>
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <span className="flex items-center gap-2"><CreditCard /> Card (Visa, Mastercard, Debit)</span>
                  </SelectItem>
                  <SelectItem value="easypaisa">
                     <span className="flex items-center gap-2"><Smartphone /> Easypaisa</span>
                  </SelectItem>
                  <SelectItem value="jazzcash">
                     <span className="flex items-center gap-2"><Smartphone /> JazzCash</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPaymentType === 'card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="•••• •••• •••• ••••" value={cardDetails.number} onChange={(e) => setCardDetails(prev => ({...prev, number: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails(prev => ({...prev, expiry: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="•••" value={cardDetails.cvc} onChange={(e) => setCardDetails(prev => ({...prev, cvc: e.target.value}))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="Aisha Khan" value={cardDetails.name} onChange={(e) => setCardDetails(prev => ({...prev, name: e.target.value}))} />
                </div>
              </>
            )}

            {(selectedPaymentType === 'easypaisa' || selectedPaymentType === 'jazzcash') && (
              <div className="space-y-2">
                <Label htmlFor="mobileWalletNumber">Account/Mobile Number</Label>
                <Input 
                  id="mobileWalletNumber" 
                  placeholder="e.g., 03xxxxxxxxx" 
                  value={mobileWalletNumber}
                  onChange={(e) => setMobileWalletNumber(e.target.value)}
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setIsUpdatePaymentOpen(false); resetDialogFields();}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdatePayment}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    