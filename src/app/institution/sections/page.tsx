
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Building, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { allSubjects as allMdcatSubjects } from '@/lib/syllabus';
import { allCambridgeSubjects } from '@/lib/cambridge-syllabus';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Teacher {
  _id: string;
  name: string;
}

interface Section {
    _id: string;
    name: string;
    subjects: string[];
    teachers: string[]; // Store teacher IDs
    createdAt: string;
}

const initialSectionState: Omit<Section, '_id' | 'createdAt'> = {
    name: '',
    subjects: [],
    teachers: [],
};

const allAvailableSubjects = [...new Set([...allMdcatSubjects, ...allCambridgeSubjects])].map(subject => ({
    value: subject.toLowerCase(),
    label: subject,
}));

export default function ManageSectionsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState(initialSectionState);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isSubjectPopoverOpen, setIsSubjectPopoverOpen] = useState(false);
    const [isTeacherPopoverOpen, setIsTeacherPopoverOpen] = useState(false);


    const fetchData = useCallback(async () => {
        if (!user || !user.institutionId) return;
        setIsLoading(true);
        try {
            // MOCK: Fetch sections and teachers for the institution
            const storedSections = localStorage.getItem(`sections_${user.institutionId}`);
            setSections(storedSections ? JSON.parse(storedSections) : []);
            
            const storedTeachers = localStorage.getItem(`teachers_${user.email}`); // assuming teachers are stored under admin's email for now
            setTeachers(storedTeachers ? JSON.parse(storedTeachers) : []);

        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveSection = () => {
        if (!formData.name) {
            toast({ title: 'Error', description: 'Section Name is required.', variant: 'destructive' });
            return;
        }

        let updatedSections;
        if (editingSection) {
            updatedSections = sections.map(s =>
                s._id === editingSection._id ? { ...s, ...formData } : s
            );
            toast({ title: 'Success', description: 'Section details updated.' });
        } else {
            const newSection: Section = {
                _id: `section-${Date.now()}`,
                ...formData,
                createdAt: new Date().toISOString(),
            };
            updatedSections = [...sections, newSection];
            toast({ title: 'Success', description: 'New section created.' });
        }
        
        localStorage.setItem(`sections_${user?.institutionId}`, JSON.stringify(updatedSections));
        setSections(updatedSections);
        setIsDialogOpen(false);
        setEditingSection(null);
    };

    const openEditDialog = (section: Section) => {
        setEditingSection(section);
        setFormData(section);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingSection(null);
        setFormData(initialSectionState);
        setIsDialogOpen(true);
    };

    const handleDeleteSection = (sectionId: string) => {
        const updatedSections = sections.filter(s => s._id !== sectionId);
        localStorage.setItem(`sections_${user?.institutionId}`, JSON.stringify(updatedSections));
        setSections(updatedSections);
        toast({ title: 'Section Removed', description: 'The section has been removed.' });
    };

    const handleMultiSelect = (type: 'subjects' | 'teachers', value: string) => {
        setFormData(prev => {
            const currentValues = new Set(prev[type] as string[]);
            if (type === 'subjects') {
                const subjectLabel = allAvailableSubjects.find(s => s.value === value)?.label;
                if (!subjectLabel) return prev;
                if (currentValues.has(subjectLabel)) {
                    currentValues.delete(subjectLabel);
                } else {
                    currentValues.add(subjectLabel);
                }
            } else { // teachers
                 if (currentValues.has(value)) { // teacher value is the ID
                    currentValues.delete(value);
                } else {
                    currentValues.add(value);
                }
            }
            return { ...prev, [type]: Array.from(currentValues) };
        });
    }

    const getTeacherNameById = (id: string) => teachers.find(t => t._id === id)?.name || 'Unknown Teacher';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building className="h-8 w-8 text-primary" /> Manage Sections
                </h1>
            </div>
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demonstration Mode</AlertTitle>
                <AlertDescription>
                   This page is for demonstration purposes. All data is stored in your browser's local storage.
                </AlertDescription>
            </Alert>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Class Sections</CardTitle>
                            <CardDescription>Create and manage classes like "1st Year - Section A" or "Pre-Med Group".</CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Section
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section Name</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Assigned Teachers</TableHead>
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
                                        <TableCell className="max-w-[200px]">
                                          <div className="flex flex-wrap gap-1">
                                            {section.subjects?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                                          </div>
                                        </TableCell>
                                         <TableCell className="max-w-[200px]">
                                          <div className="flex flex-wrap gap-1">
                                            {section.teachers?.map(tId => <Badge key={tId} variant="outline">{getTeacherNameById(tId)}</Badge>)}
                                          </div>
                                        </TableCell>
                                        <TableCell>{new Date(section.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(section)}>
                                                        <Edit className="mr-2 h-4 w-4"/>Edit
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4"/>Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently remove the section "{section.name}". It cannot be undone.
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No sections created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setEditingSection(null); setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSection ? 'Edit Section' : 'Create New Section'}</DialogTitle>
                        <DialogDescription>{editingSection ? `Update details for ${editingSection.name}.` : 'Fill in the details for the new class section.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Section Name</Label>
                            <Input id="name" placeholder='e.g., "1st Year - Pre-Med Section A"' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <Label>Subjects</Label>
                            <Popover open={isSubjectPopoverOpen} onOpenChange={setIsSubjectPopoverOpen}>
                                <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={isSubjectPopoverOpen} className="w-full justify-between h-auto min-h-10">
                                    <span className="truncate flex flex-wrap gap-1">
                                        {formData.subjects.length > 0 ? formData.subjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>) : 'Select subjects...'}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search subjects..." />
                                    <CommandEmpty>No subject found.</CommandEmpty>
                                    <CommandGroup>
                                    {allAvailableSubjects.map((subject) => (
                                        <CommandItem
                                        key={subject.value}
                                        onSelect={() => handleMultiSelect('subjects', subject.value)}
                                        >
                                        <Check className={cn("mr-2 h-4 w-4", formData.subjects.includes(subject.label) ? "opacity-100" : "opacity-0")} />
                                        {subject.label}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div>
                            <Label>Assign Teachers</Label>
                            <Popover open={isTeacherPopoverOpen} onOpenChange={setIsTeacherPopoverOpen}>
                                <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={isTeacherPopoverOpen} className="w-full justify-between h-auto min-h-10">
                                    <span className="truncate flex flex-wrap gap-1">
                                        {formData.teachers.length > 0 ? formData.teachers.map(tId => <Badge key={tId} variant="outline">{getTeacherNameById(tId)}</Badge>) : 'Select teachers...'}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search teachers..." />
                                    <CommandEmpty>No teachers found. Add them in the "Manage Teachers" tab first.</CommandEmpty>
                                    <CommandGroup>
                                    {teachers.map((teacher) => (
                                        <CommandItem
                                        key={teacher._id}
                                        onSelect={() => handleMultiSelect('teachers', teacher._id)}
                                        >
                                        <Check className={cn("mr-2 h-4 w-4", formData.teachers.includes(teacher._id) ? "opacity-100" : "opacity-0")} />
                                        {teacher.name}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSection}>{editingSection ? 'Save Changes' : 'Create Section'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
