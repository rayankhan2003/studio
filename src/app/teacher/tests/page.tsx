
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, BookOpen, MoreHorizontal, Eye, Trash2, Edit, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Mock Test interface
interface TeacherTest {
    _id: string;
    title: string;
    section: { _id: string; name: string };
    subject: string;
    createdAt: string;
    isPublished: boolean;
    questionCount: number;
}

export default function ManageTestsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tests, setTests] = useState<TeacherTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     const fetchTests = async () => {
        if (!user) return;
        // This is where you would make an API call in a real app
        // For now, we'll use mock data from localStorage
        try {
            const storedTests = localStorage.getItem(`tests_teacher_${user.email}`); // Assuming tests are stored per teacher
            if (storedTests) {
                setTests(JSON.parse(storedTests));
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Could not load tests.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, [user]);

    const handleDeleteTest = (testId: string) => {
        // Mock deletion
        const updatedTests = tests.filter(t => t._id !== testId);
        localStorage.setItem(`tests_teacher_${user?.email}`, JSON.stringify(updatedTests));
        setTests(updatedTests);
        toast({ title: 'Success', description: 'Test deleted successfully.'});
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" /> Create & Manage Tests
                </h1>
                <Button asChild>
                    <Link href="/teacher/tests/create">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Test
                    </Link>
                </Button>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Your Tests</CardTitle>
                    <CardDescription>View, edit, or check results for the tests you have created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Class/Section</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading tests...</TableCell></TableRow>
                            ) : tests.length > 0 ? (
                                tests.map(test => (
                                    <TableRow key={test._id}>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>{test.section?.name || 'N/A'}</TableCell>
                                        <TableCell>{test.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={test.isPublished ? 'default' : 'secondary'}>
                                                {test.isPublished ? <CheckCircle className="mr-1 h-3 w-3"/> : <Clock className="mr-1 h-3 w-3"/>}
                                                {test.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4"/>View Results</DropdownMenuItem>
                                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Edit Test</DropdownMenuItem>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4"/>Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the test "{test.title}".</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteTest(test._id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No tests created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
