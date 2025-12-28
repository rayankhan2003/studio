
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { mockQuestionsDb, type MockQuestionDefinition } from '@/lib/mock-questions-db';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Curriculum = 'MDCAT' | 'O Level' | 'A Level';

interface QuestionForTest extends MockQuestionDefinition {}

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
    type: QuestionForTest['type'];
    options?: string[];
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation?: string;
  }>;
  userId?: string; // To associate with the user
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const getQuestionsForTest = (
  questionCount: number,
  curriculum: Curriculum,
  selectedSubjectsParam: string | null,
  selectedChaptersParam: string | null
): QuestionForTest[] => {
  const customQuestionsRaw = typeof window !== 'undefined' ? localStorage.getItem('customQuestionBank') : null;
  const customQuestions: MockQuestionDefinition[] = customQuestionsRaw ? JSON.parse(customQuestionsRaw) : [];
  
  const questionMap = new Map<string, MockQuestionDefinition>();
  [...mockQuestionsDb, ...customQuestions].forEach(q => {
    const normalizedText = q.text.replace(/^(Q|Question)?\s*\d+[\.:]?\s*/, '').trim().toLowerCase();
    questionMap.set(normalizedText, q);
  });
  const allUniqueQuestions = Array.from(questionMap.values());
  
  let filteredQuestions: MockQuestionDefinition[] = allUniqueQuestions.filter(q => q.curriculum === curriculum);

  if (selectedSubjectsParam && selectedChaptersParam) {
    const chapterSelections = selectedChaptersParam.split(','); 

    const chapterMap: Record<string, Set<string>> = {} as any;
    chapterSelections.forEach(cs => {
      const [subj, chap] = cs.split(':');
      if (subj && chap) {
        if (!chapterMap[subj]) {
          chapterMap[subj] = new Set();
        }
        chapterMap[subj].add(chap);
      }
    });

    filteredQuestions = filteredQuestions.filter(q => {
        if (!q.subject || !q.chapter) return false;
        const subjectChapters = chapterMap[q.subject];
        return subjectChapters ? subjectChapters.has(q.chapter) : false;
    });
  }
  
  if (filteredQuestions.length === 0) return []; 

  const actualCountToSlice = Math.min(questionCount, filteredQuestions.length);
  return shuffleArray(filteredQuestions).slice(0, actualCountToSlice);
};


