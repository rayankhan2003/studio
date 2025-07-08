
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, MapPin, Building, BarChart2, TrendingUp, UserCheck, Calendar } from 'lucide-react';
import { educationalBoards, provinces, citiesByProvince } from '@/lib/pakistan-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const generateMockSubscribers = (count: number): MockSubscriber[] => {
  const subscribers: MockSubscriber[] = [];
  const plans: MockSubscriber['plan'][] = ['Monthly', '6-Month', 'Yearly', 'Demo'];
  const paymentMethods: MockSubscriber['paymentMethod'][] = ['Credit Card', 'Easypaisa', 'JazzCash'];
  const genders: MockSubscriber['gender'][] = ['Male', 'Female'];
  const planPrices: Record<string, number> = { 'Monthly': 1000, '6-Month': 5000, 'Yearly': 10000, 'Demo': 0 };

  for (let i = 0; i < count; i++) {
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const cities = citiesByProvince[province] || [];
    const city = cities[Math.floor(Math.random() * cities.length)] || 'N/A';
    const plan = plans[Math.floor(Math.random() * plans.length)];

    subscribers.push({
      id: `user-${1000 + i}`,
      fullName: `User ${1000 + i}`,
      email: `user${1000+i}@example.com`,
      board: educationalBoards[Math.floor(Math.random() * educationalBoards.length)],
      province,
      city,
      gender: genders[Math.floor(Math.random() * genders.length)],
      plan,
      subscriptionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: plan === 'Demo' ? 'N/A' : paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      revenue: planPrices[plan],
    });
  }
  return subscribers;
};

const COLORS = ['#3F51B5', '#7E57C2', '#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#607D8B'];

export default function AdminAnalyticsPage() {
  const [subscribers, setSubscribers] = useState<MockSubscriber[]>([]);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    let storedSubscribersRaw = localStorage.getItem('smartercat-subscribers');
    if (!storedSubscribersRaw || JSON.parse(storedSubscribersRaw).length === 0) {
      const mockData = generateMockSubscribers(150); // Generate 150 mock users if none exist
      localStorage.setItem('smartercat-subscribers', JSON.stringify(mockData));
      storedSubscribersRaw = JSON.stringify(mockData);
    }
    setSubscribers(JSON.parse(storedSubscribersRaw));
  }, []);

  const totalUsers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.plan !== 'Demo').length;
  const totalRevenue = subscribers.reduce((acc, s) => acc + s.revenue, 0);

  const getCountBy = (key: keyof MockSubscriber) => {
    return subscribers.reduce((acc, subscriber) => {
      const value = subscriber[key] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  
  const getRevenueBy = (key: keyof MockSubscriber) => {
     return subscribers.reduce((acc, subscriber) => {
      const value = subscriber[key] as string;
      acc[value] = (acc[value] || 0) + subscriber.revenue;
      return acc;
    }, {} as Record<string, number>);
  }

  const formatDataForChart = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }

  const growthData = useMemo(() => {
    const format = timeFrame === 'monthly' ? (d: Date) => d.toISOString().slice(0, 7) : (d: Date) => {
      const year = d.getFullYear();
      const week = Math.ceil((((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
      return `${year}-W${String(week).padStart(2, '0')}`;
    };

    const grouped = subscribers.reduce((acc, s) => {
        const dateKey = format(new Date(s.subscriptionDate));
        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, newSubscribers: 0, totalRevenue: 0 };
        }
        acc[dateKey].newSubscribers++;
        acc[dateKey].totalRevenue += s.revenue;
        return acc;
    }, {} as Record<string, {date: string, newSubscribers: number, totalRevenue: number}>);
    
    return Object.values(grouped).sort((a,b) => a.date.localeCompare(b.date));
  }, [subscribers, timeFrame]);

  const boardData = formatDataForChart(getCountBy('board'));
  const provinceData = formatDataForChart(getCountBy('province'));
  const cityData = formatDataForChart(getCountBy('city')).slice(0, 10);
  const genderData = formatDataForChart(getCountBy('gender'));
  const planData = formatDataForChart(getCountBy('plan'));
  const revenueByPlanData = formatDataForChart(getRevenueBy('plan'));
  const revenueByProvinceData = formatDataForChart(getRevenueBy('province'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscriber Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Total Users</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="text-green-500"/> Active Subscribers</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold">{activeSubscribers}</p></CardContent></Card>
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR ${value/1000}k`} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="newSubscribers" name="New Subscribers" stroke="#3F51B5" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary"/> Subscribers by Board</CardTitle><CardDescription>Top 10 boards by subscriber count.</CardDescription></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boardData.slice(0, 10)} layout="vertical" margin={{ left: 150 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fafafa'}} />
                <Bar dataKey="value" name="Subscribers" fill="#3F51B5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> Subscribers by Province</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData}>
                 <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                 <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip />
                 <Bar dataKey="value" name="Subscribers" fill="#7E57C2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Gender Breakdown</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                       {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Subscription Plans</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                       {planData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Revenue by Plan</CardTitle></CardHeader>
            <CardContent className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueByPlanData.filter(d => d.name !== 'Demo')} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}>
                       {revenueByPlanData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `PKR ${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
