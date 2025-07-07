
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Info, Trash2, BookOpen, Upload, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as xlsx from 'xlsx';
import { type MockQuestionDefinition, mockQuestionsDb } from '@/lib/mock-questions-db';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { allSubjects as allMdcatSubjects, syllabus as mdcatSyllabus } from '@/lib/syllabus';
import { allCambridgeSubjects, cambridgeSyllabus, CambridgeLevels } from '@/lib/cambridge-syllabus';

type ChapterCounts = Record<string, number>; // chapterName: count
type SubjectCounts = Record<string, ChapterCounts>; // subjectName: { chapters }
type CurriculumCounts = Record<string, SubjectCounts>; // curriculumName: { subjects }

const ChapterRow = ({ curriculum, subject, chapterName, count, onViewClick, onUploadClick }: { curriculum: string, subject: string, chapterName: string, count: number, onViewClick: (subject: string, chapter: string) => void, onUploadClick: (curriculum: string, subject: string, chapter: string) => void }) => {
    return (
        <div className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50">
            <div>
                <p className="font-medium">{chapterName}</p>
                <p className="text-sm text-muted-foreground">{count} questions</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onUploadClick(curriculum, subject, chapterName)}>
                    <Upload className="h-4 w-4 mr-1"/> Upload
                </Button>
                <Button variant="outline" size="sm" onClick={() => onViewClick(subject, chapterName)}>
                    <Eye className="h-4 w-4 mr-1"/> View
                </Button>
            </div>
        </div>
    );
};

const CurriculumView = ({ curriculum, syllabus, subjects, counts, onViewClick, onUploadClick }: { curriculum: string, syllabus: any, subjects: string[], counts: SubjectCounts, onViewClick: (subject: string, chapter: string) => void, onUploadClick: (curriculum: string, subject: string, chapter: string) => void }) => {
    return (
        <Accordion type="multiple" className="w-full space-y-2">
            {subjects.map(subject => {
                 const subjectChapters = syllabus[subject] || [];
                 const totalSubjectQuestions = subjectChapters.reduce((acc: number, chapter: any) => acc + (counts?.[subject]?.[chapter.name] || 0), 0);
                 
                 return (
                    <AccordionItem value={subject} key={subject} className="border bg-muted/30 rounded-md shadow-sm">
                         <AccordionTrigger className="px-4 py-3 text-lg hover:no-underline hover:bg-accent/10 data-[state=open]:bg-accent/5">
                            <div className="flex justify-between items-center w-full">
                               <span>{subject}</span>
                               <Badge variant="secondary">{totalSubjectQuestions} Questions</Badge>
                            </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-0 pb-3 px-4 bg-background border-t">
                            <div className="space-y-2 pt-3">
                            {subjectChapters.length > 0 ? subjectChapters.map((chapter: any) => (
                                <ChapterRow
                                    key={chapter.name}
                                    curriculum={curriculum}
                                    subject={subject}
                                    chapterName={chapter.name}
                                    count={counts?.[subject]?.[chapter.name] || 0}
                                    onViewClick={onViewClick}
                                    onUploadClick={onUploadClick}
                                />
                            )) : <p className="text-muted-foreground text-sm">No chapters defined for this subject.</p>}
                            </div>
                         </AccordionContent>
                    </AccordionItem>
                 )
            })}
        </Accordion>
    );
};


