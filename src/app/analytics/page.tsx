
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, BookOpen, Clock, Percent, Users, Target } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Subjects, syllabus, type Subject, allSubjects, getChaptersForSubject } from '@/lib/syllabus';
import { Progress } from '@/components/ui/progress';

// Enhanced Mock Data
const overallPerformance = {
  averageScore: 78, // Percentage
  testsTaken: 15,
  overallProgress: 65, // Percentage towards a goal or completion
};

const subjectScoreProgressionData = [
  { name: 'Test 1', [Subjects.BIOLOGY]: 75, [Subjects.CHEMISTRY]: 60, [Subjects.PHYSICS]: 80, [Subjects.ENGLISH]: 70, [Subjects.LOGICAL_REASONING]: 65 },
  { name: 'Test 2', [Subjects.BIOLOGY]: 80, [Subjects.CHEMISTRY]: 65, [Subjects.PHYSICS]: 78, [Subjects.ENGLISH]: 75, [Subjects.LOGICAL_REASONING]: 70 },
  { name: 'Test 3', [Subjects.BIOLOGY]: 70, [Subjects.CHEMISTRY]: 72, [Subjects.PHYSICS]: 85, [Subjects.ENGLISH]: 68, [Subjects.LOGICAL_REASONING]: 72 },
  { name: 'Test 4', [Subjects.BIOLOGY]: 85, [Subjects.CHEMISTRY]: 78, [Subjects.PHYSICS]: 82, [Subjects.ENGLISH]: 80, [Subjects.LOGICAL_REASONING]: 75 },
  { name: 'Test 5', [Subjects.BIOLOGY]: 82, [Subjects.CHEMISTRY]: 80, [Subjects.PHYSICS]: 79, [Subjects.ENGLISH]: 77, [Subjects.LOGICAL_REASONING]: 78 },
];

const initialChapterProficiencyData: Record<Subject, { chapter: string; proficiency: number; fill: string }[]> = {
  [Subjects.BIOLOGY]: syllabus[Subjects.BIOLOGY].map((ch, i) => ({ chapter: ch.name, proficiency: Math.floor(Math.random() * 60) + 40, fill: `hsl(var(--chart-${(i % 5) + 1}))` })),
  [Subjects.CHEMISTRY]: syllabus[Subjects.CHEMISTRY].map((ch, i) => ({ chapter: ch.name, proficiency: Math.floor(Math.random() * 60) + 40, fill: `hsl(var(--chart-${(i % 5) + 1}))` })),
  [Subjects.PHYSICS]: syllabus[Subjects.PHYSICS].map((ch, i) => ({ chapter: ch.name, proficiency: Math.floor(Math.random() * 60) + 40, fill: `hsl(var(--chart-${(i % 5) + 1}))` })),
  [Subjects.ENGLISH]: syllabus[Subjects.ENGLISH].map((ch, i) => ({ chapter: ch.name, proficiency: Math.floor(Math.random() * 60) + 40, fill: `hsl(var(--chart-${(i % 5) + 1}))` })),
  [Subjects.LOGICAL_REASONING]: syllabus[Subjects.LOGICAL_REASONING].map((ch, i) => ({ chapter: ch.name, proficiency: Math.floor(Math.random() * 60) + 40, fill: `hsl(var(--chart-${(i % 5) + 1}))` })),
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

export default function AnalyticsPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subjects.BIOLOGY);
  const [filterPeriod, setFilterPeriod] = useState('all-time'); // Example filter state

  const chapterDataForSelectedSubject = useMemo(() => {
    return initialChapterProficiencyData[selectedSubject] || [];
  }, [selectedSubject]);
  
  const overallSubjectPerformance = useMemo(() => {
    return allSubjects.map(subject => {
      const scores = subjectScoreProgressionData.map(test => test[subject] || 0);
      const average = scores.reduce((acc, score) => acc + score, 0) / (scores.length || 1);
      return { name: subject, averageScore: parseFloat(average.toFixed(1)) };
    });
  }, []);


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

      {/* Overall Performance Summary */}
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

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              Chapter Proficiency ({selectedSubject})
            </CardTitle>
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
          <CardDescription>Identify your strengths and weaknesses in each chapter for the selected subject. Click on a bar to view detailed topic breakdown (future feature).</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] overflow-x-auto">
          <ResponsiveContainer width={Math.max(chapterDataForSelectedSubject.length * 60, 500)} height="100%">
            <BarChart data={chapterDataForSelectedSubject} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]}/>
              <YAxis dataKey="chapter" type="category" width={150} interval={0} style={{ fontSize: '0.8rem' }}/>
              <Tooltip formatter={(value: number) => [`${value}%`, "Proficiency"]}/>
              <Legend />
              <Bar dataKey="proficiency" name="Proficiency (%)" radius={[0, 4, 4, 0]} barSize={20}>
                {chapterDataForSelectedSubject.map((entry, index) => (
                  <Cell cursor="pointer" fill={entry.fill} key={`cell-${index}`}/>
                ))}
              </Bar>
            </BarChart>
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
    </div>
  );
}
