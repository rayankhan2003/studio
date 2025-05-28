
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckSquare, Clock } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Subjects, syllabus, type Subject as SubjectType, type Chapter as ChapterType } from '@/lib/syllabus';

// Default values if query params are not present
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_TOTAL_TEST_DURATION = 10 * 60; // 10 questions * 60 seconds

interface MockQuestion {
  id: string;
  subject: SubjectType;
  chapter: string;
  text: string;
  options?: string[];
  type: 'single-choice' | 'multiple-choice' | 'fill-in-the-blank' | 'true-false';
  correctAnswer: string | string[];
}

interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  overallScorePercentage: number;
  subjectScores: Partial<Record<SubjectType, number>>; // Subject average percentages for THIS test
  chapterScores: Partial<Record<SubjectType, Record<string, number>>>; // Chapter percentages for THIS test
  rawQuestions: Array<{
    id: string;
    subject: SubjectType;
    chapter: string;
    text: string;
    type: MockQuestion['type'];
    options?: string[];
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
  }>;
}


// Helper to generate mock questions
const generateMockQuestions = (count: number): MockQuestion[] => {
  const allSubjectKeys = Object.keys(Subjects) as (keyof typeof Subjects)[];
  
  return Array.from({ length: count }, (_, i) => {
    const subjectKey = allSubjectKeys[i % allSubjectKeys.length];
    const subjectName = Subjects[subjectKey];
    const chaptersForSubject = syllabus[subjectName as SubjectType] || [{ name: 'General', topics: [] }];
    const chapter = chaptersForSubject[i % chaptersForSubject.length] || { name: 'General', topics: [] };

    const questionType = ['single-choice', 'multiple-choice', 'fill-in-the-blank', 'true-false'][i % 4];
    let options: string[] | undefined = undefined;
    let correctAnswer: string | string[];

    switch (questionType) {
      case 'single-choice':
        options = [`Option A for Q${i+1}`, `Correct Answer for Q${i+1}`, `Option C for Q${i+1}`, `Option D for Q${i+1}`];
        correctAnswer = options[1]; // Make the second option correct for variety
        break;
      case 'multiple-choice':
        options = [`Correct Opt W for Q${i+1}`, `Correct Opt X for Q${i+1}`, `Option Y for Q${i+1}`, `Option Z for Q${i+1}`, `Option V for Q${i+1}`];
        correctAnswer = [options[0], options[1]];
        break;
      case 'fill-in-the-blank':
        correctAnswer = `AnswerForQ${i+1}`;
        break;
      case 'true-false':
        options = ['True', 'False'] 
        correctAnswer = (i % 2 === 0) ? 'True' : 'False'; // Alternate correct answer
        break;
      default: // Should not happen with current types
        options = [`Opt A${i}`, `Opt B${i}`];
        correctAnswer = `Opt A${i}`;
    }

    return { 
      id: `q${i + 1}`, 
      subject: subjectName,
      chapter: chapter.name,
      text: `This is mock question number ${i + 1} for ${subjectName} - ${chapter.name}. What is the answer?`, 
      options: options, 
      type: questionType as MockQuestion['type'],
      correctAnswer: correctAnswer
    };
  });
};


