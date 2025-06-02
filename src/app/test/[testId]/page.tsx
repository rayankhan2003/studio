
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { type Subject as SubjectType, syllabus } from '@/lib/syllabus';
import { mockQuestionsDb, type MockQuestionDefinition } from '@/lib/mock-questions-db';
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

const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_TOTAL_TEST_DURATION = 10 * 60; // 10 questions * 60 seconds per question

interface QuestionForTest extends MockQuestionDefinition {}

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
    type: QuestionForTest['type'];
    options?: string[];
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation?: string;
  }>;
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
  selectedSubjectsParam: string | null,
  selectedChaptersParam: string | null,
  sourceParam: string | null
): QuestionForTest[] => {
  let filteredQuestions: MockQuestionDefinition[] = [];

  if (sourceParam && sourceParam.startsWith('mdcat-')) {
    const targetPerSubject = Math.ceil(questionCount / Object.keys(syllabus).length);
    const subjectsInSyllabus = Object.keys(syllabus) as SubjectType[];

    subjectsInSyllabus.forEach(subject => {
      const subjectQuestions = mockQuestionsDb.filter(q => q.subject === subject);
      filteredQuestions.push(...shuffleArray(subjectQuestions).slice(0, targetPerSubject));
    });
     if (filteredQuestions.length < questionCount && mockQuestionsDb.length > 0) {
        const needed = questionCount - filteredQuestions.length;
        const additionalQs = shuffleArray(mockQuestionsDb.filter(q => !filteredQuestions.find(fq => fq.id === q.id))).slice(0, needed);
        filteredQuestions.push(...additionalQs);
    }
    filteredQuestions = shuffleArray(filteredQuestions).slice(0, questionCount);

  } else if (selectedSubjectsParam && selectedChaptersParam) {
    const chapterSelections = selectedChaptersParam.split(','); 

    const chapterMap: Record<SubjectType, Set<string>> = {} as any;
    chapterSelections.forEach(cs => {
      const [subj, chap] = cs.split(':');
      if (subj && chap) {
        if (!chapterMap[subj as SubjectType]) {
          chapterMap[subj as SubjectType] = new Set();
        }
        chapterMap[subj as SubjectType].add(chap);
      }
    });

    mockQuestionsDb.forEach(q => {
      if (chapterMap[q.subject]?.has(q.chapter)) {
        filteredQuestions.push(q);
      }
    });
  } else {
    // Fallback if no specific subject/chapter selection, or not an MDCAT test
    // This case might need review depending on desired behavior for direct access without params
    filteredQuestions = shuffleArray(mockQuestionsDb);
  }

  if (filteredQuestions.length === 0) return []; 

  // Ensure we don't try to slice more questions than available
  const actualCountToSlice = Math.min(questionCount, filteredQuestions.length);
  return shuffleArray(filteredQuestions).slice(0, actualCountToSlice);
};


