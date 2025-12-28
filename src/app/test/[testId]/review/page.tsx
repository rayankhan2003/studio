
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Curriculum = 'MDCAT' | 'O Level' | 'A Level';

interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  curriculum: Curriculum;
  testType: 'Custom' | 'Past Paper';
  overallScorePercentage: number;
  subjectScores: Partial<Record<string, number>>;
  chapterScores: Partial<Record<string, Record<string, number>>>;
  rawQuestions: Array<{
    id: string;
    subject: string;
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

const QuestionReviewCard = React.memo(({ question, index }: { question: StoredTestReport['rawQuestions'][0], index: number }) => {
  return (
    <Card className={`shadow-md ${question.isCorrect ? 'border-green-500' : 'border-red-500'} border-l-4`}>
        <CardHeader className={`${question.isCorrect ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Question {index + 1}: {question.text.replace(/^(Q|Question)?\s*\d+[\.:]?\s*/, '').trim()}</CardTitle>
            {question.isCorrect ? 
              <CheckCircle2 className="h-7 w-7 text-green-600 flex-shrink-0 ml-2" /> : 
              <XCircle className="h-7 w-7 text-red-600 flex-shrink-0 ml-2" />}
          </div>
          <CardDescription>Subject: {question.subject} | Chapter: {question.chapter}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Your Answer:</h4>
            <div className={`p-3 border rounded-md text-sm ${question.isCorrect ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}`}>
              {Array.isArray(question.selectedAnswer) ? question.selectedAnswer.join(', ') || <span className="italic text-muted-foreground">Not answered</span> : question.selectedAnswer || <span className="italic text-muted-foreground">Not answered</span>}
            </div>
          </div>

          {!question.isCorrect && (
            <div>
              <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Correct Answer:</h4>
              <div className="p-3 border border-green-400 bg-green-100/50 rounded-md text-sm">
                {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
              </div>
            </div>
          )}

          {(question.type === 'single-choice' || question.type === 'multiple-choice' || question.type === 'true-false') && question.options && question.options.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Options:</h4>
              <ul className="space-y-1 text-sm">
                {question.options.map((option, optIndex) => {
                  const isSelectedByUser = Array.isArray(question.selectedAnswer) ? question.selectedAnswer.includes(option) : question.selectedAnswer === option;
                  const isActuallyCorrect = Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(option) : question.correctAnswer === option;
                  
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
                    <li key={`${question.id}-opt-${optIndex}`} className={itemClass}>
                      <span>{option}</span>
                      {indicator}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
           {question.explanation && (
              <div className="mt-3 pt-3 border-t">
                  <h4 className="font-semibold text-sm mb-1 text-muted-foreground flex items-center"><Info className="h-4 w-4 mr-1 text-blue-500"/> Explanation:</h4>
                  <p className="text-sm p-2 bg-blue-50/50 border border-blue-200 rounded-md">{question.explanation}</p>
              </div>
          )}
        </CardContent>
      </Card>
  );
});
QuestionReviewCard.displayName = 'QuestionReviewCard';

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
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
         <Button asChild size="sm">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-3xl text-primary">{reviewData.name}</CardTitle>
          <CardDescription className="text-lg">
            Test Date: {reviewData.date} | Your Score: <span className="font-bold text-primary">{reviewData.overallScorePercentage.toFixed(1)}%</span> | Curriculum: <span className="font-semibold">{reviewData.curriculum}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {reviewData.rawQuestions.map((q, index) => (
        <QuestionReviewCard key={q.id} question={q} index={index} />
      ))}
      <div className="flex justify-center mt-8">
        <Button asChild size="lg" variant="outline">
          <Link href="/analytics">View Full Analytics</Link>
        </Button>
      </div>
    </div>
  );
}