export default function QuestionBankPage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadContext, setUploadContext] = useState<{ curriculum: string; subject: string; chapter: string } | null>(null);
    
    const [allQuestions, setAllQuestions] = useState<MockQuestionDefinition[]>([]);
    const [questionCounts, setQuestionCounts] = useState<CurriculumCounts>({});
    const [customQuestionIds, setCustomQuestionIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewDialogData, setViewDialogData] = useState<{ curriculum: string; subject: string; chapter: string } | null>(null);
    
    const loadAndProcessQuestions = useCallback(() => {
        setIsLoading(true);
        const customQuestionsRaw = localStorage.getItem('customQuestionBank');
        const customQuestions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
        
        setCustomQuestionIds(new Set(customQuestions.map(q => q.id)));

        const questionMap = new Map<string, MockQuestionDefinition>();
        [...mockQuestionsDb, ...customQuestions].forEach(q => questionMap.set(q.id, q));
        const combinedQuestions = Array.from(questionMap.values());
        setAllQuestions(combinedQuestions);

        const counts: CurriculumCounts = {};
        combinedQuestions.forEach(q => {
            if (!q.curriculum || !q.subject || !q.chapter) return;
            counts[q.curriculum] = counts[q.curriculum] || {};
            counts[q.curriculum][q.subject] = counts[q.curriculum][q.subject] || {};
            counts[q.curriculum][q.subject][q.chapter] = (counts[q.curriculum][q.subject][q.chapter] || 0) + 1;
        });
        setQuestionCounts(counts);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadAndProcessQuestions();
    }, [loadAndProcessQuestions]);

    const handleUploadClick = (curriculum: string, subject: string, chapter: string) => {
        setUploadContext({ curriculum, subject, chapter });
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processAndStoreQuestions(file);
            } else {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a valid Excel file (.xlsx or .xls).",
                    variant: "destructive",
                });
            }
            if(e.target) e.target.value = '';
        }
    };

    const processAndStoreQuestions = useCallback((uploadedFile: File) => {
        if (!uploadContext) {
            toast({ title: "Upload Error", description: "No chapter context was set. Please try clicking 'Upload' again.", variant: "destructive" });
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
                    if (!row.ID || !row.Text || !row.Type || !row.CorrectAnswer) {
                        throw new Error(`Row ${index + 2} is missing required fields (ID, Text, Type, CorrectAnswer).`);
                    }
                    return {
                        id: String(row.ID).trim(),
                        subject: uploadContext.subject,
                        chapter: uploadContext.chapter,
                        curriculum: uploadContext.curriculum,
                        text: String(row.Text).trim(),
                        type: String(row.Type).trim() as MockQuestionDefinition['type'],
                        options: row.Options ? String(row.Options).split(',').map(s => s.trim()) : undefined,
                        correctAnswer: String(row.CorrectAnswer).split(',').map(s => s.trim()),
                        explanation: row.Explanation ? String(row.Explanation).trim() : undefined,
                    };
                });

                const existingCustomQuestionsRaw = localStorage.getItem('customQuestionBank');
                const existingCustomQuestions: MockQuestionDefinition[] = existingCustomQuestionsRaw ? JSON.parse(existingCustomQuestionsRaw) : [];
                const questionMap = new Map<string, MockQuestionDefinition>();
                existingCustomQuestions.forEach(q => questionMap.set(q.id, q));
                newQuestions.forEach(q => questionMap.set(q.id, q));
                const combined = Array.from(questionMap.values());
                
                localStorage.setItem('customQuestionBank', JSON.stringify(combined));
                
                toast({
                    title: "Success!",
                    description: `${newQuestions.length} questions for ${uploadContext.subject} - ${uploadContext.chapter} have been added/updated.`,
                });
                loadAndProcessQuestions(); // Refresh data
            } catch (error: any) {
                toast({
                    title: "Error Processing File",
                    description: error.message || "An unexpected error occurred. Check file format and column headers.",
                    variant: "destructive",
                    duration: 7000,
                });
            } finally {
                setUploadContext(null); // Reset context
            }
        };
        reader.readAsArrayBuffer(uploadedFile);
    }, [uploadContext, toast, loadAndProcessQuestions]);

    const handleDeleteQuestion = (questionId: string) => {
        const customQuestionsRaw = localStorage.getItem('customQuestionBank');
        let customQuestions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
        
        const updatedQuestions = customQuestions.filter(q => q.id !== questionId);
        localStorage.setItem('customQuestionBank', JSON.stringify(updatedQuestions));
        
        toast({
            title: "Question Deleted",
            description: `Question with ID ${questionId} has been removed from the custom bank.`,
        });
        loadAndProcessQuestions(); // Refresh data
    };
    
    const handleViewClick = (subject: string, chapter: string) => {
        const tabValue = document.querySelector('[role="tablist"] [data-state="active"]')?.getAttribute('data-value');
        setViewDialogData({ curriculum: tabValue || 'MDCAT', subject, chapter });
        setIsViewDialogOpen(true);
    };

    const questionsForDialog = useMemo(() => {
        if (!viewDialogData) return [];
        return allQuestions.filter(q => 
            q.curriculum === viewDialogData.curriculum &&
            q.subject === viewDialogData.subject &&
            q.chapter === viewDialogData.chapter
        );
    }, [allQuestions, viewDialogData]);

    return (
        <div className="space-y-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                aria-hidden="true"
            />
            <h1 className="text-3xl font-bold tracking-tight">Manage Question Bank</h1>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <BookOpen className="h-6 w-6 text-primary" /> Browse & Upload
                    </CardTitle>
                    <CardDescription>
                       View questions or upload new ones for a specific chapter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Upload Instructions</AlertTitle>
                        <AlertDescription>
                            <p className="text-xs">To add questions, click the "Upload" button for the specific chapter. Your Excel file must have a header row with these columns:</p>
                            <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                                <li><strong>ID</strong> (Unique identifier, e.g., "bio_q1")</li>
                                <li><strong>Text</strong> (The question)</li>
                                <li><strong>Type</strong> (single-choice, multiple-choice, fill-in-the-blank, or true-false)</li>
                                <li><strong>Options</strong> (Comma-separated for choice types)</li>
                                <li><strong>CorrectAnswer</strong> (Comma-separated for multiple-choice)</li>
                                <li><strong>Explanation</strong> (Optional)</li>
                            </ul>
                             <p className="text-xs mt-2">The Curriculum, Subject, and Chapter are set automatically based on where you click "Upload".</p>
                        </AlertDescription>
                    </Alert>

                    {isLoading ? <p>Loading question bank...</p> : (
                        <Tabs defaultValue="MDCAT">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="MDCAT">MDCAT</TabsTrigger>
                                <TabsTrigger value="O Level">O Level</TabsTrigger>
                                <TabsTrigger value="A Level">A Level</TabsTrigger>
                            </TabsList>
                            <TabsContent value="MDCAT" className="mt-4">
                                <CurriculumView
                                    curriculum="MDCAT"
                                    syllabus={mdcatSyllabus}
                                    subjects={allMdcatSubjects}
                                    counts={questionCounts['MDCAT'] || {}}
                                    onViewClick={handleViewClick}
                                    onUploadClick={handleUploadClick}
                                />
                            </TabsContent>
                             <TabsContent value="O Level" className="mt-4">
                                <CurriculumView
                                    curriculum="O Level"
                                    syllabus={cambridgeSyllabus[CambridgeLevels.O_LEVEL]}
                                    subjects={allCambridgeSubjects}
                                    counts={questionCounts['O Level'] || {}}
                                    onViewClick={handleViewClick}
                                    onUploadClick={handleUploadClick}
                                />
                            </TabsContent>
                             <TabsContent value="A Level" className="mt-4">
                                <CurriculumView
                                    curriculum="A Level"
                                    syllabus={cambridgeSyllabus[CambridgeLevels.A_LEVEL]}
                                    subjects={allCambridgeSubjects}
                                    counts={questionCounts['A Level'] || {}}
                                    onViewClick={handleViewClick}
                                    onUploadClick={handleUploadClick}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
            
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Questions for: {viewDialogData?.subject} - {viewDialogData?.chapter}</DialogTitle>
                        <DialogDescription>
                            Curriculum: {viewDialogData?.curriculum}. Here you can view and delete individual custom questions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                        {questionsForDialog.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question Text</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questionsForDialog.map(q => (
                                        <TableRow key={q.id}>
                                            <TableCell className="max-w-md truncate font-medium">{q.text}</TableCell>
                                            <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" disabled={!customQuestionIds.has(q.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the question "{q.text}" from your custom question bank. Built-in questions cannot be deleted.
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
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No questions found for this chapter.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
