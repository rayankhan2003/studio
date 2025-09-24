
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ManageTestsPage() {

    // Mock data - in a real app, this would be fetched from an API
    const [tests, setTests] = useState([
        { id: '1', title: 'Biology Chapter 1 Quiz', section: '1st Year - Pre-Medical (A)', date: '2024-07-28', status: 'Published' },
        { id: '2', title: 'Physics Mid-Term', section: '1st Year - Pre-Engineering (B)', date: '2024-07-25', status: 'Draft' },
    ]);

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
                    <CardTitle>Existing Tests</CardTitle>
                    <CardDescription>View, edit, or check results for the tests you have created.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">Test listing will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
