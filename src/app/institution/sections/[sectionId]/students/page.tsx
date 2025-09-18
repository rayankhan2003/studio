
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, MoreHorizontal, Users, AlertTriangle, Download, Upload, Eye, Search, Info, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as xlsx from 'xlsx';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Section {
    _id: string;
    name: string; 
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
    gender: 'Male' | 'Female' | 'Other' | '';
}

const initialStudentState: StudentFormData = {
    fullName: '',
    email: '',
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


export default function ManageStudentsInSectionPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const params = useParams();
    const sectionId = params.sectionId as string;

    const [students, setStudents] = useState<Student[]>([]);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<StudentFormData>(initialStudentState);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newlyCreatedStudents, setNewlyCreatedStudents] = useState<Student[]>([]);
    const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);


    const fetchData = useCallback(() => {
        if (!user || !user.institutionId || !sectionId) return;
        setIsLoading(true);
        try {
            const storedSectionsRaw = localStorage.getItem(`sections_${user.institutionId}`);
            const allSections = storedSectionsRaw ? JSON.parse(storedSectionsRaw) : [];
            const section = allSections.find((s: Section) => s._id === sectionId);
            setCurrentSection(section || null);
            
            const storedStudents = localStorage.getItem(`students_${user.institutionId}`);
            const allStudents: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
            setStudents(allStudents.filter(s => s.sectionId === sectionId));

        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [user, sectionId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveStudent = () => {
        if (!formData.fullName || !formData.email) {
            toast({ title: 'Error', description: 'Full Name and Email are required.', variant: 'destructive' });
            return;
        }

        if (!user?.institutionId || !user?.institutionName) return;

        const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
        const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
        let updatedStudents;

        if (editingStudent) {
            // This is simplified; editing logic would be more complex in a real app
            updatedStudents = allStudents.map(s => s._id === editingStudent._id ? { ...s, ...formData } : s);
            toast({ title: 'Success', description: 'Student details updated.' });
        } else {
             if (allStudents.some(s => s.email.toLowerCase() === formData.email.toLowerCase())) {
                toast({ title: "Email Exists", description: "A student with this email already exists in this institution.", variant: "destructive" });
                return;
             }
             const newStudent: Student = {
                _id: `student-${Date.now()}`,
                ...formData,
                sectionId: sectionId,
                username: generateUsername(formData.fullName, user.institutionName),
                password: generatePassword(),
                createdAt: new Date().toISOString(),
            };
            updatedStudents = [...allStudents, newStudent];
            setNewlyCreatedStudents([newStudent]);
            setIsCredentialsDialogOpen(true);
            toast({ title: 'Success', description: 'New student added.' });
        }
        
        localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedStudents));
        setStudents(updatedStudents.filter(s => s.sectionId === sectionId));

        setIsAddStudentDialogOpen(false);
        setEditingStudent(null);
        setFormData(initialStudentState);
    };

    const openCreateDialog = () => {
        setEditingStudent(null);
        setFormData(initialStudentState);
        setIsAddStudentDialogOpen(true);
    };

    const handleDeleteStudent = (studentId: string) => {
        if (!user?.institutionId) return;
        const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
        const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
        const updatedAllStudents = allStudents.filter(s => s._id !== studentId);
        
        localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedAllStudents));
        setStudents(updatedAllStudents.filter(s => s.sectionId === sectionId));
        toast({ title: 'Student Removed', description: 'The student has been removed.' });
    };
    
    const handleResetPassword = (studentId: string) => {
        if (!user?.institutionId) return;
        const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
        const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
        const newPassword = generatePassword();
        
        const updatedAllStudents = allStudents.map(s => s._id === studentId ? {...s, password: newPassword} : s);

        localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedAllStudents));
        setStudents(updatedAllStudents.filter(s => s.sectionId === sectionId));
        toast({ title: 'Password Reset', description: 'The password has been reset successfully.' });
    }

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

                if (json.length === 0) throw new Error("The uploaded Excel file is empty.");
                if (!json[0]['Full Name'] || !json[0]['Email']) throw new Error("Missing required columns: 'Full Name' and 'Email'.");

                const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
                const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
                const existingEmails = new Set(allStudents.map(s => s.email.toLowerCase()));
                
                const createdNow: Student[] = [];
                const errors: string[] = [];

                json.forEach((row, index) => {
                    const email = row['Email']?.trim().toLowerCase();
                    if (!email || !row['Full Name']?.trim()) {
                        errors.push(`Row ${index + 2}: Missing Full Name or Email.`);
                        return;
                    }
                    if (existingEmails.has(email)) {
                        errors.push(`Row ${index + 2}: Email '${email}' already exists.`);
                        return;
                    }

                    const newStudent: Student = {
                        _id: `student-${Date.now()}-${index}`,
                        fullName: row['Full Name'],
                        email: row['Email'],
                        sectionId: sectionId,
                        gender: row['Gender'] || '',
                        username: generateUsername(row['Full Name'], user.institutionName!),
                        password: generatePassword(),
                        createdAt: new Date().toISOString()
                    };
                    createdNow.push(newStudent);
                    existingEmails.add(email); // Avoid duplicates within the same file
                });
                
                if (errors.length > 0) {
                     toast({ title: "Import Issues", description: `Encountered ${errors.length} errors. ${errors[0]}`, variant: "destructive", duration: 7000 });
                }

                if (createdNow.length > 0) {
                    const updatedStudents = [...allStudents, ...createdNow];
                    localStorage.setItem(`students_${user.institutionId}`, JSON.stringify(updatedStudents));
                    setStudents(updatedStudents.filter(s => s.sectionId === sectionId));
                    setNewlyCreatedStudents(createdNow);
                    setIsCredentialsDialogOpen(true);
                    toast({ title: "Import Successful", description: `${createdNow.length} students were added.` });
                }

            } catch (error: any) {
                toast({ title: "Import Error", description: error.message || "Failed to process the file.", variant: "destructive", duration: 7000 });
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const templateData = [{ "Full Name": "Aisha Khan", "Gender": "Female", "Email": "aisha.k@example.com" }];
        const worksheet = xlsx.utils.json_to_sheet(templateData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Students");
        xlsx.writeFile(workbook, "student_upload_template.xlsx");
    };
    
    const exportCredentials = (format: 'pdf' | 'excel') => {
        const dataToExport = newlyCreatedStudents.map(s => ({
            'Full Name': s.fullName,
            'Gender': s.gender,
            'Email': s.email,
            'Username': s.username,
            'Password': s.password
        }));

        if (format === 'excel') {
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "Student Credentials");
            xlsx.writeFile(workbook, `student_credentials_${currentSection?.name.replace(/ /g, '_')}.xlsx`);
        } else {
            const doc = new jsPDF();
            doc.text(`Student Credentials for ${currentSection?.name}`, 14, 15);
            (doc as any).autoTable({
                head: [['Full Name', 'Gender', 'Email', 'Username', 'Password']],
                body: dataToExport.map(Object.values),
                startY: 20
            });
            doc.save(`student_credentials_${currentSection?.name.replace(/ /g, '_')}.pdf`);
        }
        toast({ title: "Exported!", description: `Credentials exported as ${format.toUpperCase()}.` });
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(s =>
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" /> Manage Students: <span className="text-accent">{currentSection?.name || '...'}</span>
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
                    <TabsTrigger value="roster">Student Roster</TabsTrigger>
                    <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
                </TabsList>
                 <TabsContent value="roster" className="mt-4">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Students in this Class</CardTitle>
                                    <CardDescription>Add, view, and manage student accounts.</CardDescription>
                                </div>
                                <Button onClick={openCreateDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                                </Button>
                            </div>
                            <div className="relative pt-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or email..."
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
                                        <TableHead>Gender</TableHead>
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
                                                <TableCell><Badge variant="outline">{student.gender || 'N/A'}</Badge></TableCell>
                                                <TableCell className="font-mono text-xs">{student.username}</TableCell>
                                                <TableCell className="font-mono text-xs">{student.password}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                             <DropdownMenuItem onClick={() => handleResetPassword(student._id)}>Reset Password</DropdownMenuItem>
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
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No students found for this class.</TableCell></TableRow>
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
                            <CardDescription>Add multiple students to <span className="font-bold text-primary">{currentSection?.name}</span> using an Excel file.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Instructions</AlertTitle>
                                <AlertDescription>
                                    <p>1. Download the Excel template.</p>
                                    <p>2. Fill in student details: Full Name, Gender, Email.</p>
                                    <p>3. Upload the completed file. Accounts will be created for this specific class.</p>
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

            <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                        <DialogDescription>Adding student to <span className="font-semibold text-primary">{currentSection?.name}</span></DialogDescription>
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
                        <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStudent}>{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Student Credentials Created</DialogTitle>
                        <DialogDescription>
                            The following student accounts have been created for <span className="font-semibold text-primary">{currentSection?.name}</span>. Please distribute these credentials securely.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[50vh] overflow-y-auto my-4">
                        <Table>
                             <TableHeader><TableRow><TableHead>Full Name</TableHead><TableHead>Username</TableHead><TableHead>Password</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {newlyCreatedStudents.map(s => (
                                    <TableRow key={s._id}>
                                        <TableCell>{s.fullName}</TableCell>
                                        <TableCell className="font-mono text-xs">{s.username}</TableCell>
                                        <TableCell className="font-mono text-xs">{s.password}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => exportCredentials('pdf')}><Printer className="mr-2 h-4 w-4" /> Export PDF</Button>
                        <Button variant="outline" onClick={() => exportCredentials('excel')}><Download className="mr-2 h-4 w-4" /> Export Excel</Button>
                        <Button onClick={() => setIsCredentialsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
