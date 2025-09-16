
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Users, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  password?: string;
  subjects?: string[];
  createdAt: string;
}

const initialTeacherState: Omit<Teacher, '_id' | 'createdAt'> = {
    name: '',
    email: '',
    password: '',
    subjects: [],
};

export default function ManageTeachersPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState(initialTeacherState);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTeachers = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // MOCK: This would be a fetch call in a real app
            // const response = await fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${user.token}` }});
            // const data = await response.json();
            const storedTeachers = localStorage.getItem(`teachers_${user.email}`);
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
        // MOCK: In a real app, this would be a POST or PUT request to the backend
        if (!formData.name || !formData.email || (!formData.password && !editingTeacher)) {
            toast({ title: 'Error', description: 'Name, Email, and Password are required.', variant: 'destructive' });
            return;
        }

        let updatedTeachers;
        if (editingTeacher) {
            updatedTeachers = teachers.map(t =>
                t._id === editingTeacher._id ? { ...t, name: formData.name, email: formData.email, password: formData.password || t.password } : t
            );
            toast({ title: 'Success', description: 'Teacher details updated.' });
        } else {
            const newTeacher: Teacher = {
                _id: `teacher-${Date.now()}`,
                ...formData,
                password: formData.password!,
                createdAt: new Date().toISOString(),
            };
            updatedTeachers = [...teachers, newTeacher];
            toast({ title: 'Success', description: 'New teacher added.' });
        }
        
        localStorage.setItem(`teachers_${user?.email}`, JSON.stringify(updatedTeachers));
        setTeachers(updatedTeachers);
        setIsDialogOpen(false);
        setEditingTeacher(null);
    };

    const openEditDialog = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({ ...teacher, password: '' });
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingTeacher(null);
        setFormData(initialTeacherState);
        setIsDialogOpen(true);
    };

    const handleDeleteTeacher = (teacherId: string) => {
        // MOCK: In a real app, this would be a DELETE request
        const updatedTeachers = teachers.filter(t => t._id !== teacherId);
        localStorage.setItem(`teachers_${user?.email}`, JSON.stringify(updatedTeachers));
        setTeachers(updatedTeachers);
        toast({ title: 'Teacher Removed', description: 'The teacher has been removed from your institution.' });
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
                   This page is for demonstration purposes. All data is stored in your browser's local storage and is <strong>not secure</strong>. A full implementation would use a secure backend database.
                </AlertDescription>
            </Alert>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Teacher Roster</CardTitle>
                            <CardDescription>Add, view, and manage teacher accounts for your institution.</CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : teachers.length > 0 ? (
                                teachers.map(teacher => (
                                    <TableRow key={teacher._id}>
                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
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
                                <TableRow><TableCell colSpan={4} className="text-center h-24">No teachers found. Click "Add Teacher" to get started.</TableCell></TableRow>
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
                            <Input id="password" type="password" placeholder={editingTeacher ? 'Leave blank to keep unchanged' : '••••••••'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
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

    