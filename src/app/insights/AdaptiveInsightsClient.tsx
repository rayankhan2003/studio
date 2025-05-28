
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, Sparkles, BookOpen } from 'lucide-react';
import { getAdaptiveRecommendations, type AdaptiveRecommendationsInput, type AdaptiveRecommendationsOutput } from '@/ai/flows/adaptive-recommendations';
import { z } from 'zod';
import { Subjects, syllabus } from '@/lib/syllabus';

const placeholderInput: AdaptiveRecommendationsInput = {
  testHistory: [
    {
      subject: Subjects.BIOLOGY,
      chapterScores: {
        [syllabus[Subjects.BIOLOGY][0].name]: 75, // Acellular Life
        [syllabus[Subjects.BIOLOGY][1].name]: 60, // Bioenergetics
        [syllabus[Subjects.BIOLOGY][2].name]: 50, // Biological Molecules
        [syllabus[Subjects.BIOLOGY][3].name]: 85  // Cell Structure & Function
      }
    },
    {
      subject: Subjects.CHEMISTRY,
      chapterScores: {
        [syllabus[Subjects.CHEMISTRY][0].name]: 65, // Fundamental Concepts
        [syllabus[Subjects.CHEMISTRY][1].name]: 55, // Atomic Structure
        [syllabus[Subjects.CHEMISTRY][2].name]: 70, // Gases
        [syllabus[Subjects.CHEMISTRY][6].name]: 45  // Reaction Kinetics
      }
    },
    {
      subject: Subjects.PHYSICS,
      chapterScores: {
        [syllabus[Subjects.PHYSICS][0].name]: 70, // Force & Motion
        [syllabus[Subjects.PHYSICS][1].name]: 50, // Work & Energy
      }
    },
    {
      subject: Subjects.ENGLISH,
      chapterScores: {
        [syllabus[Subjects.ENGLISH][0].name]: 80, // Vocabulary
        [syllabus[Subjects.ENGLISH][1].name]: 72, // Grammar
      }
    }
  ]
};


const AdaptiveRecommendationsInputSchema = z.object({
  testHistory: z.array(
    z.object({
      subject: z.string(),
      chapterScores: z.record(z.string(), z.number().min(0).max(100)),
    })
  ),
});

export default function AdaptiveInsightsClient() {
  const [testHistoryInput, setTestHistoryInput] = useState(JSON.stringify(placeholderInput, null, 2));
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const parsedInput = JSON.parse(testHistoryInput);
      const validationResult = AdaptiveRecommendationsInputSchema.safeParse(parsedInput);
      
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.format());
        
        const errorMessages = validationResult.error.errors.map(e => {
          return `Field '${e.path.join('.')}' - ${e.message}`;
        }).join('; ');
        setError(`Invalid input format: ${errorMessages}`);
        setIsLoading(false);
        return;
      }
      
      const result = await getAdaptiveRecommendations(validationResult.data);
      setRecommendations(result);
    } catch (e: any) {
      console.error(e);
      if (e instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError(e.message || 'An unexpected error occurred while fetching recommendations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent className="space-y-6">
          <div>
            <label htmlFor="testHistory" className="block text-sm font-medium text-foreground mb-1">
              Test History (JSON format)
            </label>
            <Textarea
              id="testHistory"
              value={testHistoryInput}
              onChange={(e) => setTestHistoryInput(e.target.value)}
              rows={15}
              placeholder="Enter your test history as JSON..."
              className="font-mono text-sm bg-muted/30 focus:bg-background"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Provide your test history including subjects and scores (0-100) for each chapter. See placeholder for structure.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            Get Study Recommendations
          </Button>
      </CardFooter>

      {error && (
        <Alert variant="destructive" className="mt-6 mx-6 mb-2">
          <AlertTitle>Input Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && recommendations.recommendations.length > 0 && (
        <div className="mt-2 mb-6 mx-6 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center text-primary">
            <Sparkles className="mr-2 h-6 w-6 text-accent" />
            Your Personalized Study Plan
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.recommendations.map((rec, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow bg-card">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="flex items-start gap-2 text-primary text-lg">
                    <BookOpen className="h-5 w-5 mt-1 flex-shrink-0" />
                    <span>Focus on: {rec.subject} - {rec.chapter}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
       {recommendations && recommendations.recommendations.length === 0 && !isLoading && !error && (
         <Alert className="mt-6 mx-6 mb-2">
           <AlertTitle>No Specific Recommendations</AlertTitle>
           <AlertDescription>The AI could not generate specific recommendations based on the provided data. This might happen if scores are uniformly high, data is insufficient, or if you're already doing great everywhere!</AlertDescription>
         </Alert>
       )}
    </>
  );
}
