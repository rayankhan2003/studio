
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
import { Subjects, syllabus, type Subject as SubjectType } from '@/lib/syllabus'; // For mock question generation

// Default values if query params are not present
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_TOTAL_TEST_DURATION = 10 * 60; // 10 questions * 60 seconds

// Helper to generate mock questions
const generateMockQuestions = (count: number) => {
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
        options = [`Option A${i}`, `Option B${i}`, `Option C${i}`, `Option D${i}`];
        correctAnswer = options[0];
        break;
      case 'multiple-choice':
        options = [`Option W${i}`, `Option X${i}`, `Option Y${i}`, `Option Z${i}`, `Option V${i}`];
        correctAnswer = [options[0], options[1]];
        break;
      case 'fill-in-the-blank':
        correctAnswer = `Answer${i}`;
        break;
      case 'true-false':
        options = ['True', 'False'] // Keep actual options for True/False
        correctAnswer = 'True';
        break;
      default:
        options = [`Opt A${i}`, `Opt B${i}`];
        correctAnswer = `Opt A${i}`;
    }

    return { 
      id: `q${i + 1}`, 
      subject: subjectName,
      chapter: chapter.name,
      text: `This is mock question number ${i + 1} for ${subjectName} - ${chapter.name}. What is the answer?`, 
      options: options, 
      type: questionType as 'single-choice' | 'multiple-choice' | 'fill-in-the-blank' | 'true-false',
      correctAnswer: correctAnswer
    };
  });
};


export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const parsedQuestionCount = parseInt(searchParams.get('questionCount') || '') || DEFAULT_QUESTION_COUNT;
  const parsedTotalDuration = parseInt(searchParams.get('totalDuration') || '') || DEFAULT_TOTAL_TEST_DURATION;

  const questions = useMemo(() => generateMockQuestions(parsedQuestionCount), [parsedQuestionCount]);
  const TOTAL_TEST_DURATION = useMemo(() => parsedTotalDuration, [parsedTotalDuration]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [progress, setProgress] = useState(0);
  const [timerDisplayMode, setTimerDisplayMode] = useState<'remaining' | 'total'>('remaining');

  useEffect(() => {
    setTimeLeft(TOTAL_TEST_DURATION); // Initialize or reset timeLeft when TOTAL_TEST_DURATION changes

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOTAL_TEST_DURATION]); // Re-run effect if TOTAL_TEST_DURATION changes (e.g. new test loaded)

  useEffect(() => {
    if (questions.length === 0) {
        setProgress(0);
        return;
    }
    const attemptedQuestions = questions.filter(q => isQuestionAttempted(q.id)).length;
    setProgress((attemptedQuestions / questions.length) * 100);
  }, [answers, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  };

  const handleMultipleChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setAnswers((prevAnswers) => {
      const existingAnswers = (prevAnswers[questionId] as string[] || []);
      if (checked) {
        return { ...prevAnswers, [questionId]: [...existingAnswers, optionValue] };
      } else {
        return { ...prevAnswers, [questionId]: existingAnswers.filter(ans => ans !== optionValue) };
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

  const handleSubmit = () => {
    console.log('Submitting answers for test:', testId, answers);
    // Navigate to review page, potentially passing answers or submission ID
    router.push(`/test/${testId}/review`); 
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
      {/* Question Navigation Sidebar */}
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

      {/* Main Test Content Card */}
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
                {(currentQuestion.options || ['True', 'False']).map((option, index) => ( // Ensure options for True/False
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
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
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
