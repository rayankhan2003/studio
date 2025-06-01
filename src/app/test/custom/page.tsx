
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Settings, ListChecks, Clock, Hash, PlayCircle, AlertCircle, Info, Archive, ChevronDown } from 'lucide-react';
import { mockQuestionsDb } from '@/lib/mock-questions-db';
import { cn } from '@/lib/utils';


const questionCountPresets = [5, 10, 15, 20, 30, 50, 100];
const timePerQuestionOptions = [
  { label: '30 seconds', value: 30 },
  { label: '45 seconds', value: 45 },
  { label: '60 seconds', value: 60 },
  { label: '90 seconds', value: 90 },
  { label: '120 seconds', value: 120 },
];

const pastMDCATYears = Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).reverse();

const MOCK_MDCAT_QUESTION_COUNT = 200; // Typical MDCAT count
const MOCK_MDCAT_TOTAL_MINUTES = 210; // 3.5 hours
const MOCK_MDCAT_TOTAL_DURATION_SECONDS = MOCK_MDCAT_TOTAL_MINUTES * 60;


type SelectedChaptersMap = Record<Subject, Set<string>>;

export default function CustomTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSelectedChapters = (): SelectedChaptersMap => {
    const state: Partial<SelectedChaptersMap> = {};
    allSubjects.forEach(subject => {
      state[subject] = new Set<string>();
    });
    return state as SelectedChaptersMap;
  };

  const [selectedChaptersMap, setSelectedChaptersMap] = useState<SelectedChaptersMap>(initialSelectedChapters());
  const [questionCountMode, setQuestionCountMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetQuestions, setSelectedPresetQuestions] = useState<number>(questionCountPresets[2]);
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('10');
  const [timePerQuestion, setTimePerQuestion] = useState<number>(timePerQuestionOptions[2].value);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);
  const [testName, setTestName] = useState<string>('');


  useEffect(() => {
    const subjectsQuery = searchParams.get('subjects');
    const chaptersQuery = searchParams.get('chapters'); // e.g., "Biology:Cell Structure,Physics:Force & Motion"
    const testNameQuery = searchParams.get('testName');

    if (testNameQuery) {
        setTestName(testNameQuery);
    } else {
        setTestName('My Custom Test');
    }

    if (subjectsQuery || chaptersQuery) {
      const newSelectedChaptersMap: SelectedChaptersMap = initialSelectedChapters();
      const subjectsToOpenInAccordion: Set<string> = new Set();

      if (subjectsQuery) {
        const subjectsArray = subjectsQuery.split(',');
        subjectsArray.forEach(subjStr => {
          if (allSubjects.includes(subjStr as Subject)) {
            subjectsToOpenInAccordion.add(subjStr);
            // If only subjects are passed, select all their chapters by default
            if (!chaptersQuery) {
                 syllabus[subjStr as Subject].forEach(chap => newSelectedChaptersMap[subjStr as Subject].add(chap.name));
            }
          }
        });
      }
      
      if (chaptersQuery) {
        const chapterSelections = chaptersQuery.split(',');
        chapterSelections.forEach(cs => {
          const [subj, chap] = cs.split(':');
          if (subj && chap && allSubjects.includes(subj as Subject) && syllabus[subj as Subject].find(c => c.name === chap)) {
            newSelectedChaptersMap[subj as Subject].add(chap);
            subjectsToOpenInAccordion.add(subj);
          }
        });
      }
      setSelectedChaptersMap(newSelectedChaptersMap);
      setActiveAccordionItems(Array.from(subjectsToOpenInAccordion));
    } else {
      // Default behavior if no query params: optionally auto-open first subject
      if (allSubjects.length > 0 && activeAccordionItems.length === 0) {
        // setActiveAccordionItems([allSubjects[0]]); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only re-run when searchParams change

  const actualQuestionCount = useMemo(() => {
    return questionCountMode === 'preset' ? selectedPresetQuestions : parseInt(customQuestionCount) || 0;
  }, [questionCountMode, selectedPresetQuestions, customQuestionCount]);

  const totalSelectedChaptersCount = useMemo(() => {
    return Object.values(selectedChaptersMap).reduce((acc, chaptersSet) => acc + chaptersSet.size, 0);
  }, [selectedChaptersMap]);

  const totalAvailableQuestionsFromSelection = useMemo(() => {
    let count = 0;
    allSubjects.forEach(subject => {
      const chapters = selectedChaptersMap[subject];
      if (chapters.size > 0) {
        mockQuestionsDb.forEach(q => {
          if (q.subject === subject && chapters.has(q.chapter)) {
            count++;
          }
        });
      }
    });
    return count;
  }, [selectedChaptersMap]);


  const handleSubjectSelectAll = (subject: Subject, checked: boolean | 'indeterminate') => {
    setSelectedChaptersMap(prev => {
      const newSubjectChapters = new Set<string>(); 
      if (checked === true) {
        syllabus[subject].forEach(ch => newSubjectChapters.add(ch.name));
      }
      return { ...prev, [subject]: newSubjectChapters };
    });
  };

  const handleChapterSelect = (subject: Subject, chapterName: string, checked: boolean) => {
    setSelectedChaptersMap(prev => {
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
    const numSelectedInSubject = selectedChaptersMap[subject]?.size || 0;

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
      toast({ title: "Error", description: "Please select at least one chapter from at least one subject.", variant: "destructive" });
      return;
    }
    if (actualQuestionCount <= 0) {
      toast({ title: "Error", description: "Number of questions must be greater than 0.", variant: "destructive" });
      return;
    }
    
    const finalQuestionCount = Math.min(actualQuestionCount, totalAvailableQuestionsFromSelection > 0 ? totalAvailableQuestionsFromSelection : actualQuestionCount);

    if (actualQuestionCount > totalAvailableQuestionsFromSelection && totalAvailableQuestionsFromSelection > 0) {
      toast({
        title: "Warning",
        description: `You requested ${actualQuestionCount} questions, but selected topics have only ${totalAvailableQuestionsFromSelection}. The test will use ${totalAvailableQuestionsFromSelection} questions.`,
        variant: "default",
        duration: 7000,
      });
    }
     if (totalAvailableQuestionsFromSelection === 0 && totalSelectedChaptersCount > 0) {
      toast({
        title: "No Questions Found",
        description: "No questions available for the selected chapters. Please expand your selection or check the mock database.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    if (finalQuestionCount <=0) {
        toast({ title: "Error", description: "Calculated question count is zero. Please check selections.", variant: "destructive" });
        return;
    }


    toast({ title: "Custom Test Starting!", description: "Redirecting..." });

    const selectedSubjectsForQuery: string[] = [];
    const selectedChaptersForQuery: string[] = [];

    allSubjects.forEach(subject => {
      const chapters = Array.from(selectedChaptersMap[subject]);
      if (chapters.length > 0) {
        selectedSubjectsForQuery.push(subject); // Keep this for broader subject context if needed
        chapters.forEach(ch => selectedChaptersForQuery.push(`${subject}:${ch}`));
      }
    });


    const queryParams = new URLSearchParams({
      questionCount: String(finalQuestionCount),
      totalDuration: String(finalQuestionCount * timePerQuestion), // Recalculate duration based on final question count
      testName: testName || "Custom SmarterCat Test",
      subjects: selectedSubjectsForQuery.join(','),
      chapters: selectedChaptersForQuery.join(',') 
    });

    router.push(`/test/custom-session?${queryParams.toString()}`);
  };

  const handleStartMdcatTest = (year: number) => {
    toast({ title: `MDCAT ${year} Test Starting!`, description: `Simulating MDCAT ${year}.` });

    const queryParams = new URLSearchParams({
      questionCount: String(MOCK_MDCAT_QUESTION_COUNT),
      totalDuration: String(MOCK_MDCAT_TOTAL_DURATION_SECONDS),
      testName: `MDCAT ${year} (Practice)`,
      source: `mdcat-${year}` 
    });
    router.push(`/test/mdcat-session-${year}?${queryParams.toString()}`);
  };

  const getSelectedChaptersForPreview = () => {
    const preview: { subject: string, chapters: string[] }[] = [];
    allSubjects.forEach(subject => {
      const chapters = Array.from(selectedChaptersMap[subject]);
      if (chapters.length > 0) {
        preview.push({ subject, chapters });
      }
    });
    return preview;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Configure Your Test</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ListChecks className="h-6 w-6 text-primary" /> Create a Custom Test
              </CardTitle>
              <CardDescription>Choose subjects, chapters, question count, and time limits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="testName" className="font-semibold text-base mb-1 block">Test Name</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Biology Midterm Prep"
                  className="text-base"
                />
              </div>
              <Accordion
                type="multiple"
                className="w-full space-y-3"
                value={activeAccordionItems}
                onValueChange={setActiveAccordionItems}
              >
                {allSubjects.map((subject) => (
                  <AccordionItem value={subject} key={subject} className="border bg-muted/30 rounded-md shadow-sm">
                    <AccordionTrigger asChild>
                       <div
                        className={cn(
                          "flex flex-1 items-center justify-between py-3 px-3 font-medium transition-all hover:no-underline rounded-t-md cursor-pointer group hover:bg-accent/10",
                          activeAccordionItems.includes(subject) ? "bg-accent/5" : ""
                        )}
                      >
                        <div className="flex items-center space-x-3 flex-1" onClick={(e) => e.stopPropagation()} >
                          <Checkbox
                            id={`select-all-${subject}`}
                            checked={getSubjectCheckboxState(subject)}
                            onCheckedChange={(checked) => {
                              handleSubjectSelectAll(subject, checked);
                            }}
                            aria-label={`Select all chapters in ${subject}`}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`select-all-${subject}`}
                            className="text-lg font-semibold text-foreground cursor-pointer"
                           
                          >
                            {subject} ({selectedChaptersMap[subject]?.size || 0} / {syllabus[subject].length} chapters)
                          </Label>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 text-primary" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 pb-4 px-4 border-t mt-0 bg-background">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                        {syllabus[subject].map((chapter: Chapter) => (
                          <div key={chapter.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${subject}-${chapter.name.replace(/\s+/g, '-')}`}
                              checked={selectedChaptersMap[subject]?.has(chapter.name)}
                              onCheckedChange={(checked) => handleChapterSelect(subject, chapter.name, !!checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`${subject}-${chapter.name.replace(/\s+/g, '-')}`} className="font-normal text-sm text-muted-foreground cursor-pointer">
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
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Hash className="h-6 w-6 text-primary" /> Question Count
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={questionCountMode}
                  onValueChange={(value) => setQuestionCountMode(value as 'preset' | 'custom')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preset" id="preset" />
                    <Label htmlFor="preset" className="text-sm sm:text-base">Choose from presets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="text-sm sm:text-base">Enter custom number</Label>
                  </div>
                </RadioGroup>

                {questionCountMode === 'preset' && (
                  <Select
                    value={String(selectedPresetQuestions)}
                    onValueChange={(value) => setSelectedPresetQuestions(Number(value))}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionCountPresets.map(count => (
                        <SelectItem key={count} value={String(count)} className="text-sm sm:text-base">{count} questions</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {questionCountMode === 'custom' && (
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={customQuestionCount}
                    onChange={(e) => setCustomQuestionCount(e.target.value)}
                    min="1"
                    className="text-sm sm:text-base"
                  />
                )}
                 {actualQuestionCount > totalAvailableQuestionsFromSelection && totalSelectedChaptersCount > 0 && totalAvailableQuestionsFromSelection > 0 && (
                    <p className="text-xs text-orange-600 flex items-start gap-1 pt-1">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                      <span>Selected topics have approx. {totalAvailableQuestionsFromSelection} questions. Test will use this count.</span>
                    </p>
                )}
                {totalAvailableQuestionsFromSelection === 0 && totalSelectedChaptersCount > 0 && (
                   <p className="text-xs text-red-600 flex items-start gap-1 pt-1">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                      <span>No questions found for the current selection. Please select more chapters/subjects.</span>
                    </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-6 w-6 text-primary" /> Time per Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={String(timePerQuestion)}
                  onValueChange={(value) => setTimePerQuestion(Number(value))}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select time per question" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePerQuestionOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)} className="text-sm sm:text-base">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleStartCustomTest}
                disabled={totalSelectedChaptersCount === 0 || actualQuestionCount <= 0 || (totalAvailableQuestionsFromSelection === 0 && totalSelectedChaptersCount > 0) }
              >
                <PlayCircle className="mr-2 h-6 w-6" /> Start Custom Test
            </Button>
          </div>

        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="h-6 w-6 text-accent" /> Custom Test Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm sm:text-base">
               <div>
                <h4 className="font-semibold mb-1">Test Name:</h4>
                <p className="text-primary font-semibold">{testName || "Custom Test"}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Selected Chapters ({totalSelectedChaptersCount}):</h4>
                {totalSelectedChaptersCount > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs sm:text-sm bg-muted/50 p-3 rounded-md border">
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
              <p><strong>Questions from Selection:</strong> <span className="text-primary font-semibold">{totalAvailableQuestionsFromSelection}</span></p>
              <p><strong>Questions for Test:</strong> <span className="text-primary font-semibold">{actualQuestionCount > 0 ? Math.min(actualQuestionCount, totalAvailableQuestionsFromSelection > 0 ? totalAvailableQuestionsFromSelection : actualQuestionCount) : 'N/A'}</span></p>
              <p><strong>Time per Question:</strong> <span className="text-primary font-semibold">{timePerQuestionOptions.find(opt => opt.value === timePerQuestion)?.label || 'N/A'}</span></p>
              <p><strong>Total Test Duration:</strong> <span className="text-primary font-semibold">{formatDuration(totalTestDuration)}</span></p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Archive className="h-6 w-6 text-primary" /> Practice Past MDCAT Papers
              </CardTitle>
              <CardDescription>Attempt full past papers to simulate exam conditions (mock data).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pastMDCATYears.slice(0, 6).map(year => ( // Show a few recent years
                <Button
                  key={year}
                  variant="outline"
                  onClick={() => handleStartMdcatTest(year)}
                  className="w-full text-sm sm:text-base py-3"
                >
                  MDCAT {year}
                </Button>
              ))}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Each past paper simulation uses {MOCK_MDCAT_QUESTION_COUNT} questions and a {MOCK_MDCAT_TOTAL_MINUTES}-minute duration.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
