
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Download, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';

interface StoredTestReport {
  id: string;
  name: string;
  date: string;
  curriculum: 'MDCAT' | 'O Level' | 'A Level';
  overallScorePercentage: number;
}

export default function TestHistoryPage() {
  const [history, setHistory] = useState<StoredTestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedHistoryString = localStorage.getItem('prepwiseTestHistory');
    if (storedHistoryString) {
      const storedHistory: StoredTestReport[] = JSON.parse(storedHistoryString);
      // Sort by date, most recent first
      storedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(storedHistory);
    }
    setIsLoading(false);
  }, []);

  const tableBodyContent = useMemo(() => {
    return history.map((test) => (
      <TableRow key={test.id}>
        <TableCell className="font-medium">{test.name}</TableCell>
        <TableCell>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            test.curriculum === 'MDCAT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {test.curriculum}
          </span>
        </TableCell>
        <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
        <TableCell className="font-semibold text-primary">{test.overallScorePercentage.toFixed(1)}%</TableCell>
        <TableCell className="text-right space-x-2">
          <Button asChild variant="outline" size="sm" aria-label={`Review ${test.name}`}>
            <Link href={`/test/${test.id}/review`}>
              <Eye className="mr-1 h-4 w-4" /> Review
            </Link>
          </Button>
          <Button variant="outline" size="sm" aria-label={`Download report for ${test.name}`} disabled>
            <Download className="mr-1 h-4 w-4" /> Report
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [history]);

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
          {isLoading ? (
            <p>Loading history...</p>
          ) : history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Curriculum</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableBodyContent}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl">No test history found.</p>
              <p>Start taking tests to see your progress here.</p>
              <Button asChild className="mt-6 inline-block">
                <Link href="/test/custom">Create a Test</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
