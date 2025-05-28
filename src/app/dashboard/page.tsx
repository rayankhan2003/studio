
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BookText, CalendarDays, CheckCircle2, LineChart, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const upcomingExams = [
    { id: "exam1", name: "Mathematics - Algebra Midterm", date: "2024-08-15", time: "10:00 AM" },
    { id: "exam2", name: "Physics - Mechanics Final", date: "2024-08-22", time: "02:00 PM" },
  ];

  const recentTests = [
    { id: "test1", name: "Chemistry - Atomic Structure Quiz", score: "85%", date: "2024-07-28" },
    { id: "test2", name: "Biology - Cell Biology Practice", score: "72%", date: "2024-07-25" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Dashboard</h1>
        <Button asChild>
          <Link href="/test/custom" legacyBehavior passHref>
            <a>
              <Settings className="mr-2 h-4 w-4" /> Create Custom Test
            </a>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Upcoming Exams
            </CardTitle>
            <CardDescription>Stay prepared for what's next.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingExams.length > 0 ? (
              <ul className="space-y-3">
                {upcomingExams.map((exam) => (
                  <li key={exam.id} className="p-3 bg-muted/50 rounded-md">
                    <h3 className="font-semibold">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.date} at {exam.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No upcoming exams scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Recent Tests
            </CardTitle>
            <CardDescription>Review your latest attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <ul className="space-y-3">
                {recentTests.map((test) => (
                  <li key={test.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">Completed: {test.date}</p>
                    </div>
                    <span className="font-bold text-lg text-primary">{test.score}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent tests found.</p>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/history" legacyBehavior passHref>
                <a>View All History</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <LineChart className="h-6 w-6 text-accent" />
              Performance Summary
            </CardTitle>
            <CardDescription>A quick look at your overall progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Image 
              src="https://placehold.co/400x200.png" 
              alt="Performance summary chart" 
              data-ai-hint="summary chart"
              width={400} 
              height={200} 
              className="rounded-md"
            />
            <Button asChild className="w-full">
              <Link href="/analytics" legacyBehavior passHref>
                <a>View Detailed Analytics</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="secondary" className="w-full h-16 text-base">
            <Link href="/insights" legacyBehavior passHref>
              <a>AI Study Insights</a>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full h-16 text-base">
            <Link href="/test/new-subject-test" legacyBehavior passHref>
              <a>Practice a Subject</a>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full h-16 text-base">
            <Link href="/faq" legacyBehavior passHref>
              <a>View FAQs</a>
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
