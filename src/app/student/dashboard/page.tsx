
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BarChart3, Bell, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

// Mock data - in a real app, this would be fetched from an API
const mockSubjects = ["Biology", "Chemistry", "Physics", "English"];
const mockUpcomingTests = [
    { id: 1, title: "Physics Midterm", date: "2024-08-15", time: "10:00 AM" },
    { id: 2, title: "Biology Chapter 3 Quiz", date: "2024-08-18", time: "2:00 PM" },
];
const mockNotifications = [
    { id: 1, text: "Dr. Ahmed has published the results for the Chemistry weekly test.", from: "System" },
    { id: 2, text: "Reminder: Your Physics Midterm is tomorrow. Be prepared!", from: "System" },
];

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-6 w-6 text-primary" /> Upcoming Tests & Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold text-md mb-2">Upcoming Tests</h3>
                    {mockUpcomingTests.length > 0 ? (
                        <ul className="space-y-2">
                            {mockUpcomingTests.map(test => (
                                <li key={test.id} className="p-3 bg-muted/50 rounded-md">
                                    <p className="font-medium">{test.title}</p>
                                    <p className="text-sm text-muted-foreground">{test.date} at {test.time}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No upcoming tests.</p>}
                 </div>
                 <div className="border-t pt-4">
                    <h3 className="font-semibold text-md mb-2">Notifications</h3>
                    {mockNotifications.length > 0 ? (
                         <ul className="space-y-2">
                            {mockNotifications.map(notif => (
                                <li key={notif.id} className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                                    {notif.text}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No new notifications.</p>}
                 </div>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" /> My Subjects
                </CardTitle>
                <CardDescription>View your progress and test results for each subject.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={mockSubjects[0]} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                        {mockSubjects.map(subject => (
                            <TabsTrigger key={subject} value={subject}>{subject}</TabsTrigger>
                        ))}
                    </TabsList>
                    {mockSubjects.map(subject => (
                        <TabsContent key={subject} value={subject} className="mt-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>{subject} Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">Detailed test marks and a progress graph for {subject} will be shown here.</p>
                                     {/* Placeholder for graph */}
                                    <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                                        <BarChart3 className="h-12 w-12 text-muted-foreground/50"/>
                                    </div>
                                    <Button variant="outline">View All {subject} Tests</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
         <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" /> My Detailed Report Card
                </CardTitle>
                <CardDescription>View a comprehensive summary of all your test results.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground mb-4">A detailed, downloadable report card summarizing performance across all subjects and tests will be available here.</p>
                <Button>View My Report Card (Coming Soon)</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
