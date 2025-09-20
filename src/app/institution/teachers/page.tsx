
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Users, AlertTriangle, Check, ChevronsUpDown, Download, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { allSubjects as allMdcatSubjects } from '@/lib/syllabus';
import { allCambridgeSubjects } from '@/lib/cambridge-syllabus';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  loginId: string;
  password?: string;
  subjects: string[];
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const initialTeacherState: Omit<Teacher, '_id' | 'createdAt' | 'status' | 'loginId'> = {
    name: '',
    email: '',
    password: '',
    subjects: [],
};

const allAvailableSubjects = [...new Set([...allMdcatSubjects, ...allCambridgeSubjects])].map(subject => ({
    value: subject.toLowerCase(),
    label: subject,
}));

const generateLoginId = (fullName: string, institutionName: string) => {
    const namePart = fullName
      .toLowerCase()
      .replace(/^(mr|mrs|ms|dr)\.?\s*/, '') // Remove titles
      .split(' ')[0] // Take the first part of the name
      .replace(/[^a-z0-9]/g, ''); // Sanitize
    
    const instPart = institutionName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return `${namePart}@${instPart}.pk`;
};

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};


export default function ManageTeachersPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState(initialTeacherState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubjectPopoverOpen, setIsSubjectPopoverOpen] = useState(false);

    const fetchTeachers = useCallback(async () => {
        if (!user || !user.institutionId) return;
        setIsLoading(true);
        try {
            const storedTeachers = localStorage.getItem(`teachers_${user.institutionId}`);
            setTeachers(storedTeachers ? JSON.parse(storedTeachers) : []);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch teachers.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const handleSaveTeacher = () => {
        if (!formData.name || !formData.email || (!formData.password && !editingTeacher)) {
            toast({ title: 'Error', description: 'Name, Email, and Password are required for new teachers.', variant: 'destructive' });
            return;
        }
        if (!user?.institutionId || !user.institutionName) {
            toast({ title: 'Error', description: 'Institution context is missing.', variant: 'destructive' });
            return;
        }

        const currentTeachersRaw = localStorage.getItem(`teachers_${user?.institutionId}`);
        const currentTeachers: Teacher[] = currentTeachersRaw ? JSON.parse(currentTeachersRaw) : [];
        
        const isEmailDuplicate = currentTeachers.some(t => t.email.toLowerCase() === formData.email.toLowerCase() && t._id !== editingTeacher?._id);
        if(isEmailDuplicate) {
            toast({ title: 'Error', description: 'This email is already in use by another teacher.', variant: 'destructive' });
            return;
        }

        let updatedTeachers;

        if (editingTeacher) {
            updatedTeachers = currentTeachers.map(t =>
                t._id === editingTeacher._id ? { 
                    ...t, 
                    name: formData.name,
                    email: formData.email,
                    subjects: formData.subjects,
                    password: formData.password || t.password,
                    // Login ID should not change on edit
                } : t
            );
            toast({ title: 'Success', description: 'Teacher details updated.' });
        } else {
             const newLoginId = generateLoginId(formData.name, user.institutionName);
             if (currentTeachers.some(t => t.loginId === newLoginId)) {
                toast({ title: 'Error', description: 'A teacher with a similar name already exists, resulting in a duplicate Login ID. Please adjust the name slightly.', variant: 'destructive' });
                return;
             }

            const newTeacher: Teacher = {
                _id: `teacher-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                password: formData.password || generatePassword(),
                subjects: formData.subjects,
                loginId: newLoginId,
                status: 'Active',
                createdAt: new Date().toISOString(),
            };
            updatedTeachers = [...currentTeachers, newTeacher];
            toast({ title: 'Success', description: 'New teacher added.' });
        }
        
        localStorage.setItem(`teachers_${user.institutionId}`, JSON.stringify(updatedTeachers));
        setTeachers(updatedTeachers);
        
        setIsDialogOpen(false);
        setEditingTeacher(null);
        setFormData(initialTeacherState);
    };
    
    const handleStatusToggle = (teacher: Teacher) => {
        const newStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
        const updatedTeachers = teachers.map(t => t._id === teacher._id ? { ...t, status: newStatus } : t);
        if (user?.institutionId) {
            localStorage.setItem(`teachers_${user.institutionId}`, JSON.stringify(updatedTeachers));
        }
        setTeachers(updatedTeachers);
        toast({ title: 'Status Updated', description: `${teacher.name}'s account is now ${newStatus}.` });
    };

    const openEditDialog = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({ name: teacher.name, email: teacher.email, subjects: teacher.subjects, password: '' });
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingTeacher(null);
        setFormData(initialTeacherState);
        setIsDialogOpen(true);
    };

    const handleDeleteTeacher = (teacherId: string) => {
        const updatedTeachers = teachers.filter(t => t._id !== teacherId);
        if (user?.institutionId) {
            localStorage.setItem(`teachers_${user.institutionId}`, JSON.stringify(updatedTeachers));
        }
        setTeachers(updatedTeachers);
        toast({ title: 'Teacher Removed', description: 'The teacher has been removed from your institution.' });
    };
    
    const handleSubjectSelect = (subjectValue: string) => {
        setFormData(prev => {
            const subjects = new Set(prev.subjects);
            const subjectLabel = allAvailableSubjects.find(s => s.value === subjectValue)?.label;
            if (!subjectLabel) return prev;

            if (subjects.has(subjectLabel)) {
                subjects.delete(subjectLabel);
            } else {
                subjects.add(subjectLabel);
            }
            return { ...prev, subjects: Array.from(subjects) };
        });
    }
    
    const exportData = (format: 'pdf' | 'excel') => {
        const dataToExport = teachers.map(t => ({
            'Teacher Name': t.name,
            'Subject(s)': t.subjects.join(', '),
            'Email': t.email,
            'Login ID': t.loginId,
            'Password': t.password,
            'Status': t.status,
        }));

        if (format === 'excel') {
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Teachers");
            xlsx.writeFile(workbook, `teacher_roster_${user?.institutionName?.replace(/ /g, '_')}.xlsx`);
        } else { // PDF
            const doc = new jsPDF();
            doc.text(`Teacher Roster - ${user?.institutionName}`, 14, 15);
            (doc as any).autoTable({
                head: [['Teacher Name', 'Subject(s)', 'Email', 'Login ID', 'Password', 'Status']],
                body: dataToExport.map(Object.values),
                startY: 20
            });
            doc.save(`teacher_roster_${user?.institutionName?.replace(/ /g, '_')}.pdf`);
        }
        toast({ title: "Exported!", description: `Teacher roster exported as ${format.toUpperCase()}.` });
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-8 w-8 text-primary" /> Manage Teachers
                </h1>
            </div>
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demonstration Mode</AlertTitle>
                <AlertDescription>
                   This page is for demonstration. Passwords are shown for convenience but would be hashed and hidden in a real application.
                </AlertDescription>
            </Alert>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Teacher Roster</CardTitle>
                            <CardDescription>Add, view, and manage teacher accounts for your institution.</CardDescription>
                        </div>
                         <div className="flex gap-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export List</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => exportData('pdf')}><Printer className="mr-2 h-4 w-4"/>Export as PDF</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportData('excel')}><Download className="mr-2 h-4 w-4"/>Export as Excel</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={openCreateDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Login ID</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : teachers.length > 0 ? (
                                teachers.map(teacher => (
                                    <TableRow key={teacher._id}>
                                        <TableCell>
                                            <div className="font-medium">{teacher.name}</div>
                                            <div className="text-xs text-muted-foreground">{teacher.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                          <div className="flex flex-wrap gap-1">
                                            {teacher.subjects?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                                          </div>
                                        </TableCell>
                                         <TableCell className="font-mono text-xs">{teacher.loginId}</TableCell>
                                         <TableCell className="font-mono text-xs">{teacher.password}</TableCell>
                                         <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch 
                                                    id={`status-${teacher._id}`} 
                                                    checked={teacher.status === 'Active'}
                                                    onCheckedChange={() => handleStatusToggle(teacher)}
                                                />
                                                <Label htmlFor={`status-${teacher._id}`} className={cn(teacher.status === 'Active' ? 'text-green-600' : 'text-red-600')}>{teacher.status}</Label>
                                            </div>
                                         </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                                                        <Edit className="mr-2 h-4 w-4"/>Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4"/>Delete Teacher
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action will permanently remove the teacher account for {teacher.name}. It cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteTeacher(teacher._id)} className="bg-destructive hover:bg-destructive/90">
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
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No teachers found. Click "Add Teacher" to get started.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setEditingTeacher(null); setIsDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
                        <DialogDescription>{editingTeacher ? `Update details for ${editingTeacher.name}.` : 'Fill in the details for the new teacher account.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="text" placeholder={editingTeacher ? 'Leave blank to keep unchanged' : 'Auto-generated if left blank'} value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
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
                                    <CommandList>
                                        <CommandEmpty>No subject found.</CommandEmpty>
                                        <CommandGroup>
                                        {allAvailableSubjects.map((subject) => (
                                            <CommandItem
                                            key={subject.value}
                                            value={subject.value}
                                            onSelect={(currentValue) => handleSubjectSelect(currentValue)}
                                            >
                                            <Check className={cn("mr-2 h-4 w-4", formData.subjects.includes(subject.label) ? "opacity-100" : "opacity-0")} />
                                            {subject.label}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTeacher}>{editingTeacher ? 'Save Changes' : 'Add Teacher'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    