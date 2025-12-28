'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BarChart3, Bell, FileText, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from '@/hooks/use-toast';

interface StudentTest {
    _id: string;
    title: string;
    subject: string;
    createdAt: string;
    isPublished: boolean;
}

interface Section {
    _id: string;
    name: string;
    subjectTeacherAssignments: Record<string, { teacherId: string; teacherName: string; }>;
}


export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<StudentTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.isInstitutionalStudent || !user.institutionId) {
          setIsLoading(false);
          return;
      }
      
      setIsLoading(true);
      
      try {
          // Fetch assigned subjects from section data
          const allSectionsRaw = localStorage.getItem(`sections_${user.institutionId}`);
          const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
          
          if (allStudentsRaw && allSectionsRaw) {
              const allStudents = JSON.parse(allStudentsRaw);
              const studentData = allStudents.find((s: any) => s.email === user.email);

              if (studentData && studentData.sectionId) {
                  const allSections = JSON.parse(allSectionsRaw);
                  const mySection = allSections.find((s: Section) => s._id === studentData.sectionId);
                  if (mySection) {
                      setAssignedSubjects(Object.keys(mySection.subjectTeacherAssignments));
                  }
              }
          }
          
          // NOTE: This assumes there's a backend endpoint to fetch tests.
          // For this example, we'll simulate fetching from localStorage.
          // This should be replaced with an actual API call.
          // e.g., const response = await fetch('/api/student/tests');
          const allTestsRaw = localStorage.getItem('prepwiseTestHistory'); // This is not ideal, should be from a proper source
          const allTests = allTestsRaw ? JSON.parse(allTestsRaw) : [];
          // This is a placeholder logic, a real app would have a dedicated test list.
          setUpcomingTests(allTests.slice(0,2));

      } catch (e) {
          toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive'});
          console.error(e);
      } finally {
          setIsLoading(false);
      }

    }
    fetchData();
  }, [user, toast]);
  

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
                    <Bell className="h-6 w-6 text-primary" /> Tests & Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold text-md mb-2">Recently Published Tests</h3>
                     {isLoading ? <Loader2 className="animate-spin" /> : upcomingTests.length > 0 ? (
                        <ul className="space-y-2">
                            {upcomingTests.map(test => (
                                <li key={test._id} className="p-3 bg-muted/50 rounded-md">
                                    <p className="font-medium">{test.title}</p>
                                    <p className="text-sm text-muted-foreground">{test.subject}</p>
                                </li>
                            ))}
                             <li className="pt-2"><Button asChild variant="secondary" size="sm" className="w-full"><Link href="/student/tests">View All Tests</Link></Button></li>
                        </ul>
                    ) : <p className="text-sm text-muted-foreground text-center py-4">No new tests from your teachers.</p>}
                 </div>
                 
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" /> My Subjects & Performance
                </CardTitle>
                <CardDescription>View your progress and test results for each subject.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? <Loader2 className="animate-spin" /> : assignedSubjects.length > 0 ? (
                    <Tabs defaultValue={assignedSubjects[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            {assignedSubjects.map(subject => (
                                <TabsTrigger key={subject} value={subject}>{subject}</TabsTrigger>
                            ))}
                        </TabsList>
                        {assignedSubjects.map(subject => (
                            <TabsContent key={subject} value={subject} className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{subject} Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-muted-foreground">Detailed test marks and a progress graph for {subject} will be shown here.</p>
                                        <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground/50"/>
                                        </div>
                                         <Button asChild variant="outline">
                                            <Link href={`/student/tests?subject=${subject}`}>View All {subject} Tests</Link>
                                         </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                 ) : (
                     <p className="text-sm text-muted-foreground text-center py-8">You are not assigned to any subjects yet. Please contact your administrator.</p>
                 )}
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
                <Button asChild>
                    <Link href="/analytics">View My Analytics</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
