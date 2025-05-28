import { Lightbulb } from 'lucide-react';
import AdaptiveInsightsClient from './AdaptiveInsightsClient';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AiInsightsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Study Insights</h1>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            Enter your test history below to get AI-driven recommendations on which chapters to focus on.
            The AI analyzes your past performance to identify areas where targeted study can most effectively
            improve your overall scores.
          </CardDescription>
        </CardHeader>
        <AdaptiveInsightsClient />
      </Card>
    </div>
  );
}
