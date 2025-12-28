
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, Download, User, Info, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  sectionId: string;
}

interface TestAttempt {
  id: string;
  userId: string; // This would link to the student
  testName: string;
  date: string;
  overallScorePercentage: number;
  subjectScores: Record<string, number>;
  chapterScores: Record<string, Record<string, number>>;
}

interface PerformanceData {
  studentName: string;
  studentId: string;
  [chapterKey: string]: string | number; // chapterKey is like "Subject-ChapterName"
}

interface SubjectChapter {
  subject: string;
  chapter: string;
}

export default function SectionAnalyticsPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [allChapters, setAllChapters] = useState<SubjectChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [studentReportData, setStudentReportData] = useState<TestAttempt[]>([]);

  const processAnalytics = useCallback(() => {
    if (!user?.institutionId || !sectionId) return;

    setIsLoading(true);
    try {
      // 1. Get all students for this institution, then filter for the section
      const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
      const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
      const sectionStudents = allStudents.filter(s => s.sectionId === sectionId);
      setStudents(sectionStudents);

      // 2. Get all test attempts (assuming they are stored globally for simplicity)
      const allAttemptsRaw = localStorage.getItem('prepwiseTestHistory');
      const allAttempts: TestAttempt[] = allAttemptsRaw ? JSON.parse(allAttemptsRaw) : [];
      
      const studentEmails = new Set(sectionStudents.map(s => s.email));
      // NOTE: This links attempts to students by email. In a real app, you'd use a stable user ID.
      const sectionAttempts = allAttempts.filter(attempt => studentEmails.has(attempt.userId));

      // 3. Aggregate performance data
      const chapterSet = new Set<string>();
      const perfMap = new Map<string, any>();

      sectionStudents.forEach(student => {
        perfMap.set(student._id, { studentName: student.fullName, studentId: student._id });
      });

      sectionAttempts.forEach(attempt => {
        const student = sectionStudents.find(s => s.email === attempt.userId);
        if (!student) return;

        const studentData = perfMap.get(student._id);

        Object.entries(attempt.chapterScores).forEach(([subject, chapters]) => {
          Object.entries(chapters).forEach(([chapter, score]) => {
            const chapterKey = `${subject} - ${chapter}`;
            chapterSet.add(chapterKey);
            studentData[chapterKey] = studentData[chapterKey] ? `${studentData[chapterKey]}, ${score.toFixed(0)}` : `${score.toFixed(0)}`;
          });
        });
      });
      
      const sortedChapters = Array.from(chapterSet).sort().map(key => {
          const [subject, chapter] = key.split(' - ');
          return { subject, chapter };
      });
      setAllChapters(sortedChapters);
      setPerformanceData(Array.from(perfMap.values()));

    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process analytics data.', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, sectionId, toast]);

  useEffect(() => {
    processAnalytics();
  }, [processAnalytics]);

  const openStudentReport = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const allAttemptsRaw = localStorage.getItem('prepwiseTestHistory');
    const allAttempts: TestAttempt[] = allAttemptsRaw ? JSON.parse(allAttemptsRaw) : [];
    
    // NOTE: Linking by email is a simplification for this demo.
    const studentAttempts = allAttempts.filter(att => att.userId === student.email);
    setStudentReportData(studentAttempts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsReportCardOpen(true);
  };
  
  const downloadStudentReport = () => {
    if (!selectedStudent || !studentReportData) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Student Report Card`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Student: ${selectedStudent.name}`, 14, 30);
    
    const tableColumn = ["Test Name", "Date", "Overall Score (%)", "Subjects"];
    const tableRows: (string | number)[][] = [];

    studentReportData.forEach(attempt => {
        const subjects = Object.entries(attempt.subjectScores).map(([subj, score]) => `${subj}: ${score}%`).join('; ');
        const rowData = [
            attempt.testName,
            new Date(attempt.date).toLocaleDateString(),
            attempt.overallScorePercentage,
            subjects
        ];
        tableRows.push(rowData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
    });
    
    doc.save(`report_card_${selectedStudent.name.replace(/ /g, '_')}.pdf`);
  };

  const downloadClassReport = () => {
      const doc = new jsPDF('l'); // landscape
      doc.setFontSize(16);
      doc.text("Class Performance Report", 14, 15);

      const head = [['Student Name', ...allChapters.map(c => `${c.subject.substring(0,3)}: ${c.chapter}`)]];
      const body = performanceData.map(studentRow => {
          const row = [studentRow.studentName];
          allChapters.forEach(c => {
              const key = `${c.subject} - ${c.chapter}`;
              row.push(String(studentRow[key] || 'N/A'));
          });
          return row;
      });

      (doc as any).autoTable({
          head,
          body,
          startY: 20,
          styles: { fontSize: 7, cellPadding: 1 },
          headStyles: { fontSize: 8, fontStyle: 'bold' }
      });

      doc.save(`class_performance_report.pdf`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Class Analytics...</p>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1">
                <CardTitle>Class Performance Details</CardTitle>
                <CardDescription>Scores per student for each chapter test. Click a student's name for their full report card.</CardDescription>
            </div>
            <Button onClick={downloadClassReport} disabled={performanceData.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Download PDF Report
            </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {performanceData.length > 0 && allChapters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10">Student Name</TableHead>
                {allChapters.map((c, i) => (
                  <TableHead key={i} title={`${c.subject} - ${c.chapter}`} className="min-w-[150px] whitespace-nowrap">
                    <p className="font-bold">{c.subject}</p>
                    <p className="text-xs text-muted-foreground">{c.chapter}</p>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((studentRow) => (
                <TableRow key={studentRow.studentId}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">
                    <button onClick={() => openStudentReport(studentRow.studentId, studentRow.studentName)} className="text-primary hover:underline flex items-center gap-1">
                       <User className="h-4 w-4"/> {studentRow.studentName}
                    </button>
                  </TableCell>
                  {allChapters.map((c, i) => {
                    const chapterKey = `${c.subject} - ${c.chapter}`;
                    const score = studentRow[chapterKey];
                    return <TableCell key={i} className="text-center">{score === undefined ? '—' : String(score)}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <div className="text-center py-16">
                 <p className="text-muted-foreground">No test performance data found for students in this class yet.</p>
                 <p className="text-xs text-muted-foreground mt-2">Create and assign tests to this class to see analytics here.</p>
            </div>
        )}
      </CardContent>
       <CardFooter>
          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0"/>
            <span>Scores shown are percentages (%). If a student has taken multiple tests for the same chapter, scores are listed separated by commas.</span>
          </div>
       </CardFooter>

      <Dialog open={isReportCardOpen} onOpenChange={setIsReportCardOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-primary"/>
                      Student Report Card for: {selectedStudent?.name}
                  </DialogTitle>
                  <DialogDescription>
                      A summary of all test attempts by this student.
                  </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto my-4 pr-2">
                  {studentReportData.length > 0 ? (
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Test Name</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Score</TableHead>
                                  <TableHead>Subject Scores</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {studentReportData.map(attempt => (
                                  <TableRow key={attempt.id}>
                                      <TableCell className="font-medium">{attempt.testName}</TableCell>
                                      <TableCell>{new Date(attempt.date).toLocaleDateString()}</TableCell>
                                      <TableCell className="font-bold text-primary">{attempt.overallScorePercentage.toFixed(1)}%</TableCell>
                                      <TableCell className="text-xs max-w-[200px] truncate">
                                          {Object.entries(attempt.subjectScores).map(([subj, score]) => `${subj}: ${score}%`).join('; ')}
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  ) : (
                      <p className="text-muted-foreground text-center py-8">No test history found for this student.</p>
                  )}
              </div>
              <DialogFooter className="sm:justify-between">
                  <Button onClick={downloadStudentReport} variant="outline" disabled={studentReportData.length === 0}>
                      <Printer className="mr-2 h-4 w-4" /> Download as PDF
                  </Button>
                  <Button onClick={() => setIsReportCardOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Card>
  );
}
