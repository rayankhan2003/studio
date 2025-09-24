
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ListChecks, ChevronDown, Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { allSubjects as allMdcatSubjects, syllabus as mdcatSyllabus } from '@/lib/syllabus';
import { allCambridgeSubjects, cambridgeSyllabus, CambridgeLevels } from '@/lib/cambridge-syllabus';
import { Input } from '@/components/ui/input';

interface Section {
    _id: string;
    name: string;
    className: string;
    stream: string;
    subjectTeacherAssignments: Record<string, string>; // Stored as { [subject]: teacherId }
}

interface Teacher {
    _id: string;
    name: string;
    email: string;
    subjects: string[];
}

export default function CreateTestPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [teacherData, setTeacherData] = useState<Teacher | null>(null);
    const [assignedSections, setAssignedSections] = useState<Section[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    
    const [chaptersForSubject, setChaptersForSubject] = useState<{name: string}[]>([]);
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
    const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set(['easy', 'medium', 'hard']));

    useEffect(() => {
        if (user && user.isTeacher && user.institutionId && user.email) {
            try {
                const allTeachersRaw = localStorage.getItem(`teachers_${user.institutionId}`);
                const allTeachers = allTeachersRaw ? JSON.parse(allTeachersRaw) : [];
                const currentTeacher = allTeachers.find((t: any) => t.email.toLowerCase() === user.email!.toLowerCase());
                
                if (currentTeacher) {
                    setTeacherData(currentTeacher);
                    const allSectionsRaw = localStorage.getItem(`sections_${user.institutionId}`);
                    const allSections: Section[] = allSectionsRaw ? JSON.parse(allSectionsRaw) : [];
                    
                    const teachersSections = allSections.filter(section => 
                        Object.values(section.subjectTeacherAssignments).includes(currentTeacher._id)
                    );
                    setAssignedSections(teachersSections);
                } else {
                    setAssignedSections([]);
                }
            } catch (error) {
                console.error("Failed to load teacher/section data:", error);
                toast({ title: 'Error', description: 'Could not load your assigned classes.', variant: 'destructive' });
            }
        }
    }, [user, toast]);

    const subjectsForSelectedSection = useMemo(() => {
        if (!selectedSectionId || !teacherData) return [];
        const section = assignedSections.find(s => s._id === selectedSectionId);
        if (!section) return [];

        return Object.entries(section.subjectTeacherAssignments)
            .filter(([_, teacherId]) => teacherId === teacherData._id)
            .map(([subject]) => subject);

    }, [selectedSectionId, assignedSections, teacherData]);
    
     useEffect(() => {
        if (selectedSubject) {
            const section = assignedSections.find(s => s._id === selectedSectionId);
            const curriculum = section?.stream === "Pre-Medical" || section?.stream === "Pre-Engineering" ? 'MDCAT' : 'O Level'; // Simplified logic
            
            let syllabus;
            if (curriculum === 'MDCAT') syllabus = mdcatSyllabus;
            else syllabus = cambridgeSyllabus['O Level']; // Defaulting to O-Level for simplicity

            const subjectSyllabus = (syllabus as any)[selectedSubject];
            setChaptersForSubject(subjectSyllabus || []);
        } else {
            setChaptersForSubject([]);
        }
        setSelectedChapters(new Set()); // Reset on subject change
    }, [selectedSubject, selectedSectionId, assignedSections]);


    const handleSelectAllChapters = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedChapters(new Set(chaptersForSubject.map(c => c.name)));
        } else {
            setSelectedChapters(new Set());
        }
    };
    
    const handleChapterSelect = (chapterName: string, checked: boolean) => {
        setSelectedChapters(prev => {
            const newSet = new Set(prev);
            if(checked) newSet.add(chapterName);
            else newSet.delete(chapterName);
            return newSet;
        });
    };

    const handleDifficultySelect = (difficulty: string, checked: boolean) => {
        setSelectedDifficulties(prev => {
            const newSet = new Set(prev);
            if(checked) newSet.add(difficulty);
            else newSet.delete(difficulty);
            return newSet;
        });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" /> Create a New Test
            </h1>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Step 1: Test Configuration</CardTitle>
                    <CardDescription>Select the class, subject, and chapters for your test.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="section" className="font-semibold">Class / Section</Label>
                            <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={assignedSections.length === 0}>
                                <SelectTrigger id="section">
                                    <SelectValue placeholder={assignedSections.length > 0 ? "Select a class..." : "No classes assigned"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignedSections.map(s => (
                                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="subject" className="font-semibold">Subject</Label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedSectionId}>
                                <SelectTrigger id="subject">
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectsForSelectedSection.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                        <div>
                            <Label htmlFor="test-title" className="font-semibold">Test Title</Label>
                            <Input id="test-title" placeholder="e.g. Physics Midterm" />
                        </div>
                         <div>
                            <Label htmlFor="num-questions" className="font-semibold">Number of Questions</Label>
                            <Input id="num-questions" type="number" placeholder="e.g. 20" />
                        </div>
                         <div>
                            <Label htmlFor="duration" className="font-semibold">Total Duration (Minutes)</Label>
                            <Input id="duration" type="number" placeholder="e.g. 30" />
                        </div>
                    </div>
                    
                    {selectedSubject && (
                        <div className="space-y-4 pt-4 border-t">
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><ListChecks/> Chapters from Question Bank</h3>
                               <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="select-all-chapters"
                                                    checked={selectedChapters.size > 0 && selectedChapters.size === chaptersForSubject.length ? true : selectedChapters.size > 0 ? 'indeterminate' : false}
                                                    onCheckedChange={handleSelectAllChapters}
                                                />
                                                <Label htmlFor="select-all-chapters" className="text-base">
                                                    Select Chapters ({selectedChapters.size} / {chaptersForSubject.length})
                                                </Label>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 pt-2">
                                             {chaptersForSubject.map(chapter => (
                                                <div key={chapter.name} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`ch-${chapter.name}`}
                                                        checked={selectedChapters.has(chapter.name)}
                                                        onCheckedChange={(checked) => handleChapterSelect(chapter.name, !!checked)}
                                                    />
                                                    <Label htmlFor={`ch-${chapter.name}`} className="font-normal">{chapter.name}</Label>
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                             <div>
                                <h3 className="font-semibold mb-2">Difficulty</h3>
                                <div className="flex flex-wrap gap-4">
                                    {['easy', 'medium', 'hard'].map(level => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`diff-${level}`}
                                                checked={selectedDifficulties.has(level)}
                                                onCheckedChange={(checked) => handleDifficultySelect(level, !!checked)}
                                            />
                                            <Label htmlFor={`diff-${level}`} className="font-normal capitalize">{level}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                    <Button disabled={!selectedSectionId || !selectedSubject || selectedChapters.size === 0}>
                        Preview Test
                    </Button>
                </CardFooter>
            </Card>

        </div>
    );
}
