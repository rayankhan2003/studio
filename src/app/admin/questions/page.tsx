
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Info, Trash2, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as xlsx from 'xlsx';
import { type MockQuestionDefinition } from '@/lib/mock-questions-db';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

export default function QuestionBankPage() {
    const { toast } = useToast();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [customQuestions, setCustomQuestions] = useState<MockQuestionDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadQuestionsFromStorage = useCallback(() => {
        const customQuestionsRaw = localStorage.getItem('customQuestionBank');
        const questions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
        setCustomQuestions(questions);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadQuestionsFromStorage();
    }, [loadQuestionsFromStorage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setUploadedFile(file);
            } else {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a valid Excel file (.xlsx or .xls).",
                    variant: "destructive",
                });
                e.target.value = ''; // Reset file input
            }
        }
    };

    const processAndStoreQuestions = useCallback(() => {
        if (!uploadedFile) {
            toast({ title: "No file selected", description: "Please choose an Excel file to upload.", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = xlsx.utils.sheet_to_json(worksheet);

                const newQuestions: MockQuestionDefinition[] = json.map((row, index) => {
                    if (!row.ID || !row.Subject || !row.Chapter || !row.Text || !row.Type || !row.CorrectAnswer || !row.Curriculum) {
                        throw new Error(`Row ${index + 2} is missing required fields (ID, Subject, Chapter, Text, Type, CorrectAnswer, Curriculum).`);
                    }
                    let correctAnswer: string | string[];
                    if (String(row.Type).trim() === 'multiple-choice') {
                        if (!row.CorrectAnswer) throw new Error(`Row ${index + 2} is multiple-choice but has no CorrectAnswer.`);
                        correctAnswer = String(row.CorrectAnswer).split(',').map(s => s.trim());
                    } else {
                        correctAnswer = String(row.CorrectAnswer).trim();
                    }
                    return {
                        id: String(row.ID).trim(),
                        subject: String(row.Subject).trim(),
                        chapter: String(row.Chapter).trim(),
                        text: String(row.Text).trim(),
                        type: String(row.Type).trim() as MockQuestionDefinition['type'],
                        options: row.Options ? String(row.Options).split(',').map(s => s.trim()) : undefined,
                        correctAnswer: correctAnswer,
                        explanation: row.Explanation ? String(row.Explanation).trim() : undefined,
                        curriculum: String(row.Curriculum).trim() as MockQuestionDefinition['curriculum'],
                    };
                });

                const existingCustomQuestionsRaw = localStorage.getItem('customQuestionBank');
                const existingCustomQuestions: MockQuestionDefinition[] = existingCustomQuestionsRaw ? JSON.parse(existingCustomQuestionsRaw) : [];
                const questionMap = new Map<string, MockQuestionDefinition>();
                existingCustomQuestions.forEach(q => questionMap.set(q.id, q));
                newQuestions.forEach(q => questionMap.set(q.id, q));
                const combined = Array.from(questionMap.values());
                localStorage.setItem('customQuestionBank', JSON.stringify(combined));
                setCustomQuestions(combined);
                toast({
                    title: "Success!",
                    description: `${newQuestions.length} questions have been processed and added/updated in your local question bank.`,
                });
                setUploadedFile(null);
                const fileInput = document.getElementById('question-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } catch (error: any) {
                toast({
                    title: "Error Processing File",
                    description: error.message || "An unexpected error occurred. Check file format and column headers.",
                    variant: "destructive",
                    duration: 7000,
                });
            }
        };
        reader.readAsArrayBuffer(uploadedFile);
    }, [uploadedFile, toast]);

    const handleDeleteQuestion = (questionId: string) => {
        const updatedQuestions = customQuestions.filter(q => q.id !== questionId);
        localStorage.setItem('customQuestionBank', JSON.stringify(updatedQuestions));
        setCustomQuestions(updatedQuestions);
        toast({
            title: "Question Deleted",
            description: `Question with ID ${questionId} has been removed from the custom bank.`,
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Manage Question Bank</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <FileUp className="h-6 w-6 text-primary" /> Upload Questions
                            </CardTitle>
                            <CardDescription>
                                Upload an MS Excel (.xlsx) file to add or update questions in the question bank.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="question-file">Excel File</Label>
                                <Input id="question-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </div>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Excel Format Instructions</AlertTitle>
                                <AlertDescription>
                                    <p className="text-xs">Your Excel file must have a header row with these columns:</p>
                                    <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                                        <li><strong>ID</strong> (Unique identifier, e.g., "bio_q1")</li>
                                        <li><strong>Subject</strong> (e.g., Biology)</li>
                                        <li><strong>Chapter</strong> (e.g., Cell Structure & Function)</li>
                                        <li><strong>Text</strong> (The question)</li>
                                        <li><strong>Type</strong> (single-choice, multiple-choice, etc.)</li>
                                        <li><strong>Options</strong> (Comma-separated)</li>
                                        <li><strong>CorrectAnswer</strong> (Comma-separated for multiple-choice)</li>
                                        <li><strong>Explanation</strong> (Optional)</li>
                                        <li><strong>Curriculum</strong> (MDCAT, O Level, A Level)</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={processAndStoreQuestions} disabled={!uploadedFile} className="w-full">
                                Upload and Process
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <BookOpen className="h-6 w-6 text-primary" /> Current Custom Questions ({customQuestions.length})
                            </CardTitle>
                            <CardDescription>
                                These are the questions currently stored in the browser's local storage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p>Loading questions...</p>
                            ) : customQuestions.length > 0 ? (
                                <div className="max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Question Text</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Curriculum</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customQuestions.map((q) => (
                                            <TableRow key={q.id}>
                                                <TableCell className="max-w-xs truncate font-medium">{q.text}</TableCell>
                                                <TableCell>{q.subject}</TableCell>
                                                <TableCell><Badge variant="secondary">{q.curriculum}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the question "{q.text}" from your custom question bank.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No custom questions found. Upload an Excel file to get started.</p>
                            )}
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}
