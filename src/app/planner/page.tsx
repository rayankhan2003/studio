
// src/app/planner/page.tsx
'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CalendarIcon, Brain, Info, ListChecks, Sparkles, BookOpen, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { allSubjects, Subjects, type Subject as SubjectType } from '@/lib/syllabus';
import { generateStudyPlan, type StudyPlanInput, type StudyPlanOutput, type DailyActivity } from '@/ai/flows/study-plan-flow';
import { useToast } from '@/hooks/use-toast';

type SubjectGoals = Partial<Record<SubjectType, number | undefined>>;

const DailyActivityItem = React.memo(({ item, onSetupTest }: { item: DailyActivity; onSetupTest: (activity: DailyActivity) => void }) => {
    return (
        <li className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                <p className="font-semibold text-md sm:text-lg text-primary">{item.date}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium mt-1 sm:mt-0
                ${item.activityType === 'Study' ? 'bg-blue-100 text-blue-700' :
                    item.activityType === 'Test' ? 'bg-green-100 text-green-700' :
                    item.activityType === 'Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'}`}>
                {item.activityType}
                </span>
            </div>
            {item.subjectFocus && (
                <p className="text-sm sm:text-md font-medium flex items-center gap-1 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" /> Subject: {item.subjectFocus}
                </p>
            )}
            {item.chapterFocus && item.chapterFocus.length > 0 && (
                <div className="mt-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Chapters/Topics:</p>
                    <ul className="list-disc list-inside pl-2 text-xs sm:text-sm">
                        {item.chapterFocus.map(cf => <li key={cf}>{cf}</li>)}
                    </ul>
                </div>
            )}
            {item.details && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Notes: {item.details}</p>
            )}
            {item.activityType === 'Test' && item.subjectFocus && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full sm:w-auto text-xs sm:text-sm"
                    onClick={() => onSetupTest(item)}
                >
                <Settings className="mr-2 h-4 w-4" /> Setup This Test
                </Button>
            )}
        </li>
    );
});
DailyActivityItem.displayName = 'DailyActivityItem';

export default function AiPlannerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [finalDate, setFinalDate] = useState<Date | undefined>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30); // Default to 30 days from now
    return tomorrow;
  });
  const [subjectGoals, setSubjectGoals] = useState<SubjectGoals>(() => {
    const initialGoals: SubjectGoals = {};
    allSubjects.forEach(subject => {
      initialGoals[subject] = 75; // Default goal
    });
    return initialGoals;
  });
  const [studyHoursPerDay, setStudyHoursPerDay] = useState<string>('4'); // Store as string for input field

  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStrictGoalChange = useCallback((subject: SubjectType, value: string) => {
    if (value === '') {
      setSubjectGoals(prev => ({ ...prev, [subject]: undefined }));
      return;
    }
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setSubjectGoals(prev => ({ ...prev, [subject]: parsedValue }));
    } else {
      setSubjectGoals(prev => ({ ...prev, [subject]: undefined }));
       toast({ title: "Input Info", description: `Goal for ${subject} must be a number between 0-100. Cleared.`, variant: "default" });
    }
  }, [toast]);


  const handleSetupTest = useCallback((activity: DailyActivity) => {
    if (!activity.subjectFocus) {
      toast({
        title: "Cannot Setup Test",
        description: "The AI plan for this test activity is missing a subject focus. Please regenerate the plan or report this issue.",
        variant: "destructive",
      });
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.set('subjects', activity.subjectFocus);

    if (activity.chapterFocus && Array.isArray(activity.chapterFocus) && activity.chapterFocus.length > 0) {
      const chapterStrings = activity.chapterFocus
        .map(cf => `${activity.subjectFocus}:${cf}`)
        .join(',');
      if (chapterStrings) {
        queryParams.set('chapters', chapterStrings);
      }
    }
    
    router.push(`/test/custom?${queryParams.toString()}`);
  }, [router, toast]);

  const handleSubmit = useCallback(async () => {
    if (!finalDate) {
      toast({ title: "Input Error", description: "Please select a final preparation date.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);

    const mockPastPerformance: StudyPlanInput['pastPerformanceSummary'] = {
      [Subjects.BIOLOGY]: 60,
      [Subjects.CHEMISTRY]: 55,
      [Subjects.PHYSICS]: 50,
      [Subjects.ENGLISH]: 70,
      [Subjects.LOGICAL_REASONING]: 65,
    };

    const validSubjectGoals: Record<string, number> = {};
    for (const subjectKey in subjectGoals) {
        const subject = subjectKey as SubjectType;
        const goalValue = subjectGoals[subject];
        if (typeof goalValue === 'number' && !isNaN(goalValue) && goalValue >= 0 && goalValue <= 100) {
            validSubjectGoals[subject] = goalValue;
        }
    }

    const parsedStudyHours = parseInt(studyHoursPerDay);
    const validStudyHours = !isNaN(parsedStudyHours) && parsedStudyHours >= 1 && parsedStudyHours <= 16 ? parsedStudyHours : undefined;


    const planInput: StudyPlanInput = {
      finalPreparationDate: format(finalDate, 'yyyy-MM-dd'),
      subjectGoals: validSubjectGoals,
      pastPerformanceSummary: mockPastPerformance,
      studyHoursPerDay: validStudyHours,
    };

    try {
      const result = await generateStudyPlan(planInput);
      if (result && result.schedule) {
        if (result.schedule.length === 0) {
            setGeneratedPlan(result); // Still set plan to show empty message
            toast({ title: "Plan Generated (Empty)", description: "AI generated a plan, but the schedule is empty. Try different inputs." });
        } else {
            setGeneratedPlan(result);
            toast({ title: "Study Plan Generated!", description: "Your personalized plan is ready." });
        }
      } else {
        throw new Error("AI did not return a valid plan structure.");
      }
    } catch (e: any) {
      console.error("Error generating plan details:", e);
      let errorMessage = "An unexpected error occurred while generating the plan.";
      if (e.message) {
        errorMessage = e.message;
      }
      if (e.cause && typeof e.cause === 'object' && e.cause.message) {
        errorMessage += ` Details: ${e.cause.message}`;
      } else if (e.details) {
        errorMessage += ` Details: ${JSON.stringify(e.details)}`;
      }

      setError(errorMessage);
      toast({ title: "Generation Failed", description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsLoading(false);
    }
  }, [finalDate, subjectGoals, studyHoursPerDay, toast]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Brain className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Insight Planner</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Create Your Personalized Study Plan</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Set your final exam date, subject goals, and available study time. Our AI will generate a tailored study schedule to help you prepare effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <Label htmlFor="finalDate" className="block mb-2 font-semibold text-sm sm:text-base">Final Preparation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal text-sm sm:text-base ${!finalDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {finalDate ? format(finalDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={finalDate}
                    onSelect={setFinalDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="studyHours" className="block mb-2 font-semibold text-sm sm:text-base">Average Study Hours Per Day (Optional)</Label>
              <Input
                id="studyHours"
                type="number"
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(e.target.value)}
                placeholder="e.g., 4"
                min="1"
                max="16"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Subject Goals (Target %)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSubjects.map(subject => (
                <div key={subject} className="space-y-1">
                  <Label htmlFor={`goal-${subject}`} className="text-sm sm:text-base">{subject}</Label>
                  <Input
                    id={`goal-${subject}`}
                    type="number"
                    value={subjectGoals[subject] === undefined ? '' : String(subjectGoals[subject])}
                    onChange={(e) => handleStrictGoalChange(subject, e.target.value)}
                    placeholder="e.g., 85 (0-100)"
                    min="0"
                    max="100"
                    className="text-sm sm:text-base"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleSubmit} disabled={isLoading || !finalDate} size="lg" className="text-base sm:text-lg py-3 sm:py-6">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ListChecks className="mr-2 h-5 w-5" />
            )}
            Generate Study Plan
          </Button>
          <Alert variant="default" className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary/80" />
            <AlertTitle className="text-primary/90 font-semibold">How it works</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              The AI considers your final date, goals, and (mocked) past performance to create a schedule.
              It will try to allocate more time to subjects where your goals are high or past scores were lower.
              The plan will include study blocks, suggested test days (with chapter focus and question recommendations), and review periods.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center mt-6 p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Generating your plan, please wait...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error Generating Plan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedPlan && !isLoading && (
        <Card className="shadow-lg mt-8">
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 text-primary">
              <Sparkles className="h-6 w-6 text-accent" /> Your AI-Generated Study Plan
            </CardTitle>
            {generatedPlan.aiGeneralAdvice && (
              <CardDescription className="pt-2 text-primary/80 text-sm sm:text-base">{generatedPlan.aiGeneralAdvice}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {generatedPlan.schedule.length > 0 ? (
              <ul className="space-y-4">
                {generatedPlan.schedule.map((item: DailyActivity, index: number) => (
                  <DailyActivityItem key={index} item={item} onSetupTest={handleSetupTest} />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">The AI couldn't generate a schedule based on the inputs. Try adjusting them, such as extending the final preparation date or modifying goals.</p>
            )}
            <Alert className="mt-6 bg-accent/5 border-accent/20">
              <Info className="h-4 w-4 text-accent/80" />
              <AlertTitle className="text-accent/90 font-semibold">Next Steps & Future Features</AlertTitle>
              <AlertDescription className="text-xs space-y-1 text-muted-foreground">
                <p>This is your initial AI-generated plan. You can use the "Setup This Test" button to pre-fill subject and chapters on the custom test page. Future versions may include:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Dynamic progress tracking against this plan.</li>
                  <li>Automatic plan adjustments by the AI if you're ahead or behind.</li>
                  <li>More detailed calendar views (weekly/monthly).</li>
                  <li>Integration with your actual test performance for smarter re-planning.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
