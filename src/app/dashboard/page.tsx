
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from '@/components/ui/progress';
import { Activity, CalendarDays, CheckCircle2, LineChart, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  overallScorePercentage: number;
}

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    status: 'Active' | 'Silent';
    createdAt: string;
}


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [performance, setPerformance] = useState({ averageScore: 0, testsTaken: 0 });
  const [recentTests, setRecentTests] = useState<StoredTestReport[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Event[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Load test history
    const storedHistoryString = localStorage.getItem('prepwiseTestHistory');
    if (storedHistoryString) {
      const storedHistory: StoredTestReport[] = JSON.parse(storedHistoryString);
      
      if (storedHistory.length > 0) {
        const totalScoreSum = storedHistory.reduce((acc, report) => acc + report.overallScorePercentage, 0);
        setPerformance({
          averageScore: parseFloat((totalScoreSum / storedHistory.length).toFixed(1)),
          testsTaken: storedHistory.length,
        });
      }

      storedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTests(storedHistory.slice(0, 3));
    }
    
    // Load upcoming events
    const storedEventsString = localStorage.getItem('dojobeacon-events');
    if (storedEventsString) {
        const allEvents: Event[] = JSON.parse(storedEventsString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today

        const futureActiveEvents = allEvents
            .filter(event => event.status === 'Active' && new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        setUpcomingExams(futureActiveEvents);
    }

  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Dashboard</h1>
        <Button asChild>
          <Link href="/test/custom">
             <Settings className="mr-2 h-4 w-4" /> Create Custom Test
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Upcoming Exams & Events
            </CardTitle>
            <CardDescription>Stay prepared for what's next.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isClient ? (
                 <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : upcomingExams.length > 0 ? (
              <ul className="space-y-3">
                {upcomingExams.map((exam) => (
                  <li key={exam.id} className="p-3 bg-muted/50 rounded-md">
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {exam.description && <p className="text-xs text-muted-foreground mt-1">{exam.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming exams or events scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Recent Tests
            </CardTitle>
            <CardDescription>Review your latest attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isClient ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentTests.length > 0 ? (
              <ul className="space-y-3">
                {recentTests.map((test) => (
                  <li key={test.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">Completed: {new Date(test.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-lg text-primary">{test.overallScorePercentage.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent tests found.</p>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/history">View All History</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <LineChart className="h-6 w-6 text-accent" />
              Performance Summary
            </CardTitle>
            <CardDescription>A quick look at your overall progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-center">
            {!isClient ? (
               <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : performance.testsTaken > 0 ? (
              <>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-5xl font-bold text-primary">{performance.averageScore}%</h3>
                  <p className="text-sm text-muted-foreground mt-1">Overall Average Score</p>
                </div>
                 <div className="space-y-2">
                    <Progress value={performance.averageScore} className="w-full h-3" />
                    <p className="text-sm text-muted-foreground">Across {performance.testsTaken} test(s)</p>
                </div>
              </>
            ) : (
                <p className="text-muted-foreground py-8">No performance data yet. Take a test to see your summary!</p>
            )}
            <Button asChild className="w-full mt-4">
              <Link href="/analytics">View Detailed Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <Button asChild variant="secondary" className="w-full h-16 text-base">
            <Link href="/planner">AI Study Planner</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full h-16 text-base">
            <Link href="/faq">View FAQs</Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
