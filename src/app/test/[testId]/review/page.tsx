
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft, Info } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Subjects } from '@/lib/syllabus';

// Mock data - replace with actual data from test submission
// User's selected answers should be passed here or fetched based on testId and submission
const mockUserAnswers = {
  q1: 'Mitochondria',
  q2: ['Velocity', 'Mass'], // User selected Mass incorrectly, missed Displacement
  q3: 'Au',
  q4: 'False',
  q5: 'Yes'
};


const mockReviewData = {
  testId: 'MDCAT-Practice-01',
  score: '60%', // Calculated based on 3/5 correct
  questions: [
    { 
      id: 'q1', 
      subject: Subjects.BIOLOGY,
      chapter: 'Cell Structure & Function',
      text: 'What is the powerhouse of the cell?', 
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'], 
      selectedAnswer: mockUserAnswers.q1, 
      correctAnswer: 'Mitochondria',
      explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.'
    },
    { 
      id: 'q2', 
      subject: Subjects.PHYSICS,
      chapter: 'Force & Motion',
      text: 'Which of the following are vector quantities? (Select all that apply)', 
      options: ['Speed', 'Velocity', 'Distance', 'Displacement', 'Mass'], 
      selectedAnswer: mockUserAnswers.q2,
      correctAnswer: ['Velocity', 'Displacement'],
      explanation: 'Velocity and Displacement are vector quantities as they have both magnitude and direction. Speed, Distance, and Mass are scalar quantities.'
    },
     { 
      id: 'q3', 
      subject: Subjects.CHEMISTRY,
      chapter: 'Fundamental Concepts',
      text: 'The chemical symbol for Gold is ___.',
      selectedAnswer: mockUserAnswers.q3, 
      correctAnswer: 'Au',
      explanation: 'The chemical symbol for Gold is Au, derived from its Latin name Aurum.'
    },
    { 
      id: 'q4', 
      subject: Subjects.ENGLISH,
      chapter: 'Grammar',
      text: 'The statement "The sun rises in the west" is true.',
      selectedAnswer: mockUserAnswers.q4,
      correctAnswer: 'False',
      explanation: 'The sun rises in the east and sets in the west due to Earth\'s rotation.'
    },
    {
      id: 'q5',
      subject: Subjects.LOGICAL_REASONING,
      chapter: 'Logical Deductions',
      text: 'If all cats are mammals, and all mammals are animals, are all cats animals?',
      options: ['Yes', 'No', 'Cannot be determined'],
      selectedAnswer: 'No', // User selected 'No' incorrectly
      correctAnswer: 'Yes',
      explanation: 'This is a valid syllogism. If A is a subset of B, and B is a subset of C, then A is a subset of C.'
    }
  ],
};

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  // In a real app, fetch reviewData and userAnswers based on testId
  const reviewData = mockReviewData; 

  const isCorrect = (question: typeof reviewData.questions[0]): boolean => {
    if (Array.isArray(question.correctAnswer)) {
      if (!Array.isArray(question.selectedAnswer) || question.selectedAnswer.length !== question.correctAnswer.length) {
        return false;
      }
      const sortedSelected = [...question.selectedAnswer].sort();
      const sortedCorrect = [...question.correctAnswer].sort();
      return sortedSelected.every((val, index) => val === sortedCorrect[index]);
    }
    return question.selectedAnswer === question.correctAnswer;
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push('/history')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
         <Link href="/dashboard">
          <Button size="sm">Go to Dashboard</Button>
        </Link>
      </div>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Test Review: {reviewData.testId}</CardTitle>
          <CardDescription className="text-lg">
            Your Score: <span className="font-bold text-primary">{reviewData.score}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {reviewData.questions.map((q, index) => (
        <Card key={q.id} className={`shadow-md ${isCorrect(q) ? 'border-green-500' : 'border-red-500'} border-2`}>
          <CardHeader className={`${isCorrect(q) ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Question {index + 1}: {q.text}</CardTitle>
              {isCorrect(q) ? 
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" /> : 
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 ml-2" />}
            </div>
            <CardDescription>Subject: {q.subject} | Chapter: {q.chapter}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {q.options && ( // For multiple choice / single choice / true-false with options
              <ul className="space-y-2 mb-4">
                {q.options.map((option) => {
                  const isSelectedByUser = Array.isArray(q.selectedAnswer) ? q.selectedAnswer.includes(option) : q.selectedAnswer === option;
                  const isActuallyCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(option) : q.correctAnswer === option;
                  
                  let itemClass = "p-3 border rounded-md flex items-center justify-between text-sm";
                  let indicator = null;

                  if (isActuallyCorrect) {
                    itemClass += " bg-green-100 border-green-400";
                    if (isSelectedByUser) {
                       indicator = <CheckCircle2 className="h-5 w-5 text-green-600" />;
                    } else {
                       indicator = <span className="text-xs text-green-700 font-medium">(Correct)</span>;
                    }
                  }
                  if (isSelectedByUser && !isActuallyCorrect) {
                    itemClass += " bg-red-100 border-red-400";
                    indicator = <XCircle className="h-5 w-5 text-red-600" />;
                  }
                  
                  return (
                    <li key={option} className={itemClass}>
                      <span>{option}</span>
                      {indicator}
                    </li>
                  );
                })}
              </ul>
            )}
            {!q.options && ( // For fill-in-the-blank
                 <div className="space-y-2 mb-4 text-sm">
                    <p><strong>Your Answer:</strong> <span className={isCorrect(q) ? 'text-green-700' : 'text-red-700'}>{Array.isArray(q.selectedAnswer) ? q.selectedAnswer.join(', ') : q.selectedAnswer}</span></p>
                    {!isCorrect(q) && <p className="font-semibold text-green-700"><strong>Correct Answer:</strong> {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>}
                 </div>
            )}

            {q.explanation && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md border border-dashed">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><Info className="h-4 w-4 text-blue-600"/>Explanation:</h4>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
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