export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const testId = params.testId as string; 

  const parsedQuestionCount = parseInt(searchParams.get('questionCount') || '') || 10;
  const parsedTotalDuration = parseInt(searchParams.get('totalDuration') || '') || 600;
  const testNameFromParams = searchParams.get('testName') || `Test`;
  const curriculum = (searchParams.get('curriculum') as Curriculum) || 'MDCAT';
  const subjectsParam = searchParams.get('subjects');
  const chaptersParam = searchParams.get('chapters');
  const testType = (searchParams.get('testType') as 'Custom' | 'Past Paper') || 'Custom';

  const questions = useMemo(() =>
    getQuestionsForTest(parsedQuestionCount, curriculum, subjectsParam, chaptersParam),
  [parsedQuestionCount, curriculum, subjectsParam, chaptersParam]);

  const TOTAL_TEST_DURATION = useMemo(() => parsedTotalDuration, [parsedTotalDuration]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [progress, setProgress] = useState(0);
  const [timerDisplayMode, setTimerDisplayMode] = useState<'remaining' | 'total'>('remaining');
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [isConfirmSubmitDialogOpen, setIsConfirmSubmitDialogOpen] = useState(false);
  const [unansweredQuestionsCount, setUnansweredQuestionsCount] = useState(0);

  const isQuestionAttempted = useCallback((questionId: string): boolean => {
    if (!questionId) return false;
    const answerExists = Object.prototype.hasOwnProperty.call(answers, questionId);
    if (!answerExists) return false;
    const answerValue = answers[questionId];
    if (Array.isArray(answerValue)) return answerValue.length > 0;
    if (typeof answerValue === 'string') return answerValue.trim() !== '';
    return false;
  }, [answers]);
  
  useEffect(() => {
    if (questions.length === 0) {
        setProgress(0);
        return;
    }
    const attemptedQuestionsCount = questions.filter(q => isQuestionAttempted(q.id)).length;
    setProgress((attemptedQuestionsCount / questions.length) * 100);
  }, [answers, questions, isQuestionAttempted]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  }, []);

  const handleMultipleChoiceChange = useCallback((questionId: string, optionValue: string, checked: boolean) => {
    setAnswers((prevAnswers) => {
      const existingAnswers = (prevAnswers[questionId] as string[] || []);
      if (checked) {
        return { ...prevAnswers, [questionId]: [...existingAnswers, optionValue].sort() };
      } else {
        return { ...prevAnswers, [questionId]: existingAnswers.filter(ans => ans !== optionValue).sort() };
      }
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const isAnswerCorrect = useCallback((question: QuestionForTest, userAnswer: string | string[] | undefined): boolean => {
    if (userAnswer === undefined) return false;
    
    // Ensure correctAnswer is always an array for uniform comparison
    const correctAnswerAsArray = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    if (question.type === 'multiple-choice') {
      if (!Array.isArray(userAnswer)) return false;
      if (userAnswer.length !== correctAnswerAsArray.length) return false;
      const sortedUserAnswer = [...userAnswer].sort();
      const sortedCorrectAnswer = [...correctAnswerAsArray].sort();
      return sortedUserAnswer.every((val, index) => val === sortedCorrectAnswer[index]);
    }
    
    // For single-choice, true-false, fill-in-the-blank
    if (typeof userAnswer === 'string') {
        return correctAnswerAsArray.length === 1 && userAnswer === correctAnswerAsArray[0];
    }

    return false;
  }, []);

  const proceedToSubmitTest = useCallback(() => {
    if (testSubmitted || !user) return; // Also check if user exists
    setTestSubmitted(true);

    const chapterResults: Record<string, Record<string, { correct: number, total: number }>> = {};
    const subjectResults: Record<string, { correct: number, total: number }> = {};
    let overallCorrect = 0;
    let overallTotal = 0;

    const rawQuestionsReport: StoredTestReport['rawQuestions'] = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const correct = isAnswerCorrect(q, userAnswer);

      if (!chapterResults[q.subject]) chapterResults[q.subject] = {};
      if (!subjectResults[q.subject]) subjectResults[q.subject] = { correct: 0, total: 0 };
      if (!chapterResults[q.subject][q.chapter]) chapterResults[q.subject][q.chapter] = { correct: 0, total: 0 };

      chapterResults[q.subject][q.chapter].total++;
      subjectResults[q.subject].total++;
      overallTotal++;

      if (correct) {
        chapterResults[q.subject][q.chapter].correct++;
        subjectResults[q.subject].correct++;
        overallCorrect++;
      }
      rawQuestionsReport.push({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        text: q.text,
        type: q.type,
        options: q.options,
        selectedAnswer: userAnswer || (q.type === 'multiple-choice' ? [] : ''),
        correctAnswer: q.correctAnswer,
        isCorrect: correct,
        explanation: q.explanation,
      });
    });

    const finalChapterScores: StoredTestReport['chapterScores'] = {};
    for (const subjectKey in chapterResults) {
      finalChapterScores[subjectKey] = {};
      for (const chapterName in chapterResults[subjectKey]) {
        const res = chapterResults[subjectKey][chapterName];
        finalChapterScores[subjectKey]![chapterName] = res.total > 0 ? parseFloat(((res.correct / res.total) * 100).toFixed(1)) : 0;
      }
    }

    const finalSubjectScores: StoredTestReport['subjectScores'] = {};
    for (const subjectKey in subjectResults) {
      const res = subjectResults[subjectKey];
      finalSubjectScores[subjectKey] = res.total > 0 ? parseFloat(((res.correct / res.total) * 100).toFixed(1)) : 0;
    }

    const overallScorePercentage = overallTotal > 0 ? parseFloat(((overallCorrect / overallTotal) * 100).toFixed(1)) : 0;

    const existingHistoryString = localStorage.getItem('prepwiseTestHistory');
    const existingHistory: StoredTestReport[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];

    const reportId = `${testId.replace('-session', '')}-${Date.now()}`;

    const newTestReport: StoredTestReport = {
      id: reportId,
      name: testNameFromParams,
      date: new Date().toISOString().split('T')[0],
      curriculum: curriculum,
      testType: testType,
      overallScorePercentage: overallScorePercentage,
      subjectScores: finalSubjectScores,
      chapterScores: finalChapterScores,
      rawQuestions: rawQuestionsReport,
      userId: user.email, // Associate the test with the logged-in user
    };

    existingHistory.push(newTestReport);
    localStorage.setItem('prepwiseTestHistory', JSON.stringify(existingHistory));

    router.push(`/test/${reportId}/review`);
  }, [testSubmitted, user, questions, answers, isAnswerCorrect, testId, testNameFromParams, curriculum, testType, router]);

  const handleSubmitTest = useCallback((isAutoSubmit = false) => {
    if (testSubmitted) return;

    const attemptedQuestionsCount = questions.filter(q => isQuestionAttempted(q.id)).length;
    const localUnansweredCount = questions.length - attemptedQuestionsCount;

    if (!isAutoSubmit && localUnansweredCount > 0) {
      setUnansweredQuestionsCount(localUnansweredCount);
      setIsConfirmSubmitDialogOpen(true);
      return;
    }
    proceedToSubmitTest();
  }, [testSubmitted, questions, isQuestionAttempted, proceedToSubmitTest]);
  
  useEffect(() => {
    setTimeLeft(TOTAL_TEST_DURATION);
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!testSubmitted) handleSubmitTest(true); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [TOTAL_TEST_DURATION, testSubmitted, handleSubmitTest]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimerDisplay = () => {
    setTimerDisplayMode(prev => prev === 'remaining' ? 'total' : 'remaining');
  };

  const questionNavigationPanel = useMemo(() => {
    return questions.map((question, index) => {
      const isCurrent = currentQuestionIndex === index;
      const attempted = isQuestionAttempted(question.id);
      return (
        <Button
          key={question.id}
          onClick={() => setCurrentQuestionIndex(index)}
          variant="outline"
          size="sm"
          className={cn(
            "aspect-square w-full h-auto flex items-center justify-center rounded-md border text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out p-1",
              isCurrent
              ? (attempted ? 'bg-primary/80 text-primary-foreground ring-2 ring-primary ring-offset-background ring-offset-2' : 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-background ring-offset-2')
              : attempted
                ? 'bg-green-500 border-green-600 hover:bg-green-600/90 text-white'
                : 'bg-card hover:bg-muted text-foreground',
            isCurrent && 'shadow-lg'
          )}
          title={`Question ${index + 1}${attempted ? ' (Attempted)' : ' (Unattempted)'}`}
        >
          {index + 1}
        </Button>
      );
    });
  }, [questions, currentQuestionIndex, isQuestionAttempted]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] py-12 px-4">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">No Questions Available</CardTitle>
            <CardDescription>
              We couldn't find any questions matching your criteria for this test ({curriculum}). This might be due to a very specific filter or no mock questions being available for the selected combination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please try adjusting your selections on the test creation page.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/test/custom')} className="w-full text-lg py-3">
              Back to Test Setup
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-7xl mx-auto py-4 md:py-8 px-2 sm:px-4">
      <ScrollArea className="w-full md:w-48 lg:w-56 h-auto md:max-h-[calc(100vh-12rem)] py-3 rounded-lg bg-card border shadow-sm flex-shrink-0 mb-4 md:mb-0">
        <div className="px-2 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5 gap-2">
          {questionNavigationPanel}
        </div>
      </ScrollArea>

      <div className="flex-1 min-w-0">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <CardTitle className="text-xl sm:text-2xl flex-grow leading-tight">
                {testNameFromParams}: {currentQuestion?.subject} - {currentQuestion?.chapter}
              </CardTitle>
              <Button
                variant="ghost"
                onClick={toggleTimerDisplay}
                className="p-2 border rounded-md bg-muted hover:bg-muted/80 w-full sm:w-auto text-sm sm:text-base"
                aria-label="Toggle timer display mode"
              >
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                <span className="text-base sm:text-lg font-semibold tabular-nums">
                  {timerDisplayMode === 'remaining' ? formatTime(timeLeft) : formatTime(TOTAL_TEST_DURATION)}
                </span>
              </Button>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <CardDescription className="mt-2 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length} ({isQuestionAttempted(currentQuestion?.id) ? 'Attempted' : 'Unattempted'})
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[250px] md:min-h-[300px] py-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestion?.text?.replace(/^(Q|Question)?\s*\d+[\.:]?\s*/, '').trim()}</h2>

            {currentQuestion?.type === 'single-choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-sm sm:text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion?.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <Checkbox
                      id={`${currentQuestion.id}-option-${index}`}
                      checked={(answers[currentQuestion.id] as string[] || []).includes(option)}
                      onCheckedChange={(checked) => handleMultipleChoiceChange(currentQuestion.id, option, !!checked)}
                    />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-sm sm:text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'fill-in-the-blank' && (
               <Input
                  type="text"
                  value={(answers[currentQuestion.id] as string) || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary text-sm sm:text-base"
                  placeholder="Type your answer here"
               />
            )}

            {currentQuestion?.type === 'true-false' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {(currentQuestion.options || ['True', 'False']).map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-sm sm:text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5">
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={() => handleSubmitTest(false)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5" disabled={testSubmitted}>
                <CheckSquare className="mr-2 h-4 w-4" /> Submit Test
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={isConfirmSubmitDialogOpen} onOpenChange={setIsConfirmSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You have {unansweredQuestionsCount} unanswered question(s). Are you sure you want to submit the test?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Questions</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsConfirmSubmitDialogOpen(false);
              proceedToSubmitTest();
            }}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
