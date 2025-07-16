
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, BarChart2, TrendingUp, UserCheck, MapPin, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import { educationalBoards, provinces, citiesByProvince } from '@/lib/pakistan-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MockSubscriber {
  id: string;
  fullName: string;
  email: string;
  board: string;
  province: string;
  city: string;
  gender: 'Male' | 'Female';
  plan: 'Demo' | 'Monthly' | '6-Month' | 'Yearly';
  subscriptionDate: string;
  paymentMethod: 'Credit Card' | 'Easypaisa' | 'JazzCash' | 'N/A';
  revenue: number;
}

const COLORS = ['#3F51B5', '#7E57C2', '#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#607D8B'];

const NoDataMessage = () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available to display.
    </div>
);


export default function AdminAnalyticsPage() {
  const [subscribers, setSubscribers] = useState<MockSubscriber[]>([]);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const storedSubscribersRaw = localStorage.getItem('path2med-subscribers');
    if (storedSubscribersRaw) {
        try {
            const parsedSubscribers = JSON.parse(storedSubscribersRaw);
            setSubscribers(Array.isArray(parsedSubscribers) ? parsedSubscribers : []);
        } catch (error) {
            console.error("Failed to parse subscribers from localStorage", error);
            setSubscribers([]);
        }
    } else {
        setSubscribers([]);
    }
  }, []);

  const totalUsers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.plan !== 'Demo').length;
  const totalRevenue = subscribers.reduce((acc, s) => acc + s.revenue, 0);

  const getCountBy = (key: keyof MockSubscriber) => {
    return subscribers.reduce((acc, subscriber) => {
      const value = subscriber[key] as string;
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  };
  
  const getRevenueBy = (key: keyof MockSubscriber) => {
     return subscribers.reduce((acc, subscriber) => {
      const value = subscriber[key] as string;
       if (value) {
        acc[value] = (acc[value] || 0) + subscriber.revenue;
       }
      return acc;
    }, {} as Record<string, number>);
  }

  const formatDataForChart = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }

  const growthData = useMemo(() => {
    if (subscribers.length === 0) {
      return [];
    }
    
    const allDates = subscribers.map(s => new Date(s.subscriptionDate));
    const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date();

    const dataMap = new Map<string, { date: string; newSubscribers: number; totalRevenue: number }>();
    
    const getFormatKey = (d: Date, tf: 'monthly' | 'weekly'): string => {
        if (tf === 'monthly') {
            return d.toISOString().slice(0, 7); // YYYY-MM
        }
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    };
    
    let iterDate = new Date(earliestDate);
    while (iterDate <= maxDate) {
      const key = getFormatKey(iterDate, timeFrame);
      if (!dataMap.has(key)) {
        dataMap.set(key, { date: key, newSubscribers: 0, totalRevenue: 0 });
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }

    subscribers.forEach(s => {
      const key = getFormatKey(new Date(s.subscriptionDate), timeFrame);
      if (dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        entry.newSubscribers++;
        entry.totalRevenue += s.revenue;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  }, [subscribers, timeFrame]);

  const boardData = formatDataForChart(getCountBy('board'));
  const provinceData = formatDataForChart(getCountBy('province'));
  const genderData = formatDataForChart(getCountBy('gender'));
  const planData = formatDataForChart(getCountBy('plan'));
  const revenueByPlanData = formatDataForChart(getRevenueBy('plan'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
      </div>

       <Alert variant="default" className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary/80" />
            <AlertTitle className="text-primary/90 font-semibold">Live Data Source</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              This dashboard is now connected to real user actions. All analytics are dynamically generated from user registrations made through the pricing page. No mock data is used.
            </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Total Users</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="text-green-500"/> Active Subscribers</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{activeSubscribers}</p><CardDescription>(Premium Plans)</CardDescription></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/> Total Revenue</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">PKR {totalRevenue.toLocaleString()}</p></CardContent></Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="flex items-center gap-2 mb-2 sm:mb-0"><TrendingUp className="text-primary"/> Growth Over Time</CardTitle>
            <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR ${value/1000}k`} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="newSubscribers" name="New Subscribers" stroke="#3F51B5" strokeWidth={2} connectNulls />
                <Line yAxisId="right" type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#82ca9d" strokeWidth={2} connectNulls />
                </LineChart>
            </ResponsiveContainer>
          ) : <NoDataMessage />}
        </CardContent>
      </Card>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary"/> Subscribers by Board</CardTitle><CardDescription>Top 10 boards by subscriber count.</CardDescription></CardHeader>
          <CardContent className="h-[350px]">
            {boardData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boardData.slice(0, 10)} layout="vertical" margin={{ left: 150 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#fafafa'}} />
                    <Bar dataKey="value" name="Subscribers" fill="#3F51B5" radius={[0, 4, 4, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : <NoDataMessage />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> Subscribers by Province</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            {provinceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Subscribers" fill="#7E57C2" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ): <NoDataMessage />}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="text-primary"/> Gender Breakdown</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                {genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                ) : <NoDataMessage />}
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="text-primary"/> Subscription Plans</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                {planData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {planData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                ) : <NoDataMessage />}
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="text-primary"/> Revenue by Plan</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
                {revenueByPlanData.filter(d => d.name !== 'Demo').length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={revenueByPlanData.filter(d => d.name !== 'Demo')} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}>
                        {revenueByPlanData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `PKR ${Number(value).toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                ) : <NoDataMessage />}
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
