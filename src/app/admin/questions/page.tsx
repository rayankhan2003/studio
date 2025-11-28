
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Info, Trash2, BookOpen, Upload, Eye, AlertTriangle } from 'lucide-react';
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
import { logActivity } from '@/lib/activity-log';
import { Checkbox } from '@/components/ui/checkbox';

type ChapterCounts = Record<string, number>; // chapterName: count
type SubjectCounts = Record<string, ChapterCounts>; // subjectName: { chapters }
type CurriculumCounts = Record<string, SubjectCounts>; // curriculumName: { subjects }
type PastPaperCounts = Record<number, number>; // year: count

const REQUIRED_HEADERS = ['ID', 'Text', 'Type', 'Option 1', 'Option 2', 'CorrectAnswer'];

const pastMDCATYears = Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).reverse();


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

const PastPaperRow = ({ year, count, onViewClick, onUploadClick }: { year: number, count: number, onViewClick: (year: number) => void, onUploadClick: (year: number) => void }) => {
    return (
        <div className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50">
            <div>
                <p className="font-medium">MDCAT {year}</p>
                <p className="text-sm text-muted-foreground">{count} questions</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onUploadClick(year)}>
                    <Upload className="h-4 w-4 mr-1"/> Upload
                </Button>
                <Button variant="outline" size="sm" onClick={() => onViewClick(year)}>
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
    const [uploadContext, setUploadContext] = useState<{ curriculum: string; subject: string; chapter: string; pastPaperYear?: number } | { pastPaperYear: number } | null>(null);
    
    const [allQuestions, setAllQuestions] = useState<MockQuestionDefinition[]>([]);
    const [questionCounts, setQuestionCounts] = useState<CurriculumCounts>({});
    const [pastPaperCounts, setPastPaperCounts] = useState<PastPaperCounts>({});
    const [customQuestionIds, setCustomQuestionIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewDialogData, setViewDialogData] = useState<{ curriculum?: string; subject?: string; chapter?: string; pastPaperYear?: number } | null>(null);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

    const questionsForDialog = useMemo(() => {
        if (!viewDialogData) return [];
        return allQuestions.filter(q => {
            if (viewDialogData.pastPaperYear) {
                return q.pastPaperYear === viewDialogData.pastPaperYear;
            }
            return q.curriculum === viewDialogData.curriculum &&
                   q.subject === viewDialogData.subject &&
                   q.chapter === viewDialogData.chapter;
        });
    }, [allQuestions, viewDialogData]);
    
    const deletableQuestionsInDialog = useMemo(() => {
        return questionsForDialog.filter(q => customQuestionIds.has(q.id));
    }, [questionsForDialog, customQuestionIds]);


    const loadAndProcessQuestions = useCallback(() => {
        setIsLoading(true);
        const customQuestionsRaw = localStorage.getItem('customQuestionBank');
        const customQuestions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
        
        setCustomQuestionIds(new Set(customQuestions.map(q => q.id)));

        const questionMap = new Map<string, MockQuestionDefinition>();
        // The mockQuestionsDb is intentionally empty as per a previous request.
        [...mockQuestionsDb, ...customQuestions].forEach(q => questionMap.set(q.id, q));
        const combinedQuestions = Array.from(questionMap.values());
        setAllQuestions(combinedQuestions);

        const counts: CurriculumCounts = {};
        const ppCounts: PastPaperCounts = {};

        combinedQuestions.forEach(q => {
            if (q.pastPaperYear) {
                ppCounts[q.pastPaperYear] = (ppCounts[q.pastPaperYear] || 0) + 1;
            }
            if (!q.curriculum || !q.subject || !q.chapter) return;
            counts[q.curriculum] = counts[q.curriculum] || {};
            counts[q.curriculum][q.subject] = counts[q.curriculum][q.subject] || {};
            counts[q.curriculum][q.subject][q.chapter] = (counts[q.curriculum][q.subject][q.chapter] || 0) + 1;
        });
        setQuestionCounts(counts);
        setPastPaperCounts(ppCounts);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadAndProcessQuestions();
    }, [loadAndProcessQuestions]);
    
    useEffect(() => {
        if (!isViewDialogOpen) {
            setSelectedQuestionIds(new Set());
        }
    }, [isViewDialogOpen]);

    const handleUploadClick = (curriculum: string, subject: string, chapter: string) => {
        setUploadContext({ curriculum, subject, chapter });
        fileInputRef.current?.click();
    };

    const handlePastPaperUploadClick = (year: number) => {
        setUploadContext({ pastPaperYear: year });
        fileInputRef.current?.click();
    };


    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || !file.name.endsWith('.xlsx')) {
                toast({
                    title: "Invalid File Format",
                    description: "File must be in .xlsx format with no merged cells.",
                    variant: "destructive",
                });
            } else {
                processAndStoreQuestions(file);
            }
            if(e.target) e.target.value = ''; // Reset file input
        }
    };

    const processAndStoreQuestions = useCallback((uploadedFile: File) => {
        if (!uploadContext) {
            toast({ title: "Upload Error", description: "No upload context was set. Please try clicking 'Upload' again.", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const headers: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
                const trimmedHeaders = headers.map(h => typeof h === 'string' ? h.trim() : '');
                
                const required = REQUIRED_HEADERS;
                const missingHeaders = required.filter(rh => !trimmedHeaders.includes(rh));

                if (missingHeaders.length > 0) {
                     toast({
                        title: "Invalid Headers",
                        description: `Missing required headers: ${missingHeaders.join(', ')}.`,
                        variant: "destructive",
                        duration: 8000,
                    });
                    return;
                }
                
                const json: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

                if (json.length === 0) {
                     toast({ title: "Empty Data", description: "The Excel file appears to be empty.", variant: "destructive" });
                    return;
                }

                const newQuestions: MockQuestionDefinition[] = json.map((row, index) => {
                    const requiredFields = ['ID', 'Text', 'Type', 'CorrectAnswer'];
                    for(const field of requiredFields) {
                        if (row[field] === undefined || String(row[field]).trim() === '') {
                             throw new Error(`Row ${index + 2} is missing required data for column: ${field}.`);
                        }
                    }

                    const options = [row['Option 1'], row['Option 2'], row['Option 3'], row['Option 4']]
                        .map(opt => String(opt || '').trim())
                        .filter(opt => opt);
                    
                    if (options.length < 2) {
                        throw new Error(`Row ${index + 2} must have at least Option 1 and Option 2.`);
                    }

                    const questionBase = {
                        id: String(row.ID).trim(),
                        text: String(row.Text).trim(),
                        type: String(row.Type).trim() as MockQuestionDefinition['type'],
                        options: options.length > 0 ? options : undefined,
                        correctAnswer: String(row.CorrectAnswer).split(',').map(s => s.trim()),
                        explanation: row.Explanation ? String(row.Explanation).trim() : undefined,
                    };
                    
                    if ('pastPaperYear' in uploadContext) {
                        if (!row.Subject || !row.Chapter) {
                            throw new Error(`Row ${index + 2}: For past paper uploads, 'Subject' and 'Chapter' columns are required in the Excel file.`);
                        }
                        return {
                            ...questionBase,
                            subject: String(row.Subject).trim(),
                            chapter: String(row.Chapter).trim(),
                            curriculum: 'MDCAT',
                            pastPaperYear: uploadContext.pastPaperYear,
                        }
                    } else {
                         return {
                            ...questionBase,
                            subject: (uploadContext as any).subject,
                            chapter: (uploadContext as any).chapter,
                            curriculum: (uploadContext as any).curriculum,
                        };
                    }
                });

                const existingCustomQuestionsRaw = localStorage.getItem('customQuestionBank');
                const existingCustomQuestions: MockQuestionDefinition[] = existingCustomQuestionsRaw ? JSON.parse(existingCustomQuestionsRaw) : [];
                const questionMap = new Map<string, MockQuestionDefinition>();
                existingCustomQuestions.forEach(q => questionMap.set(q.id, q));
                newQuestions.forEach(q => questionMap.set(q.id, q));
                const combined = Array.from(questionMap.values());
                
                localStorage.setItem('customQuestionBank', JSON.stringify(combined));
                
                const logMessage = 'pastPaperYear' in uploadContext 
                    ? `Uploaded/updated ${newQuestions.length} questions for MDCAT ${uploadContext.pastPaperYear}`
                    : `Uploaded/updated ${newQuestions.length} questions for ${(uploadContext as any).subject} - ${(uploadContext as any).chapter}`;
                
                logActivity(logMessage);

                toast({
                    title: "Success!",
                    description: logMessage,
                });
                loadAndProcessQuestions();
            } catch (error: any) {
                toast({
                    title: "Error Processing File",
                    description: error.message || "An unexpected error occurred. Check file format and column headers.",
                    variant: "destructive",
                    duration: 7000,
                });
            } finally {
                setUploadContext(null);
            }
        };
        reader.readAsArrayBuffer(uploadedFile);
    }, [uploadContext, toast, loadAndProcessQuestions]);

    const handleDeleteQuestions = (questionIds: Set<string>) => {
        const customQuestionsRaw = localStorage.getItem('customQuestionBank');
        let customQuestions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
        
        const updatedQuestions = customQuestions.filter(q => !questionIds.has(q.id));
        localStorage.setItem('customQuestionBank', JSON.stringify(updatedQuestions));
        
        logActivity(`Deleted ${questionIds.size} questions.`);

        toast({
            title: "Questions Deleted",
            description: `${questionIds.size} questions have been removed from the custom bank.`,
        });
        loadAndProcessQuestions(); // Refresh data
        setSelectedQuestionIds(new Set()); // Clear selection
    };
    
    const handleViewClick = (subject: string, chapter: string) => {
        const tabValue = document.querySelector('[role="tablist"] [data-state="active"]')?.getAttribute('data-value');
        setViewDialogData({ curriculum: tabValue || 'MDCAT', subject, chapter });
        setIsViewDialogOpen(true);
    };

    const handlePastPaperViewClick = (year: number) => {
        setViewDialogData({ pastPaperYear: year });
        setIsViewDialogOpen(true);
    };


    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedQuestionIds(new Set(deletableQuestionsInDialog.map(q => q.id)));
        } else {
            setSelectedQuestionIds(new Set());
        }
    };

    const handleSelectOne = (questionId: string, checked: boolean) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(questionId);
            } else {
                newSet.delete(questionId);
            }
            return newSet;
        });
    };
    
    return (
        <div className="space-y-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
                       View questions or upload new ones for a specific chapter or past paper.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Upload Instructions</AlertTitle>
                        <AlertDescription>
                            <p className="text-xs">To add questions, click "Upload". Your Excel file (.xlsx) must have specific columns. The required columns are:</p>
                            <ul className="list-disc list-inside mt-2 text-xs space-y-1 font-mono">
                                <li><strong>ID, Text, Type, Option 1, Option 2, CorrectAnswer</strong></li>
                                <li>Optional columns: <strong>Option 3, Option 4, Explanation</strong></li>
                                <li>For Chapter uploads, <strong>Subject</strong> and <strong>Chapter</strong> are set automatically.</li>
                                <li>For Past Paper uploads, you must include <strong>Subject</strong> and <strong>Chapter</strong> columns in your file.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {isLoading ? <p>Loading question bank...</p> : (
                        <Tabs defaultValue="MDCAT">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="MDCAT">MDCAT</TabsTrigger>
                                <TabsTrigger value="O Level">O Level</TabsTrigger>
                                <TabsTrigger value="A Level">A Level</TabsTrigger>
                                <TabsTrigger value="Past Papers">Past Papers</TabsTrigger>
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
                             <TabsContent value="Past Papers" className="mt-4">
                                <div className="space-y-2">
                                     {pastMDCATYears.map(year => (
                                        <PastPaperRow 
                                            key={year}
                                            year={year}
                                            count={pastPaperCounts[year] || 0}
                                            onViewClick={handlePastPaperViewClick}
                                            onUploadClick={handlePastPaperUploadClick}
                                        />
                                     ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
            
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            Questions for: {viewDialogData?.pastPaperYear 
                                ? `MDCAT ${viewDialogData.pastPaperYear}` 
                                : `${viewDialogData?.subject} - ${viewDialogData?.chapter}`
                            }
                        </DialogTitle>
                        <DialogDescription>
                             Curriculum: {viewDialogData?.pastPaperYear ? 'MDCAT Past Paper' : viewDialogData?.curriculum}. Select custom questions to delete them. Built-in questions cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                        {questionsForDialog.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={deletableQuestionsInDialog.length > 0 && selectedQuestionIds.size === deletableQuestionsInDialog.length}
                                                onCheckedChange={(checked) => handleSelectAll(checked)}
                                                aria-label="Select all questions in this view"
                                                disabled={deletableQuestionsInDialog.length === 0}
                                            />
                                        </TableHead>
                                        <TableHead>Question Text</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Source</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questionsForDialog.map(q => {
                                        const isCustom = customQuestionIds.has(q.id);
                                        return (
                                            <TableRow key={q.id} data-state={selectedQuestionIds.has(q.id) ? 'selected' : ''}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedQuestionIds.has(q.id)}
                                                        onCheckedChange={(checked) => handleSelectOne(q.id, !!checked)}
                                                        aria-label={`Select question ${q.id}`}
                                                        disabled={!isCustom}
                                                    />
                                                </TableCell>
                                                <TableCell className="max-w-md truncate font-medium">{q.text}</TableCell>
                                                <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={isCustom ? "default" : "secondary"}>{isCustom ? "Custom" : "Built-in"}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No questions found for this selection.</p>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={selectedQuestionIds.size === 0}>
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Delete Selected ({selectedQuestionIds.size})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete {selectedQuestionIds.size} selected questions from your custom question bank.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteQuestions(selectedQuestionIds)}>Delete Questions</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
