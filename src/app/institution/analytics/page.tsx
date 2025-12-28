
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Building, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';


interface Section {
    _id: string;
    name: string;
}

export default function InstitutionAnalyticsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        if (user?.institutionId) {
            try {
                const storedSections = localStorage.getItem(`sections_${user.institutionId}`);
                const parsedSections = storedSections ? JSON.parse(storedSections) : [];
                setSections(parsedSections);

                const tabQuery = searchParams.get('tab');
                if (tabQuery && parsedSections.some((s: Section) => s._id === tabQuery)) {
                    setActiveTab(tabQuery);
                } else if (parsedSections.length > 0) {
                    setActiveTab(parsedSections[0]._id);
                }

            } catch (error) {
                toast({ title: 'Error', description: 'Failed to load class data.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, toast, searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/institution/analytics?tab=${value}`);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Building className="h-8 w-8 text-primary"/>
                Institutional Analytics
            </h1>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Data Source Notice</AlertTitle>
                <AlertDescription>
                   Analytics are generated from student test attempts stored in your browser's local storage. This is for demonstration purposes only.
                </AlertDescription>
            </Alert>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : sections.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Class Performance</CardTitle>
                        <CardDescription>Select a class to view detailed performance analytics for its students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-auto">
                                {sections.map(section => (
                                    <TabsTrigger key={section._id} value={section._id} asChild>
                                        <Link href={`/institution/analytics/${section._id}`} scroll={false}>{section.name}</Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Classes Found</CardTitle>
                        <CardDescription>You haven't created any classes yet. Create a class to start seeing analytics.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button asChild>
                            <Link href="/institution/sections">Go to Manage Classes</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
