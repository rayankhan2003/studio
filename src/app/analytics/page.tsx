
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { BarChart3, TrendingUp, BookOpen, Clock, Percent, Users, Target, Edit3, Goal } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Subjects, syllabus, type Subject, allSubjects, getChaptersForSubject, type Chapter } from '@/lib/syllabus';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

// Enhanced Mock Data
const overallPerformance = {
  averageScore: 78, // Percentage
  testsTaken: 15,
  overallProgress: 65, // Percentage towards a goal or completion
};

// Combined subject score progression (used for overall subject trends)
const subjectScoreProgressionData = [
  { name: 'Test 1', [Subjects.BIOLOGY]: 75, [Subjects.CHEMISTRY]: 60, [Subjects.PHYSICS]: 80, [Subjects.ENGLISH]: 70, [Subjects.LOGICAL_REASONING]: 65, date: '2024-06-01' },
  { name: 'Test 2', [Subjects.BIOLOGY]: 80, [Subjects.CHEMISTRY]: 65, [Subjects.PHYSICS]: 78, [Subjects.ENGLISH]: 75, [Subjects.LOGICAL_REASONING]: 70, date: '2024-06-15' },
  { name: 'Test 3', [Subjects.BIOLOGY]: 70, [Subjects.CHEMISTRY]: 72, [Subjects.PHYSICS]: 85, [Subjects.ENGLISH]: 68, [Subjects.LOGICAL_REASONING]: 72, date: '2024-07-01' },
  { name: 'Test 4', [Subjects.BIOLOGY]: 85, [Subjects.CHEMISTRY]: 78, [Subjects.PHYSICS]: 82, [Subjects.ENGLISH]: 80, [Subjects.LOGICAL_REASONING]: 75, date: '2024-07-15' },
  { name: 'Test 5', [Subjects.BIOLOGY]: 82, [Subjects.CHEMISTRY]: 80, [Subjects.PHYSICS]: 79, [Subjects.ENGLISH]: 77, [Subjects.LOGICAL_REASONING]: 78, date: '2024-07-30' },
];

// New: Historical data for chapter proficiency over multiple tests
// Structure: { [subject]: { [chapterName]: [{ testName: string, score: number }] } }
const chapterPerformanceHistoryData: Record<Subject, Record<string, { testName: string; score: number }[]>> = {
  [Subjects.BIOLOGY]: {
    [syllabus[Subjects.BIOLOGY][0].name]: [{ testName: 'Test 1', score: 70 }, { testName: 'Test 2', score: 75 }, { testName: 'Test 3', score: 72 }, { testName: 'Test 4', score: 80 }, { testName: 'Test 5', score: 82 }],
    [syllabus[Subjects.BIOLOGY][1].name]: [{ testName: 'Test 1', score: 60 }, { testName: 'Test 2', score: 65 }, { testName: 'Test 3', score: 68 }, { testName: 'Test 4', score: 70 }, { testName: 'Test 5', score: 75 }],
    [syllabus[Subjects.BIOLOGY][2].name]: [{ testName: 'Test 1', score: 55 }, { testName: 'Test 2', score: 60 }, { testName: 'Test 3', score: 58 }, { testName: 'Test 4', score: 65 }, { testName: 'Test 5', score: 70 }],
    [syllabus[Subjects.BIOLOGY][3].name]: [{ testName: 'Test 1', score: 80 }, { testName: 'Test 2', score: 82 }, { testName: 'Test 3', score: 85 }, { testName: 'Test 4', score: 88 }, { testName: 'Test 5', score: 90 }],
  },
  [Subjects.CHEMISTRY]: {
    [syllabus[Subjects.CHEMISTRY][0].name]: [{ testName: 'Test 1', score: 65 }, { testName: 'Test 2', score: 70 }, { testName: 'Test 3', score: 68 }, { testName: 'Test 4', score: 72 }, { testName: 'Test 5', score: 78 }],
    [syllabus[Subjects.CHEMISTRY][1].name]: [{ testName: 'Test 1', score: 50 }, { testName: 'Test 2', score: 55 }, { testName: 'Test 3', score: 60 }, { testName: 'Test 4', score: 62 }, { testName: 'Test 5', score: 68 }],
  },
  [Subjects.PHYSICS]: {
    [syllabus[Subjects.PHYSICS][0].name]: [{ testName: 'Test 1', score: 70 }, { testName: 'Test 2', score: 68 }, { testName: 'Test 3', score: 75 }, { testName: 'Test 4', score: 72 }, { testName: 'Test 5', score: 78 }],
  },
  [Subjects.ENGLISH]: {
    [syllabus[Subjects.ENGLISH][0].name]: [{ testName: 'Test 1', score: 80 }, { testName: 'Test 2', score: 85 }, { testName: 'Test 3', score: 82 }, { testName: 'Test 4', score: 88 }, { testName: 'Test 5', score: 90 }],
  },
  [Subjects.LOGICAL_REASONING]: {
    [syllabus[Subjects.LOGICAL_REASONING][0].name]: [{ testName: 'Test 1', score: 60 }, { testName: 'Test 2', score: 65 }, { testName: 'Test 3', score: 70 }, { testName: 'Test 4', score: 72 }, { testName: 'Test 5', score: 75 }],
  },
};


const timeSpentData = [
  { name: Subjects.BIOLOGY, avgTimePerQuestion: 1.5 }, // minutes
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
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))", 
  "hsl(var(--accent))",
];


