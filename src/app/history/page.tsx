
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Download, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import { Subjects } from '@/lib/syllabus';

// Mock data - replace with actual data
const mockHistory = [
  { id: 'test001', name: 'Biology - Acellular Life Quiz', date: '2024-07-15', score: '85%', subject: Subjects.BIOLOGY },
  { id: 'test002', name: 'Physics - Kinematics Practice', date: '2024-07-18', score: '72%', subject: Subjects.PHYSICS },
  { id: 'test003', name: 'Chemistry - Stoichiometry Test', date: '2024-07-22', score: '90%', subject: Subjects.CHEMISTRY },
  { id: 'test004', name: 'English - Vocabulary Builder I', date: '2024-07-25', score: '65%', subject: Subjects.ENGLISH },
  { id: 'test005', name: 'Logical Reasoning - Critical Thinking Set A', date: '2024-07-28', score: '78%', subject: Subjects.LOGICAL_REASONING },
  { id: 'test006', name: 'Biology - Bioenergetics Review', date: '2024-07-30', score: '88%', subject: Subjects.BIOLOGY },
];

export default function TestHistoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <HistoryIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Test History</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Past Assessments</CardTitle>
          <CardDescription>Review your performance in previously attempted tests and track your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.subject}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell className="font-semibold text-primary">{test.score}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/test/${test.id}/review`} passHref>
                        <Button variant="outline" size="sm" aria-label={`Review ${test.name}`}>
                          <Eye className="mr-1 h-4 w-4" /> Review
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" aria-label={`Download report for ${test.name}`}>
                        <Download className="mr-1 h-4 w-4" /> Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl">No test history found.</p>
              <p>Start taking tests to see your progress here.</p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
