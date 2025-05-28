
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import { allSubjects, syllabus, type Subject, type Chapter } from '@/lib/syllabus';
import { Settings, ListChecks, Clock, Hash, PlayCircle, AlertCircle, Info, Archive } from 'lucide-react';

const questionCountPresets = [5, 10, 15, 20, 30, 50, 100, 200]; 
const timePerQuestionOptions = [
  { label: '30 seconds', value: 30 },
  { label: '45 seconds', value: 45 },
  { label: '60 seconds', value: 60 },
  { label: '90 seconds', value: 90 },
  { label: '120 seconds', value: 120 },
];

const pastMDCATYears = Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).reverse();

// Standard mock configuration for past MDCAT papers
const MOCK_MDCAT_QUESTION_COUNT = 200;
const MOCK_MDCAT_TOTAL_MINUTES = 210; // 3.5 hours
const MOCK_MDCAT_TOTAL_DURATION_SECONDS = MOCK_MDCAT_TOTAL_MINUTES * 60;


type SelectedChapters = Record<Subject, Set<string>>;

export default function CustomTestPage() {
  const router = useRouter();

  const initialSelectedChapters = () => {
    const state: Partial<SelectedChapters> = {};
    allSubjects.forEach(subject => {
      state[subject] = new Set<string>();
    });
    return state as SelectedChapters;
  };

  const [selectedChapters, setSelectedChapters] = useState<SelectedChapters>(initialSelectedChapters());
  const [questionCountMode, setQuestionCountMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetQuestions, setSelectedPresetQuestions] = useState<number>(questionCountPresets[2]); // Default to 15
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('');
  const [timePerQuestion, setTimePerQuestion] = useState<number>(timePerQuestionOptions[2].value); // Default to 60s
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);


  useEffect(() => {
    if (allSubjects.length > 0) {
      setActiveAccordionItems([allSubjects[0]]);
    }
  }, []);

  const actualQuestionCount = useMemo(() => {
    return questionCountMode === 'preset' ? selectedPresetQuestions : parseInt(customQuestionCount) || 0;
  }, [questionCountMode, selectedPresetQuestions, customQuestionCount]);

  const totalSelectedChaptersCount = useMemo(() => {
    return Object.values(selectedChapters).reduce((acc, chaptersSet) => acc + chaptersSet.size, 0);
  }, [selectedChapters]);
  
  const totalAvailableQuestionsEstimate = useMemo(() => {
    // This is a rough estimate, assuming each chapter has ~15 mock questions for custom tests
    return totalSelectedChaptersCount * 15; 
  }, [totalSelectedChaptersCount]);


  const handleSubjectSelectAll = (subject: Subject, checked: boolean | 'indeterminate') => {
    setSelectedChapters(prev => {
      const newSubjectChapters = new Set(prev[subject]);
      const allChaptersInSubject = syllabus[subject].map(ch => ch.name);
      if (checked === true) {
        allChaptersInSubject.forEach(ch => newSubjectChapters.add(ch));
      } else { 
        allChaptersInSubject.forEach(ch => newSubjectChapters.delete(ch));
      }
      return { ...prev, [subject]: newSubjectChapters };
    });
  };

  const handleChapterSelect = (subject: Subject, chapterName: string, checked: boolean) => {
    setSelectedChapters(prev => {
      const newSubjectChapters = new Set(prev[subject]);
      if (checked) {
        newSubjectChapters.add(chapterName);
      } else {
        newSubjectChapters.delete(chapterName);
      }
      return { ...prev, [subject]: newSubjectChapters };
    });
  };

  const getSubjectCheckboxState = (subject: Subject): boolean | 'indeterminate' => {
    const numChaptersInSubject = syllabus[subject].length;
    const numSelectedInSubject = selectedChapters[subject]?.size || 0;

    if (numSelectedInSubject === 0) return false;
    if (numSelectedInSubject === numChaptersInSubject) return true;
    return 'indeterminate';
  };

  const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0 min 0 sec';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  const totalTestDuration = useMemo(() => {
    return actualQuestionCount * timePerQuestion;
  }, [actualQuestionCount, timePerQuestion]);

  const handleStartCustomTest = () => {
    if (totalSelectedChaptersCount === 0) {
      toast({ title: "Error", description: "Please select at least one chapter for a custom test.", variant: "destructive" });
      return;
    }
    if (actualQuestionCount <= 0) {
      toast({ title: "Error", description: "Number of questions must be greater than 0.", variant: "destructive" });
      return;
    }
     if (actualQuestionCount > totalAvailableQuestionsEstimate && totalAvailableQuestionsEstimate > 0) {
      toast({ 
        title: "Warning", 
        description: `You requested ${actualQuestionCount} questions, but selected chapters might only have around ${totalAvailableQuestionsEstimate} mock questions available. The test will proceed with the maximum available if less.`, 
        variant: "default",
        duration: 7000,
      });
    }
    
    toast({ title: "Custom Test Starting!", description: "Redirecting to your custom test..." });
    
    const queryParams = new URLSearchParams({
      questionCount: String(actualQuestionCount),
      totalDuration: String(totalTestDuration),
      testName: "Custom SmarterCat Test"
    });

    router.push(`/test/custom-test-session?${queryParams.toString()}`); 
  };

  const handleStartMdcatTest = (year: number) => {
    toast({ title: `MDCAT ${year} Test Starting!`, description: `Simulating MDCAT ${year} with ${MOCK_MDCAT_QUESTION_COUNT} questions and ${MOCK_MDCAT_TOTAL_MINUTES} minutes.` });
    
    const queryParams = new URLSearchParams({
      questionCount: String(MOCK_MDCAT_QUESTION_COUNT),
      totalDuration: String(MOCK_MDCAT_TOTAL_DURATION_SECONDS),
      testName: `MDCAT ${year}`
    });
    router.push(`/test/mdcat-${year}?${queryParams.toString()}`);
  };
  
  const getSelectedChaptersForPreview = () => {
    const preview: { subject: string, chapters: string[] }[] = [];
    allSubjects.forEach(subject => {
      const chapters = Array.from(selectedChapters[subject]);
      if (chapters.length > 0) {
        preview.push({ subject, chapters });
      }
    });
    return preview;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Configure Your Test</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Test Configuration Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" /> Create a Custom Test
              </CardTitle>
              <CardDescription>Choose subjects, chapters, question count, and time limits for a personalized practice session.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion 
                type="multiple" 
                className="w-full space-y-3" 
                value={activeAccordionItems}
                onValueChange={setActiveAccordionItems}
              >
                {allSubjects.map((subject) => (
                  <AccordionItem value={subject} key={subject} className="border bg-muted/30 rounded-md">
                    <AccordionTrigger className="py-3 hover:no-underline px-3">
                      <div 
                        className="flex items-center space-x-3 flex-1"
                         onClick={(e) => { 
                            // Allow click only on checkbox/label for selection, not to toggle accordion
                            if (!((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('label'))) {
                               // e.preventDefault(); // This would prevent accordion toggle; might be too restrictive.
                               // Better to let trigger handle accordion, and ensure checkbox clicks are specific.
                            }
                        }}
                      >
                        <Checkbox
                          id={`select-all-${subject}`}
                          checked={getSubjectCheckboxState(subject)}
                          onCheckedChange={(checked) => {
                            handleSubjectSelectAll(subject, checked);
                          }}
                          onClick={(e) => e.stopPropagation()} 
                          aria-label={`Select all chapters in ${subject}`}
                        />
                        <Label 
                          htmlFor={`select-all-${subject}`} 
                          className="text-lg font-semibold text-foreground cursor-pointer"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          {subject}
                        </Label>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 pl-4 border-t mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {syllabus[subject].map((chapter: Chapter) => (
                          <div key={chapter.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${subject}-${chapter.name}`}
                              checked={selectedChapters[subject]?.has(chapter.name)}
                              onCheckedChange={(checked) => handleChapterSelect(subject, chapter.name, !!checked)}
                            />
                            <Label htmlFor={`${subject}-${chapter.name}`} className="font-normal text-sm text-muted-foreground cursor-pointer">
                              {chapter.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
             <CardFooter className="border-t pt-6">
                <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleStartCustomTest}
                    disabled={totalSelectedChaptersCount === 0 || actualQuestionCount <= 0}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" /> Start Custom Test
                </Button>
            </CardFooter>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-6 w-6 text-primary" /> Question Count (Custom Test)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={questionCountMode}
                  onValueChange={(value) => setQuestionCountMode(value as 'preset' | 'custom')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preset" id="preset" />
                    <Label htmlFor="preset">Choose from presets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Enter custom number</Label>
                  </div>
                </RadioGroup>

                {questionCountMode === 'preset' && (
                  <Select
                    value={String(selectedPresetQuestions)}
                    onValueChange={(value) => setSelectedPresetQuestions(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionCountPresets.map(count => (
                        <SelectItem key={count} value={String(count)}>{count} questions</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {questionCountMode === 'custom' && (
                  <Input
                    type="number"
                    placeholder="e.g., 37"
                    value={customQuestionCount}
                    onChange={(e) => setCustomQuestionCount(e.target.value)}
                    min="1"
                  />
                )}
                 {actualQuestionCount > totalAvailableQuestionsEstimate && totalSelectedChaptersCount > 0 && (
                    <p className="text-xs text-orange-600 flex items-start gap-1">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>
                      <span>Selected chapters have an estimated {totalAvailableQuestionsEstimate} mock questions. Test will use available count if less.</span>
                    </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" /> Time per Question (Custom Test)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={String(timePerQuestion)}
                  onValueChange={(value) => setTimePerQuestion(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time per question" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePerQuestionOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-accent" /> Custom Test Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Selected Chapters:</h4>
                {totalSelectedChaptersCount > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs bg-muted/50 p-2 rounded-md">
                  {getSelectedChaptersForPreview().map(item => (
                    <div key={item.subject}>
                      <strong className="text-primary/90">{item.subject}:</strong> {item.chapters.join(', ')}
                    </div>
                  ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No chapters selected yet.</p>
                )}
              </div>
              <p><strong>Total Questions:</strong> <span className="text-primary font-semibold">{actualQuestionCount > 0 ? actualQuestionCount : 'N/A'}</span></p>
              <p><strong>Time per Question:</strong> <span className="text-primary font-semibold">{timePerQuestionOptions.find(opt => opt.value === timePerQuestion)?.label || 'N/A'}</span></p>
              <p><strong>Total Test Duration:</strong> <span className="text-primary font-semibold">{formatDuration(totalTestDuration)}</span></p>
               {totalSelectedChaptersCount === 0 && actualQuestionCount > 0 && (
                 <p className="text-xs text-orange-500">Please select chapters to start a custom test.</p>
               )}
               {actualQuestionCount <=0 && totalSelectedChaptersCount > 0 && (
                 <p className="text-xs text-orange-500">Please set a valid number of questions.</p>
               )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-6 w-6 text-primary" /> Practice Past MDCAT Papers
              </CardTitle>
              <CardDescription>Attempt full past papers to simulate exam conditions.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {pastMDCATYears.map(year => (
                <Button
                  key={year}
                  variant="outline"
                  onClick={() => handleStartMdcatTest(year)}
                >
                  MDCAT {year}
                </Button>
              ))}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Each past paper is simulated with {MOCK_MDCAT_QUESTION_COUNT} questions and a {MOCK_MDCAT_TOTAL_MINUTES}-minute duration for practice.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
