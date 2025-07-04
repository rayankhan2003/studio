
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, BookOpen, Percent, Target, GraduationCap, Loader2 } from 'lucide-react';
import { allSubjects as allMdcatSubjects, syllabus as mdcatSyllabus } from '@/lib/syllabus';
import { allCambridgeSubjects, cambridgeSyllabus, CambridgeLevels } from '@/lib/cambridge-syllabus';
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
  curriculum: 'MDCAT' | 'O Level' | 'A Level';
  testType: 'Custom' | 'Past Paper';
  overallScorePercentage: number;
  subjectScores: Partial<Record<string, number>>;
  chapterScores: Partial<Record<string, Record<string, number>>>;
}

const subjectColors: Record<string, string> = {
  "Biology": "hsl(var(--chart-1))",
  "Chemistry": "hsl(var(--chart-2))",
  "Physics": "hsl(var(--chart-3))",
  "English": "hsl(var(--chart-4))",
  "Logical Reasoning": "hsl(var(--chart-5))",
};
const chapterLineColors = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--primary))", "hsl(var(--accent))",
];

const AnalyticsDisplay = React.memo(({
  currentView,
  overallPerformance,
  subjectScoreProgressionData,
  availableSubjects,
  overallSubjectAverageScores,
  selectedSubjectForChapterChart,
  setSelectedSubjectForChapterChart,
  chapterProficiencyChartData,
  availableSyllabus,
}: any) => (
  <div className="space-y-8">
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Percent className="h-6 w-6 text-primary" />
          Overall Performance Summary ({currentView})
        </CardTitle>
        <CardDescription>Your cumulative performance for the selected test type.</CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
          <h3 className="text-4xl font-bold text-primary">{overallPerformance.averageScore.toFixed(1)}%</h3>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
          <h3 className="text-4xl font-bold text-primary">{overallPerformance.testsTaken}</h3>
          <p className="text-sm text-muted-foreground">Tests Taken</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg space-y-2 sm:col-span-2 md:col-span-1">
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
          <CardDescription>Track your scores across different subjects over time for {currentView} tests.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] sm:h-[400px]">
          {subjectScoreProgressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectScoreProgressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis domain={[0, 100]} tick={{fontSize: 12}}/>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
                {availableSubjects.map((subject: string) => (
                  <Line key={subject} type="monotone" dataKey={subject} stroke={subjectColors[subject] || '#8884d8'} strokeWidth={2} activeDot={{ r: 6 }} connectNulls dot={{r:3}} />
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
          <CardDescription>Your average performance in each subject for {currentView} tests.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] sm:h-[400px]">
          {overallSubjectAverageScores.some((s: any) => s.averageScore > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallSubjectAverageScores.filter((s: any) => s.averageScore > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: ${Number(value).toFixed(1)}%`}
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="averageScore"
                  nameKey="name"
                >
                  {overallSubjectAverageScores.filter((s: any) => s.averageScore > 0).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={subjectColors[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                <Legend wrapperStyle={{fontSize: "0.8rem"}} />
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              Chapter Proficiency Trend ({selectedSubjectForChapterChart || 'N/A'})
            </CardTitle>
            <CardDescription>Track your performance in each chapter over time for {currentView} tests.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {availableSubjects.length > 0 && (
              <Select value={selectedSubjectForChapterChart} onValueChange={setSelectedSubjectForChapterChart}>
                <SelectTrigger className="w-full sm:w-[200px] md:w-[220px]">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] md:h-[450px]">
        {chapterProficiencyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chapterProficiencyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                labelFormatter={(label: string) => `Attempt: ${label}`}
              />
              <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
              {(availableSyllabus[selectedSubjectForChapterChart] || []).map((chapter: any, index: number) => (
                <Line
                  key={chapter.name}
                  type="monotone"
                  dataKey={chapter.name}
                  stroke={chapterLineColors[index % chapterLineColors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{r:3}}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">No chapter performance data available for {selectedSubjectForChapterChart || 'this subject'} in this view.</div>
        )}
      </CardContent>
    </Card>
  </div>
));
AnalyticsDisplay.displayName = 'AnalyticsDisplay';


export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<'mdcat' | 'cambridge'>('mdcat');
  const [cambridgeLevel, setCambridgeLevel] = useState<'O Level' | 'A Level'>('O Level');
  const [selectedSubjectForChapterChart, setSelectedSubjectForChapterChart] = useState<string>('');

  const [overallPerformance, setOverallPerformance] = useState({ averageScore: 0, testsTaken: 0 });
  const [subjectScoreProgressionData, setSubjectScoreProgressionData] = useState<Array<Record<string, any>>>([]);
  const [chapterPerformanceHistoryData, setChapterPerformanceHistoryData] = useState<Record<string, Record<string, { testName: string; score: number }[]>>>({});
  
  const [isSetGoalDialogOpen, setIsSetGoalDialogOpen] = useState(false);
  const [goalDialogSubject, setGoalDialogSubject] = useState<string>('');
  const [goalDialogChapter, setGoalDialogChapter] = useState<string>('');
  const [goalDialogTargetScore, setGoalDialogTargetScore] = useState<string>('');
  const [chapterGoals, setChapterGoals] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { subjects: availableSubjects, syllabus: availableSyllabus, view: currentView } = useMemo(() => {
    if (analyticsView === 'cambridge') {
      return { subjects: allCambridgeSubjects, syllabus: cambridgeSyllabus[cambridgeLevel], view: cambridgeLevel };
    }
    return { subjects: allMdcatSubjects, syllabus: mdcatSyllabus, view: 'MDCAT' as 'MDCAT' };
  }, [analyticsView, cambridgeLevel]);

  useEffect(() => {
    if (isClient) {
      if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubjectForChapterChart)) {
        setSelectedSubjectForChapterChart(availableSubjects[0]);
      } else if (availableSubjects.length === 0) {
        setSelectedSubjectForChapterChart('');
      }
    }
  }, [availableSubjects, selectedSubjectForChapterChart, isClient]);
  
  useEffect(() => {
    if (!isClient) return;

    const storedHistoryString = localStorage.getItem('prepwiseTestHistory');
    let storedHistory: StoredTestReport[] = storedHistoryString ? JSON.parse(storedHistoryString) : [];
    storedHistory = storedHistory.filter(report => report.curriculum === currentView);
    
    let newTotalScoreSum = 0;
    const newSubjectProgression: Array<Record<string, any>> = [];
    
    const newChapterHistory: Record<string, Record<string, { testName: string; score: number }[]>> =
      availableSubjects.reduce((acc, subj) => {
        acc[subj] = {};
        if (availableSyllabus[subj]) {
          availableSyllabus[subj].forEach(chap => {
            acc[subj][chap.name] = [];
          });
        }
        return acc;
      }, {} as Record<string, Record<string, { testName: string; score: number }[]>>);

    if (storedHistory.length > 0) {
      storedHistory.forEach(report => {
        const progressionEntry: Record<string, any> = { name: report.name, date: report.date };
        newTotalScoreSum += report.overallScorePercentage;

        availableSubjects.forEach(subj => {
          if (report.subjectScores[subj] !== undefined) {
            progressionEntry[subj] = report.subjectScores[subj];
          }
        });
        newSubjectProgression.push(progressionEntry);

        availableSubjects.forEach(subj => {
          if (report.chapterScores?.[subj]) {
            for (const chapterName in report.chapterScores[subj]) {
              if (newChapterHistory[subj]?.[chapterName]) {
                 newChapterHistory[subj][chapterName].push({
                    testName: report.name,
                    score: report.chapterScores[subj]![chapterName],
                });
              }
            }
          }
        });
      });
    }

    setSubjectScoreProgressionData(newSubjectProgression);
    setChapterPerformanceHistoryData(newChapterHistory);
    setOverallPerformance({
      testsTaken: storedHistory.length,
      averageScore: storedHistory.length > 0 ? parseFloat((newTotalScoreSum / storedHistory.length).toFixed(1)) : 0,
    });
  }, [currentView, availableSubjects, availableSyllabus, isClient]);
  
  useEffect(() => {
    if (goalDialogSubject && availableSyllabus[goalDialogSubject]?.length > 0) {
      setGoalDialogChapter(availableSyllabus[goalDialogSubject][0].name);
    } else {
      setGoalDialogChapter('');
    }
  }, [goalDialogSubject, availableSyllabus]);

  const overallSubjectAverageScores = useMemo(() => {
    if (subjectScoreProgressionData.length === 0) {
      return availableSubjects.map(subject => ({ name: subject, averageScore: 0 }));
    }
    const subjectTotals: Record<string, { sum: number, count: number }> =
      availableSubjects.reduce((acc, s) => ({...acc, [s]: { sum: 0, count: 0 }}), {} as any);

    subjectScoreProgressionData.forEach(test => {
      availableSubjects.forEach(subject => {
        if (test[subject] !== undefined && typeof test[subject] === 'number') {
          subjectTotals[subject].sum += test[subject];
          subjectTotals[subject].count++;
        }
      });
    });
    return availableSubjects.map(subject => {
      const avg = subjectTotals[subject].count > 0 ? subjectTotals[subject].sum / subjectTotals[subject].count : 0;
      return { name: subject, averageScore: parseFloat(avg.toFixed(1)) };
    });
  }, [subjectScoreProgressionData, availableSubjects]);

  const chapterProficiencyChartData = useMemo(() => {
    if (!selectedSubjectForChapterChart || !availableSyllabus[selectedSubjectForChapterChart]) return [];
    
    const subjectChapters = availableSyllabus[selectedSubjectForChapterChart];
    const historyForSelectedSubject = chapterPerformanceHistoryData[selectedSubjectForChapterChart];
    if (!subjectChapters || !historyForSelectedSubject) return [];

    const testNamesSet = new Set<string>();
    subjectChapters.forEach(chapter => {
      (historyForSelectedSubject[chapter.name] || []).forEach(entry => {
        testNamesSet.add(entry.testName);
      });
    });
    const sortedTestNames = Array.from(testNamesSet).sort((a, b) => {
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
  }, [selectedSubjectForChapterChart, chapterPerformanceHistoryData, subjectScoreProgressionData, availableSyllabus]);
  
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

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const analyticsDisplayProps = {
    currentView,
    overallPerformance,
    subjectScoreProgressionData,
    availableSubjects,
    overallSubjectAverageScores,
    selectedSubjectForChapterChart,
    setSelectedSubjectForChapterChart,
    chapterProficiencyChartData,
    availableSyllabus,
  };

  return (
    <div className="space-y-8">
      <Tabs value={analyticsView} onValueChange={(v) => setAnalyticsView(v as 'mdcat' | 'cambridge')}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" />
            Performance Analytics
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
              <TabsTrigger value="mdcat">MDCAT</TabsTrigger>
              <TabsTrigger value="cambridge" className="flex items-center gap-1 w-full">
                <GraduationCap className="h-4 w-4" /> Cambridge
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="mdcat" className="mt-6">
          <AnalyticsDisplay {...analyticsDisplayProps} />
        </TabsContent>

        <TabsContent value="cambridge" className="mt-6">
          <Tabs value={cambridgeLevel} onValueChange={(v) => setCambridgeLevel(v as 'O Level' | 'A Level')}>
            <TabsList className="mb-4">
              <TabsTrigger value="O Level">O Level</TabsTrigger>
              <TabsTrigger value="A Level">A Level</TabsTrigger>
            </TabsList>
            <TabsContent value="O Level">
              <AnalyticsDisplay {...analyticsDisplayProps} />
            </TabsContent>
            <TabsContent value="A Level">
              <AnalyticsDisplay {...analyticsDisplayProps} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <Dialog open={isSetGoalDialogOpen} onOpenChange={setIsSetGoalDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
              <Select value={goalDialogSubject} onValueChange={setGoalDialogSubject}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject: string) => (
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
                onValueChange={setGoalDialogChapter}
                disabled={!availableSyllabus[goalDialogSubject] || availableSyllabus[goalDialogSubject].length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {availableSyllabus[goalDialogSubject]?.map((chapter: any) => (
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
