'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, Sparkles, BookOpen } from 'lucide-react';
import { getAdaptiveRecommendations, type AdaptiveRecommendationsInput, type AdaptiveRecommendationsOutput } from '@/ai/flows/adaptive-recommendations';
import { z } from 'zod';

const placeholderInput: AdaptiveRecommendationsInput = {
  testHistory: [
    {
      subject: "Mathematics",
      chapterScores: {
        "Algebra Basics": 75,
        "Linear Equations": 60,
        "Quadratic Equations": 50,
        "Geometry Fundamentals": 85
      }
    },
    {
      subject: "Physics",
      chapterScores: {
        "Kinematics": 65,
        "Newton's Laws": 55,
        "Work and Energy": 70,
        "Thermodynamics Basics": 45
      }
    }
  ]
};


const AdaptiveRecommendationsInputSchema = z.object({
  testHistory: z.array(
    z.object({
      subject: z.string(),
      chapterScores: z.record(z.string(), z.number()),
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
        setError(`Invalid input format: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
        setIsLoading(false);
        return;
      }
      
      const result = await getAdaptiveRecommendations(validationResult.data);
      setRecommendations(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent className="space-y-6">
          <div>
            <label htmlFor="testHistory" className="block text-sm font-medium text-gray-700 mb-1">
              Test History (JSON format)
            </label>
            <Textarea
              id="testHistory"
              value={testHistoryInput}
              onChange={(e) => setTestHistoryInput(e.target.value)}
              rows={15}
              placeholder="Enter your test history as JSON..."
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Provide your test history including subjects and scores for each chapter. See placeholder for structure.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Get Recommendations
          </Button>
      </CardFooter>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && recommendations.recommendations.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-accent" />
            Your Personalized Study Plan
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.recommendations.map((rec, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    Focus on: {rec.subject} - {rec.chapter}
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
       {recommendations && recommendations.recommendations.length === 0 && (
         <Alert className="mt-6">
           <AlertTitle>No Specific Recommendations</AlertTitle>
           <AlertDescription>The AI could not generate specific recommendations based on the provided data. This might happen if scores are uniformly high or if data is insufficient.</AlertDescription>
         </Alert>
       )}
    </>
  );
}
