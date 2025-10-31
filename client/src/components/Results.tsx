import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { mockExams, mockExamAttempts, mockUsers, mockQuestions } from '../lib/mockData';
import { Download, TrendingUp, TrendingDown, Award, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function Results() {
  const [selectedExam, setSelectedExam] = useState<string>('all');

  const completedExams = mockExams.filter((e) => e.status === 'completed');
  const completedAttempts = mockExamAttempts.filter((a) => a.status === 'completed');

  const filteredAttempts =
    selectedExam === 'all'
      ? completedAttempts
      : completedAttempts.filter((a) => a.examId === selectedExam);

  const getStudent = (studentId: string) => {
    return mockUsers.find((u) => u.id === studentId);
  };

  const getExam = (examId: string) => {
    return mockExams.find((e) => e.id === examId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDownloadResults = (format: 'excel' | 'pdf') => {
    toast.success(`Downloading results as ${format.toUpperCase()}...`);
  };

  const calculateStats = () => {
    if (filteredAttempts.length === 0) return null;

    const scores = filteredAttempts.map((a) => a.score || 0);
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate =
      (filteredAttempts.filter((a) => (a.percentage || 0) >= 50).length /
        filteredAttempts.length) *
      100;

    return { average, highest, lowest, passRate };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Results & Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze exam results and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadResults('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleDownloadResults('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm">Filter by Exam:</label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {completedExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl">{stats.average.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <p className="text-2xl">{stats.highest.toFixed(1)}</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                  <p className="text-2xl">{stats.lowest.toFixed(1)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl">{stats.passRate.toFixed(0)}%</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results ({filteredAttempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed exams to display</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => {
                  const student = getStudent(attempt.studentId);
                  const exam = getExam(attempt.examId);
                  if (!student || !exam) return null;

                  const duration = attempt.endTime
                    ? Math.floor(
                        (new Date(attempt.endTime).getTime() -
                          new Date(attempt.startTime).getTime()) /
                          1000 /
                          60
                      )
                    : 0;

                  const passed = (attempt.percentage || 0) >= 50;

                  return (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.classGroup}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{exam.title}</p>
                          <p className="text-xs text-muted-foreground">{exam.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>
                          {attempt.score?.toFixed(1)} / {exam.totalMarks}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{attempt.percentage?.toFixed(1)}%</span>
                          {passed ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={passed ? 'default' : 'destructive'}>
                          {passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>{duration} min</TableCell>
                      <TableCell>
                        {attempt.cheatingWarnings > 0 ? (
                          <Badge variant="destructive">{attempt.cheatingWarnings}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info('Opening detailed report...')}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4>Score Distribution</h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span>90-100% (Excellent)</span>
                      <span>
                        {
                          filteredAttempts.filter(
                            (a) => (a.percentage || 0) >= 90
                          ).length
                        }{' '}
                        students
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>70-89% (Good)</span>
                      <span>
                        {
                          filteredAttempts.filter(
                            (a) =>
                              (a.percentage || 0) >= 70 && (a.percentage || 0) < 90
                          ).length
                        }{' '}
                        students
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>50-69% (Average)</span>
                      <span>
                        {
                          filteredAttempts.filter(
                            (a) =>
                              (a.percentage || 0) >= 50 && (a.percentage || 0) < 70
                          ).length
                        }{' '}
                        students
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Below 50% (Needs Improvement)</span>
                      <span>
                        {
                          filteredAttempts.filter(
                            (a) => (a.percentage || 0) < 50
                          ).length
                        }{' '}
                        students
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4>Cheating Incidents</h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Warnings Issued</span>
                      <span>
                        {filteredAttempts.reduce(
                          (sum, a) => sum + a.cheatingWarnings,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Tab Switches</span>
                      <span>
                        {filteredAttempts.reduce((sum, a) => sum + a.tabSwitches, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Students with Violations</span>
                      <span>
                        {
                          filteredAttempts.filter(
                            (a) => a.cheatingWarnings > 0 || a.tabSwitches > 0
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
