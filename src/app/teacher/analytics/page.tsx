
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Section {
    _id: string;
    name: string;
    subjectTeacherAssignments: Record<string, string>; // { [subject]: teacherId }
}

export default function TeacherAnalyticsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const [assignedSections, setAssignedSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.isTeacher && user.institutionId && user.email) {
            try {
                // Fetch the current teacher's full data to get their ID
                const allTeachersRaw = localStorage.getItem(`teachers_${user.institutionId}`);
                const allTeachers = allTeachersRaw ? JSON.parse(allTeachersRaw) : [];
                const currentTeacher = allTeachers.find((t: any) => t.email.toLowerCase() === user.email!.toLowerCase());

                if (currentTeacher) {
                    const storedSectionsRaw = localStorage.getItem(`sections_${user.institutionId}`);
                    const allSections: Section[] = storedSectionsRaw ? JSON.parse(storedSectionsRaw) : [];

                    // Filter sections where this teacher is assigned to at least one subject
                    const teachersSections = allSections.filter(section => 
                        Object.values(section.subjectTeacherAssignments).includes(currentTeacher._id)
                    );
                    setAssignedSections(teachersSections);
                } else {
                    toast({ title: 'Error', description: 'Could not find your teacher profile.', variant: 'destructive'});
                }
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to load your assigned class data.', variant: 'destructive' });
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, toast]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8 text-primary"/>
                Student Analytics
            </h1>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Data Source Notice</AlertTitle>
                <AlertDescription>
                   Analytics are generated from student test attempts stored in your browser's local storage. This is for demonstration purposes only.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Assigned Classes</CardTitle>
                    <CardDescription>Select a class to view detailed performance analytics for its students.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : assignedSections.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignedSections.map(section => (
                                <Button asChild key={section._id} variant="outline" className="h-16 text-lg justify-start p-4">
                                    <Link href={`/teacher/analytics/${section._id}`} scroll={false}>
                                        <Users className="mr-3 h-5 w-5"/>
                                        {section.name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                             <p className="text-muted-foreground">You are not assigned to any classes yet.</p>
                             <p className="text-xs text-muted-foreground mt-2">Please contact your institutional administrator to be assigned to a class.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
