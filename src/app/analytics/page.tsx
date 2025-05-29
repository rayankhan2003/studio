
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart as RechartsBarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { BarChart3, TrendingUp, BookOpen, Clock, Percent, Target, Goal, Archive } from 'lucide-react';
import { Subjects, syllabus, type Subject, allSubjects, type Chapter } from '@/lib/syllabus';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  testType: 'custom' | 'mdcat';
  mdcatYear?: number;
  overallScorePercentage: number;
  subjectScores: Partial<Record<Subject, number>>;
  chapterScores: Partial<Record<Subject, Record<string, number>>>;
}

const initialOverallPerformance = {
  averageScore: 0,
  testsTaken: 0,
  overallProgress: 65, 
};

const initialSubjectScoreProgressionData: Array<Record<string, any>> = [];

const initialChapterPerformanceHistoryData: Record<Subject, Record<string, { testName: string; score: number }[]>> = 
  allSubjects.reduce((acc, subj) => {
    acc[subj] = {};
    syllabus[subj].forEach(chap => {
      acc[subj][chap.name] = [];
    });
    return acc;
  }, {} as Record<Subject, Record<string, { testName: string; score: number }[]>>);

const initialTimeSpentData = [ 
  { name: Subjects.BIOLOGY, avgTimePerQuestion: 1.5 },
  { name: Subjects.CHEMISTRY, avgTimePerQuestion: 2.0 },
  { name: Subjects.PHYSICS, avgTimePerQuestion: 2.2 },
  { name: Subjects.ENGLISH, avgTimePerQuestion: 1.2 },
  { name: Subjects.LOGICAL_REASONING, avgTimePerQuestion: 1.8 },
];

const subjectColors: Record<Subject, string> = {
  [Subjects.BIOLOGY]: "hsl(var(--chart-1))",
  [Subjects.CHEMISTRY]: "hsl(var(--chart-2))",
  [Subjects.PHYSICS]: "hsl(var(--chart-3))",
  [Subjects.ENGLISH]: "hsl(var(--chart-4))",
  [Subjects.LOGICAL_REASONING]: "hsl(var(--chart-5))",
};
const chapterLineColors = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))", "hsl(var(--accent))",
];


