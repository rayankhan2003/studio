'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, BookOpen, Clock } from 'lucide-react';

// Mock data - replace with actual data
const subjectScoreData = [
  { name: 'Test 1', Math: 75, Physics: 60, Chemistry: 80 },
  { name: 'Test 2', Math: 80, Physics: 65, Chemistry: 78 },
  { name: 'Test 3', Math: 70, Physics: 72, Chemistry: 85 },
  { name: 'Test 4', Math: 85, Physics: 78, Chemistry: 82 },
];

const chapterProficiencyData = {
  Math: [
    { chapter: 'Algebra', proficiency: 80, fill: "hsl(var(--chart-1))" },
    { chapter: 'Calculus', proficiency: 60, fill: "hsl(var(--chart-2))" },
    { chapter: 'Geometry', proficiency: 90, fill: "hsl(var(--chart-3))" },
  ],
  Physics: [
    { chapter: 'Mechanics', proficiency: 70, fill: "hsl(var(--chart-1))" },
    { chapter: 'Optics', proficiency: 50, fill: "hsl(var(--chart-2))" },
    { chapter: 'Thermodynamics', proficiency: 85, fill: "hsl(var(--chart-4))" },
  ],
};

const timeSpentData = [
  { name: 'Math', avgTimePerQuestion: 2.5 }, // minutes
  { name: 'Physics', avgTimePerQuestion: 3.1 },
  { name: 'Chemistry', avgTimePerQuestion: 2.0 },
];


export default function AnalyticsPage() {
  // State for filters, e.g., selected subject for chapter proficiency
  // const [selectedSubject, setSelectedSubject] = useState('Math');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" />
          Performance Analytics
        </h1>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="test-wise">Test-wise</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <LineChart data={subjectScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Math" stroke="hsl(var(--chart-1))" strokeWidth={2} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Physics" stroke="hsl(var(--chart-2))" strokeWidth={2} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Chemistry" stroke="hsl(var(--chart-3))" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
             <BookOpen className="h-6 w-6 text-accent" />
            Chapter Proficiency (Math)
            {/* TODO: Add subject selector here */}
          </CardTitle>
          <CardDescription>Identify your strengths and weaknesses in each chapter.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chapterProficiencyData.Math}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="chapter" />
              <YAxis domain={[0, 100]}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="proficiency" name="Proficiency (%)" radius={[4, 4, 0, 0]} />
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
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value: number) => [`${value} mins`, "Avg. Time"]} />
              <Legend />
              <Bar dataKey="avgTimePerQuestion" name="Avg. Time (mins)" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
