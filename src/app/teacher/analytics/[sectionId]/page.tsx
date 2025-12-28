
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, Download, User, Info } from 'lucide-react';
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
  userId: string; 
  testName: string;
  date: string;
  overallScorePercentage: number;
  subjectScores: Record<string, number>;
  chapterScores: Record<string, Record<string, number>>;
}

interface PerformanceData {
  studentName: string;
  studentId: string;
  totalScore: number;
  testCount: number;
  averageScore: number;
  testScores: Record<string, number>; // { [testName]: score }
}

interface TestInfo {
    name: string;
    date: string;
}


export default function TeacherSectionAnalyticsPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [allTests, setAllTests] = useState<TestInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const processAnalytics = useCallback(() => {
    if (!user?.institutionId || !sectionId) return;

    setIsLoading(true);
    try {
      // 1. Get all students for this institution, then filter for the section
      const allStudentsRaw = localStorage.getItem(`students_${user.institutionId}`);
      const allStudents: Student[] = allStudentsRaw ? JSON.parse(allStudentsRaw) : [];
      const sectionStudents = allStudents.filter(s => s.sectionId === sectionId);
      setStudents(sectionStudents);

      // 2. Get all test attempts 
      const allAttemptsRaw = localStorage.getItem('prepwiseTestHistory');
      const allAttempts: TestAttempt[] = allAttemptsRaw ? JSON.parse(allAttemptsRaw) : [];
      
      const studentEmails = new Set(sectionStudents.map(s => s.email));
      const sectionAttempts = allAttempts.filter(attempt => studentEmails.has(attempt.userId));

      // 3. Aggregate performance data
      const testSet = new Map<string, TestInfo>();
      const perfMap = new Map<string, PerformanceData>();

      sectionStudents.forEach(student => {
        perfMap.set(student._id, {
            studentName: student.fullName,
            studentId: student._id,
            totalScore: 0,
            testCount: 0,
            averageScore: 0,
            testScores: {}
        });
      });

      sectionAttempts.forEach(attempt => {
        const student = sectionStudents.find(s => s.email === attempt.userId);
        if (!student) return;

        const studentData = perfMap.get(student._id)!;
        
        studentData.totalScore += attempt.overallScorePercentage;
        studentData.testCount++;
        studentData.testScores[attempt.testName] = attempt.overallScorePercentage;

        if (!testSet.has(attempt.testName)) {
            testSet.set(attempt.testName, { name: attempt.testName, date: attempt.date });
        }
      });
      
      perfMap.forEach(data => {
          if(data.testCount > 0) {
              data.averageScore = data.totalScore / data.testCount;
          }
      });
      
      const sortedTests = Array.from(testSet.values()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllTests(sortedTests);
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

  
  const downloadClassReport = () => {
      const doc = new jsPDF('l'); // landscape
      doc.setFontSize(16);
      doc.text("Class Performance Report", 14, 15);

      const head = [['Student Name', ...allTests.map(t => `${t.name}`), 'Average Score (%)']];
      const body = performanceData.map(studentRow => {
          const row: (string|number)[] = [studentRow.studentName];
          allTests.forEach(t => {
              row.push(studentRow.testScores[t.name]?.toFixed(1) || 'N/A');
          });
          row.push(studentRow.averageScore.toFixed(1));
          return row;
      });

      (doc as any).autoTable({
          head,
          body,
          startY: 20,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fontSize: 9, fontStyle: 'bold', halign: 'center' }
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
                <CardDescription>Scores per student for each test. Click a student's name for their full report card.</CardDescription>
            </div>
            <Button onClick={downloadClassReport} disabled={performanceData.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Download PDF Report
            </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {performanceData.length > 0 && allTests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 font-bold">Student Name</TableHead>
                {allTests.map((t, i) => (
                  <TableHead key={i} title={t.name} className="min-w-[150px] whitespace-nowrap text-center">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                  </TableHead>
                ))}
                 <TableHead className="sticky right-0 bg-card z-10 font-bold text-right">Average Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((studentRow) => (
                <TableRow key={studentRow.studentId}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">
                    <button className="text-primary hover:underline flex items-center gap-1">
                       <User className="h-4 w-4"/> {studentRow.studentName}
                    </button>
                  </TableCell>
                  {allTests.map((t, i) => {
                    const score = studentRow.testScores[t.name];
                    return <TableCell key={i} className="text-center">{score === undefined ? '—' : `${score.toFixed(1)}%`}</TableCell>;
                  })}
                  <TableCell className="font-bold text-primary sticky right-0 bg-card z-10 text-right">{studentRow.averageScore.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <div className="text-center py-16">
                 <p className="text-muted-foreground">No test performance data found for students in this class yet.</p>
                 <p className="text-xs text-muted-foreground mt-2">Create and publish tests to this class to see analytics here.</p>
            </div>
        )}
      </CardContent>
       <CardFooter>
          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0"/>
            <span>Scores shown are percentages (%).</span>
          </div>
       </CardFooter>
    </Card>
  );
}