export default function AnalyticsPage() {
  const [selectedSubjectForChapterChart, setSelectedSubjectForChapterChart] = useState<Subject>(Subjects.BIOLOGY);
  const [filterPeriod, setFilterPeriod] = useState('all-time');
  const [analyticsView, setAnalyticsView] = useState<'custom' | 'mdcat'>('custom');

  const [overallPerformance, setOverallPerformance] = useState(initialOverallPerformance);
  const [subjectScoreProgressionData, setSubjectScoreProgressionData] = useState<Array<Record<string, any>>>([]);
  const [chapterPerformanceHistoryData, setChapterPerformanceHistoryData] = useState(initialChapterPerformanceHistoryData);
  const [timeSpentData, setTimeSpentData] = useState(initialTimeSpentData);

  const [isSetGoalDialogOpen, setIsSetGoalDialogOpen] = useState(false);
  const [goalDialogSubject, setGoalDialogSubject] = useState<Subject>(Subjects.BIOLOGY);
  const [goalDialogChapter, setGoalDialogChapter] = useState<string>('');
  const [goalDialogTargetScore, setGoalDialogTargetScore] = useState<string>('');
  const [chapterGoals, setChapterGoals] = useState<Record<Subject, Record<string, number>>>({});

  useEffect(() => {
    const storedHistoryString = localStorage.getItem('prepwiseTestHistory');
    let storedHistory: StoredTestReport[] = storedHistoryString ? JSON.parse(storedHistoryString) : [];

    storedHistory = storedHistory.filter(report => 
      analyticsView === 'custom' ? report.testType === 'custom' : report.testType === 'mdcat'
    );
    
    let newTotalScoreSum = 0;
    let newTestsTaken = 0;
    const newSubjectProgression: typeof initialSubjectScoreProgressionData = [];
    const newChapterHistory: typeof initialChapterPerformanceHistoryData = 
      allSubjects.reduce((acc, subj) => {
        acc[subj] = {};
        syllabus[subj].forEach(chap => {
          acc[subj][chap.name] = [];
        });
        return acc;
      }, {} as typeof initialChapterPerformanceHistoryData);

    if (storedHistory.length > 0) {
      newTestsTaken = storedHistory.length;
      storedHistory.forEach(report => {
        const progressionEntry: Record<string, any> = { 
          name: report.testType === 'mdcat' ? `MDCAT ${report.mdcatYear}` : report.name, 
          date: report.date 
        };
        let currentTestSubjectScoreSum = 0;
        let currentTestSubjectCount = 0;

        allSubjects.forEach(subj => {
          if (report.subjectScores[subj] !== undefined) {
            progressionEntry[subj] = report.subjectScores[subj];
            currentTestSubjectScoreSum += report.subjectScores[subj]!;
            currentTestSubjectCount++;
          }
        });
        newSubjectProgression.push(progressionEntry);
        if (currentTestSubjectCount > 0) {
            newTotalScoreSum += (currentTestSubjectScoreSum / currentTestSubjectCount);
        }

        allSubjects.forEach(subj => {
          if (report.chapterScores[subj]) {
            for (const chapterName in report.chapterScores[subj]) {
              if (!newChapterHistory[subj][chapterName]) {
                newChapterHistory[subj][chapterName] = [];
              }
              newChapterHistory[subj][chapterName].push({
                testName: report.testType === 'mdcat' ? `MDCAT ${report.mdcatYear}` : report.name,
                score: report.chapterScores[subj]![chapterName],
              });
            }
          }
        });
      });
    }
    
    setSubjectScoreProgressionData(newSubjectProgression);
    setChapterPerformanceHistoryData(newChapterHistory);
    setOverallPerformance(prev => ({
      ...prev,
      testsTaken: newTestsTaken,
      averageScore: newTestsTaken > 0 ? parseFloat((newTotalScoreSum / newTestsTaken).toFixed(1)) : 0,
    }));

  }, [analyticsView]);


  useEffect(() => {
    if (syllabus[goalDialogSubject]?.length > 0) {
      setGoalDialogChapter(syllabus[goalDialogSubject][0].name);
    } else {
      setGoalDialogChapter('');
    }
  }, [goalDialogSubject]);


  const overallSubjectAverageScores = useMemo(() => {
    if (subjectScoreProgressionData.length === 0) {
      return allSubjects.map(subject => ({ name: subject, averageScore: 0 }));
    }
  
    const subjectTotals: Record<Subject, { sum: number, count: number }> = 
      allSubjects.reduce((acc, s) => { acc[s] = { sum: 0, count: 0 }; return acc; }, {} as any);
  
    subjectScoreProgressionData.forEach(test => {
      allSubjects.forEach(subject => {
        if (test[subject] !== undefined && typeof test[subject] === 'number') {
          subjectTotals[subject].sum += test[subject];
          subjectTotals[subject].count++;
        }
      });
    });
  
    return allSubjects.map(subject => {
      const avg = subjectTotals[subject].count > 0 ? subjectTotals[subject].sum / subjectTotals[subject].count : 0;
      return { name: subject, averageScore: parseFloat(avg.toFixed(1)) };
    });
  }, [subjectScoreProgressionData]);
  

  const chapterProficiencyChartData = useMemo(() => {
    const subjectChapters = syllabus[selectedSubjectForChapterChart];
    const historyForSelectedSubject = chapterPerformanceHistoryData[selectedSubjectForChapterChart];
    if (!subjectChapters || !historyForSelectedSubject) return [];

    const testNamesSet = new Set<string>();
    subjectChapters.forEach(chapter => {
      (historyForSelectedSubject[chapter.name] || []).forEach(entry => {
        testNamesSet.add(entry.testName);
      });
    });
    const sortedTestNames = Array.from(testNamesSet).sort((a, b) => {
        const numA = parseInt(a.match(/Test #?(\d+)/)?.[1] || a.match(/MDCAT (\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/Test #?(\d+)/)?.[1] || b.match(/MDCAT (\d+)/)?.[1] || '0');
        if (numA !== numB) return numA - numB;
        
        const dateA = subjectScoreProgressionData.find(d => d.name === a)?.date;
        const dateB = subjectScoreProgressionData.find(d => d.name === b)?.date;
        if (dateA && dateB) return new Date(dateA).getTime() - new Date(dateB).getTime();
        return a.localeCompare(b);
    });

    return sortedTestNames.map(testName => {
      const dataPoint: { name: string; [chapterName: string]: number | string } = { name: testName };
      subjectChapters.forEach(chapter => {
        const history = historyForSelectedSubject[chapter.name];
        const testEntry = history?.find(entry => entry.testName === testName);
        dataPoint[chapter.name] = testEntry ? testEntry.score : 0; 
      });
      return dataPoint;
    });
  }, [selectedSubjectForChapterChart, chapterPerformanceHistoryData, subjectScoreProgressionData]);
  
  const handleSetGoal = () => {
    if (!goalDialogChapter || !goalDialogTargetScore) {
      toast({ title: "Error", description: "Please select a chapter and enter a target score.", variant: "destructive" });
      return;
    }
    const target = parseInt(goalDialogTargetScore);
    if (isNaN(target) || target < 0 || target > 100) {
      toast({ title: "Error", description: "Target score must be a number between 0 and 100.", variant: "destructive" });
      return;
    }

    setChapterGoals(prev => ({
      ...prev,
      [goalDialogSubject]: {
        ...(prev[goalDialogSubject] || {}),
        [goalDialogChapter]: target
      }
    }));
    toast({ title: "Goal Set!", description: `Target for ${goalDialogChapter} (${goalDialogSubject}) set to ${target}%.` });
    setIsSetGoalDialogOpen(false);
    setGoalDialogTargetScore(''); 
  };
  
  const openGoalDialog = (subject?: Subject, chapter?: string) => {
    const currentSubject = subject || selectedSubjectForChapterChart || allSubjects[0];
    setGoalDialogSubject(currentSubject);
    const chaptersForSubject = syllabus[currentSubject];
    const currentChapter = chapter || (chaptersForSubject.length > 0 ? chaptersForSubject[0].name : '');
    setGoalDialogChapter(currentChapter);
    setGoalDialogTargetScore(chapterGoals[currentSubject]?.[currentChapter]?.toString() || '');
    setIsSetGoalDialogOpen(true);
  };


  return (
    <div className="space-y-8"> {/* Overall Page Container */}
      <Tabs value={analyticsView} onValueChange={(value) => setAnalyticsView(value as 'custom' | 'mdcat')}> {/* Tabs Root Start */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> {/* Header Section */}
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" />
            Performance Analytics
          </h1>
          <div className="flex gap-4 items-center"> {/* Controls for Tabs and Filter */}
              <TabsList> {/* TabsList is a child of Tabs */}
                <TabsTrigger value="custom">Custom Tests</TabsTrigger>
                <TabsTrigger value="mdcat" className="flex items-center gap-1">
                  <Archive className="h-4 w-4" /> Past MDCAT
                </TabsTrigger>
              </TabsList>
              <Select value={filterPeriod} onValueChange={setFilterPeriod} disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      
        <TabsContent value={analyticsView} className="mt-6 space-y-8"> {/* Content block, child of Tabs */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Percent className="h-6 w-6 text-primary" />
                Overall Performance Summary ({analyticsView === 'custom' ? 'Custom Tests' : 'Past MDCAT Tests'})
              </CardTitle>
              <CardDescription>Your cumulative performance for the selected test type.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <h3 className="text-4xl font-bold text-primary">{overallPerformance.averageScore.toFixed(1)}%</h3>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <h3 className="text-4xl font-bold text-primary">{overallPerformance.testsTaken}</h3>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg space-y-2">
                <Progress value={overallPerformance.averageScore} className="w-full h-3" />
                <p className="text-sm text-muted-foreground">Overall Average: {overallPerformance.averageScore.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Subject-wise Score Progression
                </CardTitle>
                <CardDescription>Track your scores across different subjects over time for {analyticsView === 'custom' ? 'custom tests' : 'past MDCAT tests'}.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
              {subjectScoreProgressionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subjectScoreProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]}/>
                    <Tooltip />
                    <Legend />
                    {allSubjects.map(subject => (
                      <Line key={subject} type="monotone" dataKey={subject} stroke={subjectColors[subject]} strokeWidth={2} activeDot={{ r: 6 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No subject progression data available for this view.</div>
              )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-500" />
                  Average Score by Subject
                </CardTitle>
                <CardDescription>Your average performance in each subject for {analyticsView === 'custom' ? 'custom tests' : 'past MDCAT tests'}.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {overallSubjectAverageScores.some(s => s.averageScore > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={overallSubjectAverageScores.filter(s => s.averageScore > 0)} 
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="averageScore"
                        nameKey="name"
                        >
                        {overallSubjectAverageScores.filter(s => s.averageScore > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={subjectColors[entry.name as Subject]} />
                        ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No subject scores available for this view.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-accent" />
                    Chapter Proficiency Trend ({selectedSubjectForChapterChart})
                  </CardTitle>
                  <CardDescription>Track your performance in each chapter over time for {analyticsView === 'custom' ? 'custom tests' : 'past MDCAT tests'}.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openGoalDialog()}>
                      <Goal className="mr-2 h-4 w-4" /> Set/Edit Chapter Goal
                    </Button>
                    <Select value={selectedSubjectForChapterChart} onValueChange={(value) => setSelectedSubjectForChapterChart(value as Subject)}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[450px]">
              {chapterProficiencyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chapterProficiencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                      labelFormatter={(label: string) => `Attempt: ${label}`}
                    />
                    <Legend />
                    {syllabus[selectedSubjectForChapterChart]?.map((chapter, index) => {
                      const goal = chapterGoals[selectedSubjectForChapterChart]?.[chapter.name];
                      return (
                        <React.Fragment key={chapter.name}>
                          <Line
                            type="monotone"
                            dataKey={chapter.name}
                            stroke={chapterLineColors[index % chapterLineColors.length]}
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            dot={{r:3}}
                            connectNulls 
                          />
                          {goal !== undefined && (
                            <ReferenceLine
                              y={goal}
                              label={{ value: `${chapter.name} Goal: ${goal}%`, position: 'insideTopRight', fill: chapterLineColors[index % chapterLineColors.length], dy: -5, dx:5, fontSize: '0.75rem' }}
                              stroke={chapterLineColors[index % chapterLineColors.length]}
                              strokeDasharray="3 3"
                              strokeWidth={1.5}
                              isFront={true}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No chapter performance data available for {selectedSubjectForChapterChart} in this view.</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-500" />
                Average Time per Question (Mock Data)
              </CardTitle>
              <CardDescription>Analyze your speed and time management across subjects (currently static mock data).</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={timeSpentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} mins`, "Avg. Time"]} />
                  <Legend />
                  <Bar dataKey="avgTimePerQuestion" name="Avg. Time (mins)" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> {/* End of Tabs Root */}


      <Dialog open={isSetGoalDialogOpen} onOpenChange={setIsSetGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Chapter Performance Goal</DialogTitle>
            <DialogDescription>
              Choose a subject, chapter, and set your target score (0-100%).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-subject" className="text-right">
                Subject
              </Label>
              <Select value={goalDialogSubject} onValueChange={(value) => setGoalDialogSubject(value as Subject)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-chapter" className="text-right">
                Chapter
              </Label>
              <Select 
                value={goalDialogChapter} 
                onValueChange={(value) => setGoalDialogChapter(value)}
                disabled={!syllabus[goalDialogSubject] || syllabus[goalDialogSubject].length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {syllabus[goalDialogSubject]?.map(chapter => (
                    <SelectItem key={chapter.name} value={chapter.name}>{chapter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-target" className="text-right">
                Target Score
              </Label>
              <Input
                id="goal-target"
                type="number"
                min="0"
                max="100"
                value={goalDialogTargetScore}
                onChange={(e) => setGoalDialogTargetScore(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 85"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSetGoalDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSetGoal}>Set Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    