export default function AnalyticsPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subjects.BIOLOGY);
  const [filterPeriod, setFilterPeriod] = useState('all-time');

  // State for goal setting
  const [isSetGoalDialogOpen, setIsSetGoalDialogOpen] = useState(false);
  const [goalDialogSubject, setGoalDialogSubject] = useState<Subject>(Subjects.BIOLOGY);
  const [goalDialogChapter, setGoalDialogChapter] = useState<string>('');
  const [goalDialogTargetScore, setGoalDialogTargetScore] = useState<string>('');
  const [chapterGoals, setChapterGoals] = useState<Record<Subject, Record<string, number>>>({
    // Example: [Subjects.BIOLOGY]: { "Cell Structure & Function": 90 }
  });

  useEffect(() => {
    // Reset chapter selection when subject changes in dialog
    if (syllabus[goalDialogSubject]?.length > 0) {
      setGoalDialogChapter(syllabus[goalDialogSubject][0].name);
    } else {
      setGoalDialogChapter('');
    }
  }, [goalDialogSubject]);


  const overallSubjectPerformance = useMemo(() => {
    return allSubjects.map(subject => {
      const scores = subjectScoreProgressionData.map(test => test[subject] || 0);
      const average = scores.reduce((acc, score) => acc + score, 0) / (scores.length || 1);
      return { name: subject, averageScore: parseFloat(average.toFixed(1)) };
    });
  }, []);

  // Prepare data for the chapter proficiency line chart
  const chapterProficiencyChartData = useMemo(() => {
    const subjectChapters = syllabus[selectedSubject];
    if (!subjectChapters || !chapterPerformanceHistoryData[selectedSubject]) return [];

    // Assuming all chapters in history data have entries for all tests (Test 1 to Test 5)
    // This needs to be robust if test sets are inconsistent.
    const testNames = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']; 

    return testNames.map(testName => {
      const dataPoint: { name: string; [chapterName: string]: number | string } = { name: testName };
      subjectChapters.forEach(chapter => {
        const history = chapterPerformanceHistoryData[selectedSubject]?.[chapter.name];
        const testEntry = history?.find(entry => entry.testName === testName);
        dataPoint[chapter.name] = testEntry ? testEntry.score : 0; // Default to 0 if no score
      });
      return dataPoint;
    });
  }, [selectedSubject]);
  
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
    setGoalDialogTargetScore(''); // Reset for next time
  };
  
  const openGoalDialog = (subject?: Subject, chapter?: string) => {
    setGoalDialogSubject(subject || selectedSubject || allSubjects[0]);
    const chaptersForSubject = syllabus[subject || selectedSubject || allSubjects[0]];
    setGoalDialogChapter(chapter || (chaptersForSubject.length > 0 ? chaptersForSubject[0].name : ''));
    setGoalDialogTargetScore(chapterGoals[subject || selectedSubject]?.[chapter || '']?.toString() || '');
    setIsSetGoalDialogOpen(true);
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" />
          Performance Analytics
        </h1>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 Days</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            Overall Performance Summary
          </CardTitle>
          <CardDescription>Your cumulative performance across all tests.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <h3 className="text-4xl font-bold text-primary">{overallPerformance.averageScore}%</h3>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <h3 className="text-4xl font-bold text-primary">{overallPerformance.testsTaken}</h3>
            <p className="text-sm text-muted-foreground">Tests Taken</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg space-y-2">
             <Progress value={overallPerformance.overallProgress} className="w-full h-3" />
             <p className="text-sm text-muted-foreground">Overall Progress: {overallPerformance.overallProgress}%</p>
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
            <CardDescription>Track your scores across different subjects over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectScoreProgressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]}/>
                <Tooltip />
                <Legend />
                {allSubjects.map(subject => (
                  <Line key={subject} type="monotone" dataKey={subject} stroke={subjectColors[subject]} strokeWidth={2} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-6 w-6 text-green-500" />
              Average Score by Subject
            </CardTitle>
            <CardDescription>Your average performance in each subject.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallSubjectPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="averageScore"
                  nameKey="name"
                >
                  {overallSubjectPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={subjectColors[entry.name as Subject]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Chapter Proficiency - Now a Line Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-accent" />
                Chapter Proficiency Trend ({selectedSubject})
              </CardTitle>
              <CardDescription>Track your performance in each chapter over time for the selected subject.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openGoalDialog()}>
                  <Goal className="mr-2 h-4 w-4" /> Set/Edit Chapter Goal
                </Button>
                <Select value={selectedSubject} onValueChange={(value) => setSelectedSubject(value as Subject)}>
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chapterProficiencyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value}%`, name]}
                labelFormatter={(label: string) => `Test: ${label}`}
              />
              <Legend />
              {syllabus[selectedSubject]?.map((chapter, index) => {
                const goal = chapterGoals[selectedSubject]?.[chapter.name];
                return (
                  <React.Fragment key={chapter.name}>
                    <Line
                      type="monotone"
                      dataKey={chapter.name}
                      stroke={chapterLineColors[index % chapterLineColors.length]}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                      dot={{r:3}}
                    />
                    {goal !== undefined && (
                      <ReferenceLine
                        y={goal}
                        label={{ value: `${chapter.name} Goal: ${goal}%`, position: 'insideTopRight', fill: chapterLineColors[index % chapterLineColors.length], dy: -5, dx:5, fontSize: '0.75rem' }}
                        stroke={chapterLineColors[index % chapterLineColors.length]}
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Average Time per Question
          </CardTitle>
          <CardDescription>Analyze your speed and time management across subjects.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSpentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} mins`, "Avg. Time"]} />
              <Legend />
              <Bar dataKey="avgTimePerQuestion" name="Avg. Time (mins)" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Setting Dialog */}
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