export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string; 

  const parsedQuestionCount = parseInt(searchParams.get('questionCount') || '') || DEFAULT_QUESTION_COUNT;
  const parsedTotalDuration = parseInt(searchParams.get('totalDuration') || '') || DEFAULT_TOTAL_TEST_DURATION;
  const testNameFromParams = searchParams.get('testName') || `Test (${testId.replace('-session', '')})`;
  const subjectsParam = searchParams.get('subjects');
  const chaptersParam = searchParams.get('chapters');
  const sourceParam = searchParams.get('source'); 

  const questions = useMemo(() =>
    getQuestionsForTest(parsedQuestionCount, subjectsParam, chaptersParam, sourceParam),
  [parsedQuestionCount, subjectsParam, chaptersParam, sourceParam]);

  const TOTAL_TEST_DURATION = useMemo(() => parsedTotalDuration, [parsedTotalDuration]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [progress, setProgress] = useState(0);
  const [timerDisplayMode, setTimerDisplayMode] = useState<'remaining' | 'total'>('remaining');
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [isConfirmSubmitDialogOpen, setIsConfirmSubmitDialogOpen] = useState(false);
  const [unansweredQuestionsCount, setUnansweredQuestionsCount] = useState(0);

  const isQuestionAttempted = (questionId: string): boolean => {
    const answerExists = Object.prototype.hasOwnProperty.call(answers, questionId);
    if (!answerExists) return false;
    const answerValue = answers[questionId];
    if (Array.isArray(answerValue)) return answerValue.length > 0;
    if (typeof answerValue === 'string') return answerValue.trim() !== '';
    return false;
  };
  
  useEffect(() => {
    setTimeLeft(TOTAL_TEST_DURATION);
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!testSubmitted) handleSubmitTest(true); // Auto-submit when timer ends
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [TOTAL_TEST_DURATION, testSubmitted]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (questions.length === 0) {
        setProgress(0);
        return;
    }
    const attemptedQuestionsCount = questions.filter(q => isQuestionAttempted(q.id)).length;
    setProgress((attemptedQuestionsCount / questions.length) * 100);
  }, [answers, questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  };

  const handleMultipleChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setAnswers((prevAnswers) => {
      const existingAnswers = (prevAnswers[questionId] as string[] || []);
      if (checked) {
        return { ...prevAnswers, [questionId]: [...existingAnswers, optionValue].sort() };
      } else {
        return { ...prevAnswers, [questionId]: existingAnswers.filter(ans => ans !== optionValue).sort() };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswerCorrect = (question: QuestionForTest, userAnswer: string | string[] | undefined): boolean => {
    if (userAnswer === undefined) return false;

    if (question.type === 'multiple-choice') {
      if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
      if (userAnswer.length !== question.correctAnswer.length) return false;
      const sortedUserAnswer = [...userAnswer].sort();
      const sortedCorrectAnswer = [...question.correctAnswer].sort();
      return sortedUserAnswer.every((val, index) => val === sortedCorrectAnswer[index]);
    }
    return userAnswer === question.correctAnswer;
  };

  const proceedToSubmitTest = () => {
    if (testSubmitted) return;
    setTestSubmitted(true);

    const chapterResults: Record<SubjectType, Record<string, { correct: number, total: number }>> = {} as any;
    const subjectResults: Record<SubjectType, { correct: number, total: number }> = {} as any;
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
      const subject = subjectKey as SubjectType;
      finalChapterScores[subject] = {};
      for (const chapterName in chapterResults[subject]) {
        const res = chapterResults[subject][chapterName];
        finalChapterScores[subject]![chapterName] = res.total > 0 ? parseFloat(((res.correct / res.total) * 100).toFixed(1)) : 0;
      }
    }

    const finalSubjectScores: StoredTestReport['subjectScores'] = {};
    for (const subjectKey in subjectResults) {
      const subject = subjectKey as SubjectType;
      const res = subjectResults[subject];
      finalSubjectScores[subject] = res.total > 0 ? parseFloat(((res.correct / res.total) * 100).toFixed(1)) : 0;
    }

    const overallScorePercentage = overallTotal > 0 ? parseFloat(((overallCorrect / overallTotal) * 100).toFixed(1)) : 0;

    const existingHistoryString = localStorage.getItem('prepwiseTestHistory');
    const existingHistory: StoredTestReport[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];

    const reportId = `${testId.replace('-session', '')}-${Date.now()}`;
    let determinedTestType: 'custom' | 'mdcat' = 'custom';
    let mdcatYearVal: number | undefined = undefined;

    if (sourceParam && sourceParam.startsWith('mdcat-')) {
      determinedTestType = 'mdcat';
      mdcatYearVal = parseInt(sourceParam.split('-')[1]) || undefined;
    }

    const newTestReport: StoredTestReport = {
      id: reportId,
      name: testNameFromParams,
      date: new Date().toISOString().split('T')[0],
      testType: determinedTestType,
      mdcatYear: mdcatYearVal,
      overallScorePercentage: overallScorePercentage,
      subjectScores: finalSubjectScores,
      chapterScores: finalChapterScores,
      rawQuestions: rawQuestionsReport,
    };

    existingHistory.push(newTestReport);
    localStorage.setItem('prepwiseTestHistory', JSON.stringify(existingHistory));

    router.push(`/test/${reportId}/review`);
  };

  const handleSubmitTest = (isAutoSubmit = false) => {
    if (testSubmitted) return;

    const attemptedQuestionsCount = questions.filter(q => isQuestionAttempted(q.id)).length;
    const localUnansweredCount = questions.length - attemptedQuestionsCount;

    if (!isAutoSubmit && localUnansweredCount > 0) {
      setUnansweredQuestionsCount(localUnansweredCount);
      setIsConfirmSubmitDialogOpen(true);
      return;
    }
    proceedToSubmitTest();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimerDisplay = () => {
    setTimerDisplayMode(prev => prev === 'remaining' ? 'total' : 'remaining');
  };

  if (questions.length === 0 && (testId.startsWith('custom-session') || testId.startsWith('mdcat-session'))) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] py-12 px-4">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">No Questions Available</CardTitle>
            <CardDescription>
              We couldn't find any questions matching your criteria for this test. This might be due to a very specific filter or no mock questions being available for the selected combination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please try adjusting your selections on the custom test page or ensure mock data is available.</p>
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
          {questions.map((question, index) => {
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
          })}
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
            <h2 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestion?.text}</h2>

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

    
