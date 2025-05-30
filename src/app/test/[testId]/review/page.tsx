
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Subject as SubjectType } from '@/lib/syllabus';

// Interface for the structure of a single test report stored in localStorage
interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  testType: 'custom' | 'mdcat';
  mdcatYear?: number;
  overallScorePercentage: number;
  subjectScores: Partial<Record<SubjectType, number>>;
  chapterScores: Partial<Record<SubjectType, Record<string, number>>>;
  rawQuestions: Array<{
    id: string;
    subject: SubjectType;
    chapter: string;
    text: string;
    type: 'single-choice' | 'multiple-choice' | 'fill-in-the-blank' | 'true-false';
    options?: string[];
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string; 

  const [reviewData, setReviewData] = useState<StoredTestReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      const storedHistoryString = localStorage.getItem('prepwiseTestHistory');
      if (storedHistoryString) {
        const storedHistory: StoredTestReport[] = JSON.parse(storedHistoryString);
        const currentTestReport = storedHistory.find(report => report.id === testId);
        if (currentTestReport) {
          setReviewData(currentTestReport);
        } else {
          console.error(`Test report with ID ${testId} not found.`);
        }
      }
      setIsLoading(false);
    }
  }, [testId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle>Loading Review...</CardTitle></CardHeader>
          <CardContent><p>Please wait while we fetch your test review.</p></CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
          <Card className="w-full max-w-lg text-center shadow-xl">
            <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              <CardTitle className="text-2xl">Test Review Not Found</CardTitle>
              <CardDescription className="text-md">
                We couldn't find the details for this test. It might have been cleared or an error occurred.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-4">
                <Button variant="outline" onClick={() => router.push('/history')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                </Button>
                 <Link href="/dashboard" className="w-full">
                    <Button className="w-full">Go to Dashboard</Button>
                </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/history')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
         <Link href="/dashboard">
          <Button size="sm">Go to Dashboard</Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-3xl text-primary">{reviewData.name}</CardTitle>
          <CardDescription className="text-lg">
            Test Date: {reviewData.date} | Your Score: <span className="font-bold text-primary">{reviewData.overallScorePercentage.toFixed(1)}%</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {reviewData.rawQuestions.map((q, index) => (
        <Card key={q.id} className={`shadow-md ${q.isCorrect ? 'border-green-500' : 'border-red-500'} border-l-4`}>
          <CardHeader className={`${q.isCorrect ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Question {index + 1}: {q.text}</CardTitle>
              {q.isCorrect ? 
                <CheckCircle2 className="h-7 w-7 text-green-600 flex-shrink-0 ml-2" /> : 
                <XCircle className="h-7 w-7 text-red-600 flex-shrink-0 ml-2" />}
            </div>
            <CardDescription>Subject: {q.subject} | Chapter: {q.chapter}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Your Answer:</h4>
              <div className={`p-3 border rounded-md text-sm ${q.isCorrect ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}`}>
                {Array.isArray(q.selectedAnswer) ? q.selectedAnswer.join(', ') || <span className="italic text-muted-foreground">Not answered</span> : q.selectedAnswer || <span className="italic text-muted-foreground">Not answered</span>}
              </div>
            </div>

            {!q.isCorrect && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Correct Answer:</h4>
                <div className="p-3 border border-green-400 bg-green-100/50 rounded-md text-sm">
                  {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                </div>
              </div>
            )}

            {(q.type === 'single-choice' || q.type === 'multiple-choice' || q.type === 'true-false') && q.options && q.options.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Options:</h4>
                <ul className="space-y-1 text-sm">
                  {q.options.map((option, optIndex) => {
                    const isSelectedByUser = Array.isArray(q.selectedAnswer) ? q.selectedAnswer.includes(option) : q.selectedAnswer === option;
                    const isActuallyCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(option) : q.correctAnswer === option;
                    
                    let itemClass = "p-2 border rounded-md flex items-center justify-between";
                    let indicator = null;

                    if (isActuallyCorrect) itemClass += " border-green-500";
                    if (isSelectedByUser && !isActuallyCorrect) itemClass += " border-red-500";
                    if (isSelectedByUser && isActuallyCorrect) itemClass += " bg-green-100/70";
                    else if (isSelectedByUser) itemClass += " bg-red-100/70";
                    else if (isActuallyCorrect) itemClass += " bg-green-50/70";


                    if (isActuallyCorrect && isSelectedByUser) indicator = <CheckCircle2 className="h-4 w-4 text-green-600" title="Correct and Selected"/>;
                    else if (isSelectedByUser && !isActuallyCorrect) indicator = <XCircle className="h-4 w-4 text-red-600" title="Incorrectly Selected"/>;
                    else if (isActuallyCorrect) indicator = <CheckCircle2 className="h-4 w-4 text-green-600 opacity-60" title="Correct Option"/>;

                    return (
                      <li key={`${q.id}-opt-${optIndex}`} className={itemClass}>
                        <span>{option}</span>
                        {indicator}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
             {q.explanation && (
                <div className="mt-3 pt-3 border-t">
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground flex items-center"><Info className="h-4 w-4 mr-1 text-blue-500"/> Explanation:</h4>
                    <p className="text-sm p-2 bg-blue-50/50 border border-blue-200 rounded-md">{q.explanation}</p>
                </div>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center mt-8">
        <Link href="/analytics">
          <Button size="lg" variant="outline">View Full Analytics</Button>
        </Link>
      </div>
    </div>
  );
}

