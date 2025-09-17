
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, MoreHorizontal, Users, AlertTriangle, Download, Upload, Eye, Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as xlsx from 'xlsx';

interface Section {
    _id: string;
    name: string; // e.g., "1st Year - Pre-Medical (Section A)"
}

interface Student {
    _id: string;
    fullName: string;
    email: string;
    sectionId: string;
    gender: 'Male' | 'Female' | 'Other' | '';
    username: string;
    password?: string;
    createdAt: string;
}

interface StudentFormData {
    fullName: string;
    email: string;
    sectionId: string;
    gender: 'Male' | 'Female' | 'Other' | '';
}

const initialStudentState: StudentFormData = {
    fullName: '',
    email: '',
    sectionId: '',
    gender: '',
};

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateUsername = (fullName: string, institutionName: string) => {
    const namePart = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
    const instPart = institutionName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    return `${namePart}_${instPart}`;
};


export default function ManageStudentsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<StudentFormData>(initialStudentState);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sectionMap = useMemo(() => new Map(sections.map(s => [s._id, s.name])), [sections]);

    const fetchData = useCallback(() => {
        if (!user || !user.institutionId) return;
        setIsLoading(true);
        try {
            const storedStudents = localStorage.getItem(`students_${user.institutionId}`);
            setStudents(storedStudents ? JSON.parse(storedStudents) : []);

            const storedSections = localStorage.getItem(`sections_${user.institutionId}`);
            setSections(storedSections ? JSON.parse(storedSections) : []);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveStudent = () => {
        if (!formData.fullName || !formData.email || !formData.sectionId) {
            toast({ title: 'Error', description: 'Full Name, Email, and Class/Section are required.', variant: 'destructive' });
            return;
        }

        const currentStudents = students;
        let updatedStudents;

        if (editingStudent) {
            updatedStudents = currentStudents.map(s => s._id === editingStudent._id ? { ...s, ...formData } : s);
            toast({ title: 'Success', description: 'Student details updated.' });
        } else {
            if (!user?.institutionName) {
                toast({ title: "Error", description: "Institution name not found for username generation.", variant: "destructive" });
                return;
            }
             const newStudent: Student = {
                _id: `student-${Date.now()}`,
                ...formData,
                username: generateUsername(formData.fullName, user.institutionName),
                password: generatePassword(),
                createdAt: new Date().toISOString(),
            };
            updatedStudents = [...currentStudents, newStudent];
            toast({ title: 'Success', description: 'New student added.' });
        }

        setStudents(updatedStudents);
        if (user?.institutionId) {
            localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedStudents));
        }

        setIsDialogOpen(false);
    };

    const openEditDialog = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            fullName: student.fullName,
            email: student.email,
            sectionId: student.sectionId,
            gender: student.gender,
        });
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingStudent(null);
        setFormData(initialStudentState);
        setIsDialogOpen(true);
    };

    const handleDeleteStudent = (studentId: string) => {
        const updatedStudents = students.filter(s => s._id !== studentId);
        setStudents(updatedStudents);
        if (user?.institutionId) {
            localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedStudents));
        }
        toast({ title: 'Student Removed', description: 'The student has been removed.' });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.institutionId || !user?.institutionName) {
            toast({ title: "Upload Failed", description: "File or user context is missing.", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = xlsx.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    toast({ title: "Empty File", description: "The uploaded Excel file is empty.", variant: "destructive" });
                    return;
                }

                const newStudents: Student[] = json.map((row) => {
                    const sectionName = `${row.Class} - ${row.Stream} (Section ${row.Section})`;
                    const section = sections.find(s => s.name === sectionName);
                    if (!section) {
                        throw new Error(`Section "${sectionName}" not found for student ${row['Full Name']}. Please create it first.`);
                    }
                    return {
                        _id: `student-${Date.now()}-${Math.random()}`,
                        fullName: row['Full Name'],
                        email: row.Email,
                        sectionId: section._id,
                        gender: row.Gender,
                        username: generateUsername(row['Full Name'], user.institutionName!),
                        password: generatePassword(),
                        createdAt: new Date().toISOString()
                    };
                });
                
                const updatedStudents = [...students, ...newStudents];
                setStudents(updatedStudents);
                localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedStudents));
                toast({ title: "Import Successful", description: `${newStudents.length} students were added.` });
            } catch (error: any) {
                toast({ title: "Import Error", description: error.message || "Failed to process the file.", variant: "destructive", duration: 7000 });
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const templateData = [
            { "Full Name": "Aisha Khan", "Class": "1st Year", "Stream": "Pre-Medical", "Section": "A", "Gender": "Female", "Email": "aisha.k@example.com" }
        ];
        const worksheet = xlsx.utils.json_to_sheet(templateData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Students");
        xlsx.writeFile(workbook, "student_upload_template.xlsx");
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(s =>
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sectionMap.get(s.sectionId)?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm, sectionMap]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" /> Manage Students
            </h1>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demonstration Mode</AlertTitle>
                <AlertDescription>
                   This page uses your browser's local storage to simulate a database. Student data, including generated passwords, is stored unencrypted.
                </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="roster">
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="roster">Manage Roster</TabsTrigger>
                    <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
                </TabsList>
                 <TabsContent value="roster" className="mt-4">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Student Roster</CardTitle>
                                    <CardDescription>Add, view, and manage student accounts in your institution.</CardDescription>
                                </div>
                                <Button onClick={openCreateDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                                </Button>
                            </div>
                            <div className="relative pt-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name, email, or class..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Class & Section</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Password</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <TableRow key={student._id}>
                                                <TableCell>
                                                    <div className="font-medium">{student.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{student.email}</div>
                                                </TableCell>
                                                <TableCell>{sectionMap.get(student.sectionId) || 'N/A'}</TableCell>
                                                <TableCell className="font-mono text-xs">{student.username}</TableCell>
                                                <TableCell className="font-mono text-xs">{student.password}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(student)}>Edit</DropdownMenuItem>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently remove {student.fullName}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteStudent(student._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No students found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Bulk Student Upload</CardTitle>
                            <CardDescription>Add multiple students at once using an Excel file.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Instructions</AlertTitle>
                                <AlertDescription>
                                    <p>1. Download the Excel template.</p>
                                    <p>2. Fill in the student details. Ensure the Class, Stream, and Section names exactly match those created in the 'Manage Sections' tab.</p>
                                    <p>3. Upload the completed file. The system will create accounts for all students.</p>
                                </AlertDescription>
                            </Alert>
                             <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
                                    <Download className="mr-2 h-4 w-4" /> Download Template
                                </Button>
                                 <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                                    <Upload className="mr-2 h-4 w-4" /> Upload Excel File
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx" className="hidden" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="sectionId">Class & Section</Label>
                            <Select value={formData.sectionId} onValueChange={(value) => setFormData({ ...formData, sectionId: value })}>
                                <SelectTrigger id="sectionId"><SelectValue placeholder="Select a class" /></SelectTrigger>
                                <SelectContent>
                                    {sections.map(section => (
                                        <SelectItem key={section._id} value={section._id}>{section.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={formData.gender} onValueChange={(value: StudentFormData['gender']) => setFormData({ ...formData, gender: value })}>
                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStudent}>{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
