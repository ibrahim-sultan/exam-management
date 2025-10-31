import { useState, useEffect } from 'react';
import { User } from './components/Login';
import Login from './components/Login';
import { authAPI } from './lib/api';
import AdminDashboard from './components/AdminDashboard';
import QuestionManagement from './components/QuestionManagement';
import ExamManagement from './components/ExamManagement';
import StudentManagement from './components/StudentManagement';
import Monitoring from './components/Monitoring';
import Results from './components/Results';
import StudentDashboard from './components/StudentDashboard';
import ExamTaking from './components/ExamTaking';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Toaster } from './components/ui/sonner';
import {
  LayoutDashboard,
  FileQuestion,
  FileText,
  Users,
  Activity,
  BarChart3,
  LogOut,
  Menu,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type AdminView =
  | 'dashboard'
  | 'questions'
  | 'exams'
  | 'students'
  | 'monitoring'
  | 'results';

type StudentView = 'dashboard' | 'taking-exam';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [studentView, setStudentView] = useState<StudentView>('dashboard');
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await authAPI.getSession();
      if (sessionData) {
        setCurrentUser({
          id: sessionData.profile.id,
          email: sessionData.profile.email!,
          name: sessionData.profile.name,
          role: sessionData.profile.role,
        });
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success(`Welcome ${user.name}!`);
  };

  const handleLogout = async () => {
    try {
      await authAPI.signOut();
      setCurrentUser(null);
      setAdminView('dashboard');
      setStudentView('dashboard');
      setCurrentExamId(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const handleStartExam = (examId: string) => {
    setCurrentExamId(examId);
    setStudentView('taking-exam');
  };

  const handleCompleteExam = (score: number, percentage: number) => {
    toast.success(`Exam completed! Your score: ${score} (${percentage.toFixed(1)}%)`);
    setStudentView('dashboard');
    setCurrentExamId(null);
  };

  const handleExitExam = () => {
    setStudentView('dashboard');
    setCurrentExamId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login
  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Student taking exam view
  if (currentUser.role === 'student' && studentView === 'taking-exam' && currentExamId) {
    return (
      <>
        <ExamTaking
          examId={currentExamId}
          user={currentUser}
          onComplete={handleCompleteExam}
          onExit={handleExitExam}
        />
        <Toaster />
      </>
    );
  }

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'moderator';

  const adminMenuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions' as AdminView, label: 'Questions', icon: FileQuestion },
    { id: 'exams' as AdminView, label: 'Exams', icon: FileText },
    { id: 'students' as AdminView, label: 'Students', icon: Users },
    { id: 'monitoring' as AdminView, label: 'Monitoring', icon: Activity },
    { id: 'results' as AdminView, label: 'Results', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg">Online Examination System</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.role === 'super_admin'
                    ? 'Super Admin'
                    : currentUser.role === 'moderator'
                    ? 'Moderator'
                    : 'Student'}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar for Admin */}
        {isAdmin && (
          <aside
            className={`${
              mobileMenuOpen ? 'block' : 'hidden'
            } lg:block w-64 border-r bg-card`}
          >
            <nav className="p-4 space-y-2">
              {adminMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={adminView === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setAdminView(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {isAdmin ? (
              <>
                {adminView === 'dashboard' && <AdminDashboard />}
                {adminView === 'questions' && <QuestionManagement />}
                {adminView === 'exams' && <ExamManagement />}
                {adminView === 'students' && <StudentManagement />}
                {adminView === 'monitoring' && <Monitoring />}
                {adminView === 'results' && <Results />}
              </>
            ) : (
              <StudentDashboard user={currentUser} onStartExam={handleStartExam} />
            )}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
