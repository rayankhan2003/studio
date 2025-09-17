
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Building, AlertTriangle, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface Teacher {
  _id: string;
  name: string;
}

interface Section {
    _id: string;
    name: string;
    className: string;
    stream: Stream;
    section: string;
    subjectTeacherAssignments: Record<string, { teacherId: string; teacherName: string }>;
    studentCount: number;
    createdAt: string;
}

const streams = ["Pre-Medical", "Pre-Engineering", "Computer Science", "Arts"] as const;
type Stream = typeof streams[number];

const subjectsByStream: Record<Stream, string[]> = {
    "Pre-Medical": ["Biology", "Chemistry", "Physics", "English"],
    "Pre-Engineering": ["Mathematics", "Chemistry", "Physics", "English"],
    "Computer Science": ["Computer Science", "Mathematics", "Physics", "English"],
    "Arts": ["English", "Urdu", "History", "Geography"],
};

const initialSectionState: Omit<Section, '_id' | 'createdAt' | 'name' | 'studentCount' | 'subjectTeacherAssignments'> & { subjectTeacherAssignments: Record<string, string> } = {
    className: '',
    stream: 'Pre-Medical',
    section: '',
    subjectTeacherAssignments: {},
};


export default function ManageSectionsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState(initialSectionState);
    const [isLoading, setIsLoading] = useState(true);

    const getStudentCount = (institutionId: string, sectionId: string): number => {
        const storedStudentsRaw = localStorage.getItem(`students_${institutionId}`);
        if (!storedStudentsRaw) return 0;
        const allStudents = JSON.parse(storedStudentsRaw);
        return allStudents.filter((s: any) => s.sectionId === sectionId).length;
    };
    
    const populateSectionDetails = useCallback((sectionsData: any[], teachers: Teacher[], institutionId: string) => {
        const teacherMap = new Map(teachers.map(t => [t._id, t.name]));
        return sectionsData.map((s: any) => {
            const assignments: Section['subjectTeacherAssignments'] = {};
            if (s.subjectTeacherAssignments) {
                for (const [subject, teacherId] of Object.entries(s.subjectTeacherAssignments)) {
                    assignments[subject] = {
                        teacherId: teacherId as string,
                        teacherName: teacherMap.get(teacherId as string) || 'Unknown'
                    };
                }
            }
            return { 
                ...s, 
                subjectTeacherAssignments: assignments,
                studentCount: getStudentCount(institutionId, s._id),
            };
        });
    }, []);

    useEffect(() => {
        if (!user || !user.institutionId) return;
        
        setIsLoading(true);
        try {
            const storedTeachersRaw = localStorage.getItem(`teachers_${user.institutionId}`);
            const storedTeachers = storedTeachersRaw ? JSON.parse(storedTeachersRaw) : [];
            setAvailableTeachers(storedTeachers);

            const storedSectionsRaw = localStorage.getItem(`sections_${user.institutionId}`);
            const storedSections = storedSectionsRaw ? JSON.parse(storedSectionsRaw) : [];

            const populatedSections = populateSectionDetails(storedSections, storedTeachers, user.institutionId);
            setSections(populatedSections);
        } catch (error) {
             toast({ title: 'Error', description: 'Failed to fetch data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast, populateSectionDetails]);


    const handleSaveSection = () => {
        if (!formData.className || !formData.stream || !formData.section) {
            toast({ title: 'Error', description: 'Class Name, Stream, and Section are required.', variant: 'destructive' });
            return;
        }
        if (!user?.institutionId) return;

        const currentSectionsRaw = localStorage.getItem(`sections_${user?.institutionId}`);
        const currentSections: Section[] = currentSectionsRaw ? JSON.parse(currentSectionsRaw) : [];
        let updatedSections;
        
        const payload = { ...formData };

        if (editingSection) {
            updatedSections = currentSections.map(s => s._id === editingSection._id ? { 
                ...s, 
                ...payload,
                name: `${payload.className} - ${payload.stream} (Section ${payload.section})`
            } : s);
            toast({ title: 'Success', description: 'Section details updated.' });
        } else {
            const newSectionData = {
                _id: `section-${Date.now()}`,
                ...payload,
                name: `${payload.className} - ${payload.stream} (Section ${payload.section})`,
                createdAt: new Date().toISOString(),
            };
            updatedSections = [...currentSections, newSectionData];
            toast({ title: 'Success', description: 'New section created.' });
        }
        
        localStorage.setItem(`sections_${user.institutionId}`, JSON.stringify(updatedSections));

        const populatedUpdatedSections = populateSectionDetails(updatedSections, availableTeachers, user.institutionId);
        setSections(populatedUpdatedSections);

        setIsDialogOpen(false);
        setEditingSection(null);
    };

    const openEditDialog = (section: Section) => {
        setEditingSection(section);
        const editFormData = {
            className: section.className,
            stream: section.stream,
            section: section.section,
            subjectTeacherAssignments: Object.entries(section.subjectTeacherAssignments).reduce((acc, [subject, assignment]) => {
                acc[subject] = (assignment as any).teacherId || assignment;
                return acc;
            }, {} as Record<string, string>),
        };
        setFormData(editFormData);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingSection(null);
        setFormData(initialSectionState);
        setIsDialogOpen(true);
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!user?.institutionId) return;
        const updatedSections = sections.filter(s => s._id !== sectionId);
        localStorage.setItem(`sections_${user.institutionId}`, JSON.stringify(updatedSections));
        
        // Also remove associated students
        const studentsRaw = localStorage.getItem(`students_${user.institutionId}`);
        if(studentsRaw){
            const allStudents = JSON.parse(studentsRaw);
            const remainingStudents = allStudents.filter((s:any) => s.sectionId !== sectionId);
            localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(remainingStudents));
        }

        setSections(updatedSections);
        toast({ title: 'Section Removed', description: 'The section and all its students have been removed.' });
    };

    const handleSubjectTeacherChange = (subject: string, teacherId: string) => {
        setFormData(prev => ({
            ...prev,
            subjectTeacherAssignments: {
                ...prev.subjectTeacherAssignments,
                [subject]: teacherId
            }
        }));
    };
    
    const subjectsForStream = useMemo(() => subjectsByStream[formData.stream] || [], [formData.stream]);


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building className="h-8 w-8 text-primary" /> Manage Classes & Students
                </h1>
            </div>
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demonstration Mode</AlertTitle>
                <AlertDescription>
                   This page uses your browser's local storage to simulate a database.
                </AlertDescription>
            </Alert>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Class List</CardTitle>
                            <CardDescription>Create classes and manage their student rosters.</CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Class
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Teachers Assigned</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : sections.length > 0 ? (
                                sections.map(section => (
                                    <TableRow key={section._id}>
                                        <TableCell className="font-medium">{section.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">{section.studentCount} student(s)</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(section.subjectTeacherAssignments)?.map(([subject, assignment]) => (
                                                <Badge key={subject} variant="outline" className="text-xs">
                                                    {subject}: {assignment.teacherName}
                                                </Badge>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell>{new Date(section.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                 <Button asChild size="sm">
                                                    <Link href={`/institution/sections/${section._id}/students`}>
                                                        <Users className="mr-2 h-4 w-4"/> Manage Students
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(section)}>
                                                            <Edit className="mr-2 h-4 w-4"/>Edit Class Details
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4"/>Delete Class
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently remove the class "{section.name}" and all its associated students. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteSection(section._id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No classes created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setEditingSection(null); setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingSection ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                        <DialogDescription>{editingSection ? `Update details for ${editingSection.name}.` : 'Fill in the details for the new class.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                                <Label htmlFor="className">Class Name</Label>
                                <Input id="className" placeholder='e.g., "1st Year" or "A Level Year 1"' value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="stream">Stream</Label>
                                <Select value={formData.stream} onValueChange={(value: Stream) => setFormData({ ...formData, stream: value, subjectTeacherAssignments: {} })}>
                                    <SelectTrigger id="stream"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {streams.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="section">Section</Label>
                            <Input id="section" placeholder='e.g., "A", "B", "Blue", "Green"' value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
                        </div>
                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-semibold mb-2">Assign Teachers to Subjects</h3>
                            <p className="text-sm text-muted-foreground mb-4">Select a teacher for each subject in the selected stream.</p>
                            <div className="space-y-4">
                                {subjectsForStream.map(subject => (
                                    <div key={subject} className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor={`teacher-${subject}`} className="col-span-1">{subject}</Label>
                                        <div className="col-span-2">
                                            <Select
                                                value={(formData.subjectTeacherAssignments as any)[subject] || ''}
                                                onValueChange={(teacherId) => handleSubjectTeacherChange(subject, teacherId)}
                                            >
                                                <SelectTrigger id={`teacher-${subject}`}><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                                                <SelectContent>
                                                    {availableTeachers.map(teacher => (
                                                        <SelectItem key={teacher._id} value={teacher._id}>{teacher.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                                {subjectsForStream.length === 0 && <p className="text-muted-foreground text-sm">No subjects defined for this stream.</p>}
                            </div>
                        </div>
                    </div>
                     <DialogFooter className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mr-auto">
                            Full Name: <span className="font-semibold">{formData.className || '[ClassName]'} - {formData.stream} (Section {formData.section || '[Section]'})</span>
                        </p>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSection}>{editingSection ? 'Save Changes' : 'Create Class'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
