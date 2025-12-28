'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlayCircle, CheckCircle2, History, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';

interface TestForStudent {
    _id: string;
    title: string;
    subject: string;
    questionCount: number;
    durationMin: number;
    isPublished: boolean;
    createdAt: string;
}

interface TestAttempt {
    id: string;
    testId: string; // The original test ID
    name: string;   // The name of the test at the time of attempt
    date: string;
    overallScorePercentage: number;
}

export default function StudentTestsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    
    const [allTests, setAllTests] = useState<TestForStudent[]>([]);
    const [completedAttempts, setCompletedAttempts] = useState<TestAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const subjectFilter = searchParams.get('subject');

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!user || !user.isInstitutionalStudent) return;
            setIsLoading(true);
            try {
                // In a real app, this would be an API call
                // const testsResponse = await fetch('/api/student/tests');
                // const testsData = await testsResponse.json();

                // Mock fetching tests from a teacher's storage for now
                 const allTeachersRaw = localStorage.getItem(`teachers_${user.institutionId}`);
                 const allTeachers = allTeachersRaw ? JSON.parse(allTeachersRaw) : [];
                 let teacherCreatedTests: TestForStudent[] = [];
                 allTeachers.forEach((teacher: any) => {
                     const teacherTestsRaw = localStorage.getItem(`tests_teacher_${teacher.email}`);
                     if(teacherTestsRaw) {
                         teacherCreatedTests.push(...JSON.parse(teacherTestsRaw));
                     }
                 });

                // And completed tests from the student's history
                const attemptsRaw = localStorage.getItem('prepwiseTestHistory');
                const attempts: TestAttempt[] = attemptsRaw ? JSON.parse(attemptsRaw) : [];
                const studentAttempts = attempts.filter((att: any) => att.userId === user.email);
                
                const completedTestIds = new Set(studentAttempts.map(att => att.testId));
                
                let testsToShow = teacherCreatedTests.filter(t => t.isPublished);

                 if (subjectFilter) {
                    testsToShow = testsToShow.filter(t => t.subject === subjectFilter);
                 }

                setAllTests(testsToShow);
                setCompletedAttempts(studentAttempts);
            } catch (e) {
                toast({ title: 'Error', description: 'Could not load tests.', variant: 'destructive'});
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, [user, toast, subjectFilter]);
    
    const testsToTake = allTests.filter(test => !completedAttempts.some(att => att.testId === test._id));
    const testsCompleted = completedAttempts;


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" /> My Tests
                </h1>
            </div>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Tests to Take</CardTitle>
                    <CardDescription>These tests have been assigned by your teachers and are ready for you to attempt.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                            ) : testsToTake.length > 0 ? (
                                testsToTake.map(test => (
                                    <TableRow key={test._id}>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{test.subject}</TableCell>
                                        <TableCell>{test.questionCount}</TableCell>
                                        <TableCell>{test.durationMin} min</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm">
                                                {/* In a real app, the test ID would be the actual one from DB */}
                                                <Link href={`/test/inst-test-${test._id}?questionCount=${test.questionCount}&totalDuration=${test.durationMin * 60}&testName=${encodeURIComponent(test.title)}`}>
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Start Test
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No pending tests found.</TableCell></TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Completed Tests</CardTitle>
                    <CardDescription>Review your past performance on completed tests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Name</TableHead>
                                <TableHead>Date Completed</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                            ) : testsCompleted.length > 0 ? (
                                testsCompleted.map(attempt => (
                                    <TableRow key={attempt.id}>
                                        <TableCell className="font-medium">{attempt.name}</TableCell>
                                        <TableCell>{new Date(attempt.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                             <Badge variant={attempt.overallScorePercentage >= 80 ? 'default' : attempt.overallScorePercentage >= 50 ? 'secondary' : 'destructive'}>
                                                {attempt.overallScorePercentage.toFixed(1)}%
                                             </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/test/${attempt.id}/review`}>
                                                    <History className="mr-2 h-4 w-4" /> Review
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">You haven't completed any tests yet.</TableCell></TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>

        </div>
    );
}
