import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getDashboardStats, mockActivityLogs, mockExamAttempts, mockExams } from '../lib/mockData';
import {
  Users,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const recentLogs = mockActivityLogs.slice(0, 5);
  const activeExams = mockExams.filter((e) => e.status === 'active');
  const ongoingAttempts = mockExamAttempts.filter((a) => a.status === 'in_progress');

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      subtitle: `${stats.activeExams} active now`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Questions Bank',
      value: stats.totalQuestions,
      subtitle: 'Available questions',
      icon: ClipboardCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      subtitle: `${stats.completedAttempts} completed`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your examination system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Active Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeExams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active exams at the moment.</p>
            ) : (
              <div className="space-y-4">
                {activeExams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4>{exam.title}</h4>
                        <p className="text-sm text-muted-foreground">{exam.subject}</p>
                      </div>
                      <Badge variant="default">Live</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Class: {exam.classGroup}</span>
                      <span>Duration: {exam.duration}m</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Students Participating</span>
                        <span>{ongoingAttempts.filter((a) => a.examId === exam.id).length}</span>
                      </div>
                      <Progress value={30} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div
                    className={`p-2 rounded-full ${
                      log.action === 'LOGIN'
                        ? 'bg-blue-100'
                        : log.action === 'TAB_SWITCH'
                        ? 'bg-red-100'
                        : 'bg-green-100'
                    }`}
                  >
                    {log.action === 'TAB_SWITCH' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Exam Attempts</p>
                <p className="text-2xl">{stats.totalAttempts}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl">{stats.completedAttempts}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl">{ongoingAttempts.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
