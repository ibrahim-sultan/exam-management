import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  mockExams,
  mockExamAttempts,
  mockUsers,
  mockQuestions,
  ExamAttempt,
} from '../lib/mockData';
import {
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  StopCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function Monitoring() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(mockExamAttempts);

  const activeExams = mockExams.filter((e) => e.status === 'active');
  const ongoingAttempts = attempts.filter((a) => a.status === 'in_progress');

  const handleForceSubmit = (attemptId: string) => {
    setAttempts(
      attempts.map((a) =>
        a.id === attemptId
          ? {
              ...a,
              status: 'submitted',
              endTime: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success('Exam force-submitted successfully');
  };

  const handleSuspendExam = (attemptId: string) => {
    setAttempts(
      attempts.map((a) =>
        a.id === attemptId
          ? {
              ...a,
              status: 'suspended',
              endTime: new Date().toISOString(),
            }
          : a
      )
    );
    toast.warning('Exam suspended due to violations');
  };

  const getStudent = (studentId: string) => {
    return mockUsers.find((u) => u.id === studentId);
  };

  const getExam = (examId: string) => {
    return mockExams.find((e) => e.id === examId);
  };

  const getProgress = (attempt: ExamAttempt) => {
    const exam = getExam(attempt.examId);
    if (!exam) return 0;
    return (attempt.answers.length / exam.questions.length) * 100;
  };

  const getTimeElapsed = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - start) / 1000 / 60); // minutes
    return elapsed;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Live Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Monitor ongoing exams and detect suspicious activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Exams</p>
                <p className="text-2xl">{activeExams.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students Online</p>
                <p className="text-2xl">{ongoingAttempts.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings Issued</p>
                <p className="text-2xl">
                  {ongoingAttempts.reduce((sum, a) => sum + a.cheatingWarnings, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tab Switches</p>
                <p className="text-2xl">
                  {ongoingAttempts.reduce((sum, a) => sum + a.tabSwitches, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Exams Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {activeExams.map((exam) => {
          const examAttempts = ongoingAttempts.filter((a) => a.examId === exam.id);
          return (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{exam.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exam.subject} • {exam.classGroup}
                    </p>
                  </div>
                  <Badge variant="default">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Participants</span>
                  <span>{examAttempts.length} students</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exam.duration} minutes
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Progress</span>
                    <span>
                      {examAttempts.length > 0
                        ? Math.round(
                            examAttempts.reduce((sum, a) => sum + getProgress(a), 0) /
                              examAttempts.length
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      examAttempts.length > 0
                        ? examAttempts.reduce((sum, a) => sum + getProgress(a), 0) /
                          examAttempts.length
                        : 0
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ongoing Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Students Currently Taking Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {ongoingAttempts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students are currently taking exams</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Time Elapsed</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Tab Switches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ongoingAttempts.map((attempt) => {
                  const student = getStudent(attempt.studentId);
                  const exam = getExam(attempt.examId);
                  if (!student || !exam) return null;

                  return (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{exam.title}</p>
                          <p className="text-xs text-muted-foreground">{exam.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-xs">
                            <span>{Math.round(getProgress(attempt))}%</span>
                            <span>
                              {attempt.answers.length}/{exam.questions.length}
                            </span>
                          </div>
                          <Progress value={getProgress(attempt)} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeElapsed(attempt.startTime)}m
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.cheatingWarnings > 0 ? (
                          <Badge variant="destructive">{attempt.cheatingWarnings}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.tabSwitches > 0 ? (
                          <Badge variant="secondary">{attempt.tabSwitches}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info('Viewing student screen...')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleForceSubmit(attempt.id)}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attempts
              .filter((a) => a.cheatingWarnings > 0 || a.tabSwitches > 0)
              .slice(0, 5)
              .map((attempt) => {
                const student = getStudent(attempt.studentId);
                const exam = getExam(attempt.examId);
                if (!student || !exam) return null;

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{student.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.tabSwitches > 0 && (
                        <div className="text-sm">
                          <Badge variant="secondary">
                            {attempt.tabSwitches} tab switches
                          </Badge>
                        </div>
                      )}
                      {attempt.cheatingWarnings > 0 && (
                        <div className="text-sm">
                          <Badge variant="destructive">
                            {attempt.cheatingWarnings} warnings
                          </Badge>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSuspendExam(attempt.id)}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
