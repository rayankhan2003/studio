'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// Mock data - replace with actual data fetching
const mockQuestions = [
  { id: 'q1', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'], type: 'single-choice' },
  { id: 'q2', text: 'Select all prime numbers:', options: ['2', '4', '7', '9', '11'], type: 'multiple-choice' },
  { id: 'q3', text: 'The chemical symbol for water is ___.', type: 'fill-in-the-blank' },
  { id: 'q4', text: 'The Earth is flat.', type: 'true-false' },
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
    if (timeLeft <= 0) {
      // Auto-submit or handle time up
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    setProgress(((currentQuestionIndex + 1) / mockQuestions.length) * 100);
  }, [currentQuestionIndex]);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
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
    console.log('Submitting answers:', answers);
    router.push(`/test/${testId}/review`); // Navigate to review page
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
            <CardTitle className="text-2xl">Test: {testId}</CardTitle>
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
        <CardContent className="min-h-[300px]">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
          {currentQuestion.type === 'single-choice' && (
            <RadioGroup
              value={answers[currentQuestion.id] as string || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                  <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-base cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {/* TODO: Implement other question types (multiple-choice, fill-in-the-blank, true-false) */}
          {currentQuestion.type === 'fill-in-the-blank' && (
             <input 
                type="text" 
                value={answers[currentQuestion.id] as string || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
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
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
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
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
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
