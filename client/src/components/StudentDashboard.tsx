import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { mockExams, mockExamAttempts, User } from '../lib/mockData';
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onStartExam: (examId: string) => void;
}

export default function StudentDashboard({ user, onStartExam }: StudentDashboardProps) {
  const now = new Date();

  // Get student's exams (filter by class if needed)
  const allExams = mockExams.filter((e) => e.classGroup === user.classGroup);

  const upcomingExams = allExams.filter(
    (e) => e.status === 'scheduled' && new Date(e.startDate) > now
  );

  const activeExams = allExams.filter(
    (e) => e.status === 'active' && new Date(e.endDate) > now
  );

  const pastExams = allExams.filter(
    (e) => e.status === 'completed' || new Date(e.endDate) < now
  );

  const studentAttempts = mockExamAttempts.filter((a) => a.studentId === user.id);
  const completedAttempts = studentAttempts.filter((a) => a.status === 'completed');

  const averageScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
        completedAttempts.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1>Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your exams</p>
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
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl">{upcomingExams.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl">{completedAttempts.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl">{averageScore.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Exams */}
      {activeExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Active Exams - Take Now!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeExams.map((exam) => {
                const attempt = studentAttempts.find((a) => a.examId === exam.id);
                const isInProgress = attempt?.status === 'in_progress';

                return (
                  <div
                    key={exam.id}
                    className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{exam.title}</h3>
                          <Badge variant="default">Live</Badge>
                          {isInProgress && <Badge variant="secondary">In Progress</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {exam.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{exam.subject}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{exam.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{exam.questions.length} questions</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => onStartExam(exam.id)} size="lg">
                        {isInProgress ? 'Continue Exam' : 'Start Exam'}
                      </Button>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Ends: {new Date(exam.endDate).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming exams</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-3">
                    <h4>{exam.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{exam.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(exam.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{exam.duration}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed exams yet</p>
            ) : (
              <div className="space-y-3">
                {completedAttempts.slice(0, 5).map((attempt) => {
                  const exam = allExams.find((e) => e.id === attempt.examId);
                  if (!exam) return null;

                  const passed = (attempt.percentage || 0) >= 50;

                  return (
                    <div key={attempt.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4>{exam.title}</h4>
                          <p className="text-sm text-muted-foreground">{exam.subject}</p>
                        </div>
                        <Badge variant={passed ? 'default' : 'destructive'}>
                          {attempt.percentage?.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Score</span>
                          <span>
                            {attempt.score?.toFixed(1)} / {exam.totalMarks}
                          </span>
                        </div>
                        <Progress value={attempt.percentage || 0} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      {completedAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Exams Taken</p>
                <p className="text-2xl">{completedAttempts.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl">{averageScore.toFixed(1)}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Exams Passed</p>
                <p className="text-2xl">
                  {completedAttempts.filter((a) => (a.percentage || 0) >= 50).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
