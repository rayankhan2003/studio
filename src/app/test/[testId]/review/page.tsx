'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data - replace with actual data from test submission
const mockReviewData = {
  testId: 'sample-test',
  score: '75%',
  questions: [
    { 
      id: 'q1', 
      text: 'What is the powerhouse of the cell?', 
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'], 
      selectedAnswer: 'Mitochondria', 
      correctAnswer: 'Mitochondria',
      explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.'
    },
    { 
      id: 'q2', 
      text: 'Select all prime numbers:', 
      options: ['2', '4', '7', '9', '11'], 
      selectedAnswer: ['2', '7'], // Example: User missed one
      correctAnswer: ['2', '7', '11'],
      explanation: 'Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. 4 is divisible by 2. 9 is divisible by 3.'
    },
     { 
      id: 'q3', 
      text: 'The chemical symbol for water is ___.',
      selectedAnswer: 'H2O', 
      correctAnswer: 'H2O',
      explanation: 'Water is a chemical compound with the chemical formula H2O.'
    },
    { 
      id: 'q4', 
      text: 'The Earth is flat.',
      selectedAnswer: 'False', 
      correctAnswer: 'False',
      explanation: 'Scientific evidence overwhelmingly shows that the Earth is an oblate spheroid.'
    },
  ],
};

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  // In a real app, fetch reviewData based on testId
  const reviewData = mockReviewData;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Test/Dashboard
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Test Review: {reviewData.testId}</CardTitle>
          <CardDescription className="text-lg">
            Your Score: <span className="font-bold text-primary">{reviewData.score}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {reviewData.questions.map((q, index) => (
        <Card key={q.id} className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Question {index + 1}: {q.text}</CardTitle>
          </CardHeader>
          <CardContent>
            {q.options && ( // For multiple choice / single choice
              <ul className="space-y-2 mb-4">
                {q.options.map((option) => {
                  const isSelected = Array.isArray(q.selectedAnswer) ? q.selectedAnswer.includes(option) : q.selectedAnswer === option;
                  const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(option) : q.correctAnswer === option;
                  
                  let itemClass = "p-3 border rounded-md flex items-center justify-between";
                  if (isCorrect) itemClass += " bg-green-100 border-green-400";
                  if (isSelected && !isCorrect) itemClass += " bg-red-100 border-red-400";
                  if (isSelected && isCorrect) itemClass += " border-2 border-green-600";


                  return (
                    <li key={option} className={itemClass}>
                      <span>{option}</span>
                      <div>
                        {isSelected && (isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />)}
                        {!isSelected && isCorrect && <span className="text-sm text-green-700 font-medium">(Correct Answer)</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {!q.options && ( // For fill-in-the-blank / true-false etc where options might not be listed like MCQs
                 <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Your Answer:</strong> {Array.isArray(q.selectedAnswer) ? q.selectedAnswer.join(', ') : q.selectedAnswer}</p>
                    <p className={`text-sm font-semibold ${q.selectedAnswer === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                        <strong>Correct Answer:</strong> {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                        {q.selectedAnswer === q.correctAnswer ? <CheckCircle2 className="inline ml-1 h-4 w-4" /> : <XCircle className="inline ml-1 h-4 w-4" />}
                    </p>
                 </div>
            )}

            {q.explanation && (
              <div className="mt-4 p-3 bg-muted/70 rounded-md border border-dashed">
                <h4 className="font-semibold text-sm mb-1">Explanation:</h4>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center mt-8">
        <Link href="/dashboard">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