export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string; // e.g., "custom-test-session"

  const parsedQuestionCount = parseInt(searchParams.get('questionCount') || '') || DEFAULT_QUESTION_COUNT;
  const parsedTotalDuration = parseInt(searchParams.get('totalDuration') || '') || DEFAULT_TOTAL_TEST_DURATION;

  const questions = useMemo(() => generateMockQuestions(parsedQuestionCount), [parsedQuestionCount]);
  const TOTAL_TEST_DURATION = useMemo(() => parsedTotalDuration, [parsedTotalDuration]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [progress, setProgress] = useState(0);
  const [timerDisplayMode, setTimerDisplayMode] = useState<'remaining' | 'total'>('remaining');
  const [testSubmitted, setTestSubmitted] = useState(false);

  useEffect(() => {
    setTimeLeft(TOTAL_TEST_DURATION); 

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!testSubmitted) handleSubmit(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOTAL_TEST_DURATION, testSubmitted]); 

  useEffect(() => {
    if (questions.length === 0) {
        setProgress(0);
        return;
    }
    const attemptedQuestionsCount = questions.filter(q => isQuestionAttempted(q.id)).length;
    setProgress((attemptedQuestionsCount / questions.length) * 100);
  }, [answers, questions]);

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

  const isAnswerCorrect = (question: MockQuestion, userAnswer: string | string[] | undefined): boolean => {
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


  const handleSubmit = () => {
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

      // Initialize subject if not present
      if (!chapterResults[q.subject]) chapterResults[q.subject] = {};
      if (!subjectResults[q.subject]) subjectResults[q.subject] = { correct: 0, total: 0 };
      
      // Initialize chapter if not present
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
      });
    });

    const finalChapterScores: StoredTestReport['chapterScores'] = {};
    for (const subjectKey in chapterResults) {
      const subject = subjectKey as SubjectType;
      finalChapterScores[subject] = {};
      for (const chapterName in chapterResults[subject]) {
        const res = chapterResults[subject][chapterName];
        finalChapterScores[subject]![chapterName] = res.total > 0 ? (res.correct / res.total) * 100 : 0;
      }
    }

    const finalSubjectScores: StoredTestReport['subjectScores'] = {};
    for (const subjectKey in subjectResults) {
      const subject = subjectKey as SubjectType;
      const res = subjectResults[subject];
      finalSubjectScores[subject] = res.total > 0 ? (res.correct / res.total) * 100 : 0;
    }
    
    const overallScorePercentage = overallTotal > 0 ? (overallCorrect / overallTotal) * 100 : 0;

    const existingHistoryString = localStorage.getItem('prepwiseTestHistory');
    const existingHistory: StoredTestReport[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
    
    const newTestReport: StoredTestReport = {
      id: `${testId}-${Date.now()}`,
      name: `Test #${existingHistory.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      overallScorePercentage: overallScorePercentage,
      subjectScores: finalSubjectScores,
      chapterScores: finalChapterScores,
      rawQuestions: rawQuestionsReport,
    };

    existingHistory.push(newTestReport);
    localStorage.setItem('prepwiseTestHistory', JSON.stringify(existingHistory));
    
    // For review page, pass the ID of the just-submitted test.
    // The review page can then fetch this specific report from localStorage.
    router.push(`/test/${newTestReport.id}/review`); 
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuestionAttempted = (questionId: string): boolean => {
    const answerExists = Object.prototype.hasOwnProperty.call(answers, questionId);
    if (!answerExists) return false;
    
    const answerValue = answers[questionId];
    if (Array.isArray(answerValue)) return answerValue.length > 0;
    if (typeof answerValue === 'string') return answerValue.trim() !== ''; 
    
    return false; 
  };

  const toggleTimerDisplay = () => {
    setTimerDisplayMode(prev => prev === 'remaining' ? 'total' : 'remaining');
  };

  if (questions.length === 0) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Loading Test...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please wait while the test is being prepared or check your configuration.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-6xl mx-auto py-4 md:py-8">
      <ScrollArea className="w-full md:w-40 h-auto md:h-[calc(100vh-12rem)] py-3 rounded-lg bg-card border shadow-sm flex-shrink-0">
        <div className="px-2 grid grid-cols-3 gap-2">
          {questions.map((question, index) => (
            <Button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              variant="outline"
              className={cn(
                "aspect-square w-full h-auto flex items-center justify-center rounded-md border text-sm font-medium transition-all duration-200 ease-in-out", 
                isQuestionAttempted(question.id) ? 
                  'bg-green-500 border-green-600 hover:bg-green-600/90 text-white' : 
                  'bg-yellow-300 border-yellow-400 hover:bg-yellow-400/90 text-yellow-800',
                currentQuestionIndex === index ? 'ring-2 ring-primary ring-offset-background ring-offset-2' : ''
              )}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="flex-1 min-w-0">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl">Test: {currentQuestion.subject} - {currentQuestion.chapter}</CardTitle>
              <Button 
                variant="ghost" 
                onClick={toggleTimerDisplay} 
                className="p-2 border rounded-md bg-muted hover:bg-muted/80"
                aria-label="Toggle timer display mode"
              >
                <Clock className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-semibold tabular-nums">
                  {timerDisplayMode === 'remaining' ? formatTime(timeLeft) : formatTime(TOTAL_TEST_DURATION)}
                </span>
              </Button>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <CardDescription className="mt-2">
              Question {currentQuestionIndex + 1} of {questions.length} ({isQuestionAttempted(currentQuestion.id) ? 'Attempted' : 'Unattempted'})
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[250px] md:min-h-[300px] py-6">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
            
            {currentQuestion.type === 'single-choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <Checkbox
                      id={`${currentQuestion.id}-option-${index}`}
                      checked={(answers[currentQuestion.id] as string[] || []).includes(option)}
                      onCheckedChange={(checked) => handleMultipleChoiceChange(currentQuestion.id, option, !!checked)}
                    />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'fill-in-the-blank' && (
               <Input 
                  type="text" 
                  value={(answers[currentQuestion.id] as string) || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary text-base"
                  placeholder="Type your answer here"
               />
            )}

            {currentQuestion.type === 'true-false' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {(currentQuestion.options || ['True', 'False']).map((option, index) => ( 
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={testSubmitted}>
                <CheckSquare className="mr-2 h-4 w-4" /> Submit Test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

