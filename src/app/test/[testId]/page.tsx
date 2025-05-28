
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox'; // Added for multiple-choice
import { Input } from '@/components/ui/input'; // Added for fill-in-the-blank


// Mock data - replace with actual data fetching
const mockQuestions = [
  { 
    id: 'q1', 
    subject: 'Biology',
    chapter: 'Cell Structure & Function',
    text: 'What is the powerhouse of the cell?', 
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'], 
    type: 'single-choice',
    correctAnswer: 'Mitochondria'
  },
  { 
    id: 'q2', 
    subject: 'Physics',
    chapter: 'Force & Motion',
    text: 'Which of the following are vector quantities? (Select all that apply)', 
    options: ['Speed', 'Velocity', 'Distance', 'Displacement', 'Mass'], 
    type: 'multiple-choice',
    correctAnswer: ['Velocity', 'Displacement']
  },
  { 
    id: 'q3', 
    subject: 'Chemistry',
    chapter: 'Fundamental Concepts',
    text: 'The chemical symbol for Gold is ___.', 
    type: 'fill-in-the-blank',
    correctAnswer: 'Au'
  },
  { 
    id: 'q4', 
    subject: 'English',
    chapter: 'Grammar',
    text: 'The statement "The sun rises in the west" is true.', 
    type: 'true-false',
    correctAnswer: 'False'
  },
  {
    id: 'q5',
    subject: 'Logical Reasoning',
    chapter: 'Logical Deductions',
    text: 'If all cats are mammals, and all mammals are animals, are all cats animals?',
    options: ['Yes', 'No', 'Cannot be determined'],
    type: 'single-choice',
    correctAnswer: 'Yes'
  }
];

const TOTAL_TEST_DURATION = 30 * 60; // 30 minutes in seconds

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_DURATION);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Temporary fix for hydration mismatch with Math.random or new Date.
    // This ensures timer starts client-side.
    const initialTime = TOTAL_TEST_DURATION;
    setTimeLeft(initialTime);

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
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    setProgress(((currentQuestionIndex + 1) / mockQuestions.length) * 100);
  }, [currentQuestionIndex]);

  const currentQuestion = mockQuestions[currentQuestionIndex];

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
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Logic to submit answers
    console.log('Submitting answers for test:', testId, answers);
    // Store answers or pass to review page via state/query params if small, or context/store for larger data
    // For now, just navigate. The review page will use its own mock data.
    router.push(`/test/${testId}/review`); 
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl">Test: {currentQuestion.subject} - {currentQuestion.chapter}</CardTitle>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
              <Timer className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="w-full h-2" />
          <CardDescription className="mt-2">
            Question {currentQuestionIndex + 1} of {mockQuestions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] py-6">
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
              {['True', 'False'].map((option, index) => (
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
          {currentQuestionIndex === mockQuestions.length - 1 ? (
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
  );
}
