// Mock data and service layer for the examination system

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'moderator' | 'student';
  avatar?: string;
  classGroup?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  image?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  startDate: string;
  endDate: string;
  subject: string;
  classGroup: string;
  totalMarks: number;
  passingMarks: number;
  questions: string[]; // Question IDs
  markingScheme: {
    correct: number;
    wrong: number;
  };
  settings: {
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    autoSubmit: boolean;
    showResults: boolean;
    allowReview: boolean;
    preventCopyPaste: boolean;
    detectTabSwitch: boolean;
  };
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  flagged: boolean;
  timeSpent: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'submitted' | 'suspended';
  answers: StudentAnswer[];
  score?: number;
  percentage?: number;
  cheatingWarnings: number;
  tabSwitches: number;
  multipleLogins: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@school.com',
    password: 'admin123',
    name: 'John Admin',
    role: 'super_admin',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'mod-1',
    email: 'moderator@school.com',
    password: 'mod123',
    name: 'Sarah Moderator',
    role: 'moderator',
    status: 'active',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'student-1',
    email: 'alice@student.com',
    password: 'student123',
    name: 'Alice Johnson',
    role: 'student',
    classGroup: 'Class 10-A',
    status: 'active',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'student-2',
    email: 'bob@student.com',
    password: 'student123',
    name: 'Bob Smith',
    role: 'student',
    classGroup: 'Class 10-A',
    status: 'active',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'student-3',
    email: 'carol@student.com',
    password: 'student123',
    name: 'Carol Williams',
    role: 'student',
    classGroup: 'Class 10-B',
    status: 'active',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'student-4',
    email: 'david@student.com',
    password: 'student123',
    name: 'David Brown',
    role: 'student',
    classGroup: 'Class 10-A',
    status: 'inactive',
    createdAt: '2024-03-01T10:00:00Z',
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    explanation: 'Paris is the capital and largest city of France.',
    subject: 'Geography',
    topic: 'European Capitals',
    difficulty: 'easy',
    marks: 1,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'q2',
    type: 'multiple_choice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    explanation: '2 + 2 equals 4.',
    subject: 'Mathematics',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    marks: 1,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'q3',
    type: 'true_false',
    question: 'The Earth is flat.',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation: 'The Earth is an oblate spheroid, not flat.',
    subject: 'Science',
    topic: 'Earth Science',
    difficulty: 'easy',
    marks: 1,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'q4',
    type: 'multiple_choice',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1,
    explanation: 'William Shakespeare wrote Romeo and Juliet around 1594-1596.',
    subject: 'English Literature',
    topic: 'Shakespeare',
    difficulty: 'medium',
    marks: 2,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'q5',
    type: 'multiple_choice',
    question: 'What is the chemical symbol for Gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    explanation: 'Au comes from the Latin word for gold, "aurum".',
    subject: 'Chemistry',
    topic: 'Periodic Table',
    difficulty: 'medium',
    marks: 2,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'q6',
    type: 'short_answer',
    question: 'What is the largest planet in our solar system?',
    correctAnswer: 'Jupiter',
    explanation: 'Jupiter is the largest planet in our solar system.',
    subject: 'Science',
    topic: 'Solar System',
    difficulty: 'easy',
    marks: 2,
    createdAt: '2024-01-20T10:00:00Z',
  },
];

// Mock Exams
export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'Mid-Term General Knowledge Test',
    description: 'A comprehensive test covering multiple subjects',
    duration: 60,
    startDate: '2025-10-25T09:00:00Z',
    endDate: '2025-10-25T18:00:00Z',
    subject: 'General Knowledge',
    classGroup: 'Class 10-A',
    totalMarks: 10,
    passingMarks: 5,
    questions: ['q1', 'q2', 'q3', 'q4', 'q5'],
    markingScheme: {
      correct: 1,
      wrong: -0.25,
    },
    settings: {
      randomizeQuestions: true,
      randomizeOptions: true,
      autoSubmit: true,
      showResults: true,
      allowReview: true,
      preventCopyPaste: true,
      detectTabSwitch: true,
    },
    status: 'completed',
    createdBy: 'admin-1',
    createdAt: '2024-10-01T10:00:00Z',
  },
  {
    id: 'exam-2',
    title: 'Mathematics Quiz - Chapter 1',
    description: 'Basic arithmetic and algebra questions',
    duration: 30,
    startDate: '2025-10-30T10:00:00Z',
    endDate: '2025-10-30T23:59:00Z',
    subject: 'Mathematics',
    classGroup: 'Class 10-A',
    totalMarks: 10,
    passingMarks: 4,
    questions: ['q2'],
    markingScheme: {
      correct: 1,
      wrong: 0,
    },
    settings: {
      randomizeQuestions: false,
      randomizeOptions: true,
      autoSubmit: true,
      showResults: true,
      allowReview: false,
      preventCopyPaste: true,
      detectTabSwitch: true,
    },
    status: 'active',
    createdBy: 'admin-1',
    createdAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 'exam-3',
    title: 'Science Final Exam',
    description: 'Comprehensive science examination',
    duration: 120,
    startDate: '2025-11-05T09:00:00Z',
    endDate: '2025-11-05T18:00:00Z',
    subject: 'Science',
    classGroup: 'Class 10-A',
    totalMarks: 20,
    passingMarks: 10,
    questions: ['q3', 'q5', 'q6'],
    markingScheme: {
      correct: 1,
      wrong: -0.25,
    },
    settings: {
      randomizeQuestions: true,
      randomizeOptions: true,
      autoSubmit: true,
      showResults: false,
      allowReview: false,
      preventCopyPaste: true,
      detectTabSwitch: true,
    },
    status: 'scheduled',
    createdBy: 'admin-1',
    createdAt: '2024-10-20T10:00:00Z',
  },
];

// Mock Exam Attempts
export const mockExamAttempts: ExamAttempt[] = [
  {
    id: 'attempt-1',
    examId: 'exam-1',
    studentId: 'student-1',
    startTime: '2025-10-25T10:00:00Z',
    endTime: '2025-10-25T10:45:00Z',
    status: 'completed',
    answers: [
      { questionId: 'q1', answer: 2, flagged: false, timeSpent: 120 },
      { questionId: 'q2', answer: 1, flagged: false, timeSpent: 90 },
      { questionId: 'q3', answer: 1, flagged: false, timeSpent: 60 },
      { questionId: 'q4', answer: 1, flagged: false, timeSpent: 180 },
      { questionId: 'q5', answer: 2, flagged: false, timeSpent: 150 },
    ],
    score: 9,
    percentage: 90,
    cheatingWarnings: 0,
    tabSwitches: 1,
    multipleLogins: 0,
  },
  {
    id: 'attempt-2',
    examId: 'exam-1',
    studentId: 'student-2',
    startTime: '2025-10-25T10:30:00Z',
    endTime: '2025-10-25T11:15:00Z',
    status: 'completed',
    answers: [
      { questionId: 'q1', answer: 2, flagged: false, timeSpent: 100 },
      { questionId: 'q2', answer: 0, flagged: true, timeSpent: 200 },
      { questionId: 'q3', answer: 1, flagged: false, timeSpent: 80 },
      { questionId: 'q4', answer: 1, flagged: false, timeSpent: 160 },
      { questionId: 'q5', answer: 1, flagged: false, timeSpent: 140 },
    ],
    score: 7.75,
    percentage: 77.5,
    cheatingWarnings: 2,
    tabSwitches: 3,
    multipleLogins: 0,
  },
  {
    id: 'attempt-3',
    examId: 'exam-2',
    studentId: 'student-1',
    startTime: '2025-10-30T14:00:00Z',
    status: 'in_progress',
    answers: [],
    cheatingWarnings: 0,
    tabSwitches: 0,
    multipleLogins: 0,
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'admin-1',
    action: 'LOGIN',
    details: 'Admin logged in successfully',
    timestamp: '2025-10-30T08:00:00Z',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'log-2',
    userId: 'admin-1',
    action: 'CREATE_EXAM',
    details: 'Created new exam: Mathematics Quiz - Chapter 1',
    timestamp: '2025-10-30T08:15:00Z',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'log-3',
    userId: 'student-1',
    action: 'LOGIN',
    details: 'Student logged in successfully',
    timestamp: '2025-10-30T09:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-4',
    userId: 'student-1',
    action: 'START_EXAM',
    details: 'Started exam: Mathematics Quiz - Chapter 1',
    timestamp: '2025-10-30T14:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-5',
    userId: 'student-2',
    action: 'TAB_SWITCH',
    details: 'Tab switch detected during exam: Mid-Term General Knowledge Test',
    timestamp: '2025-10-25T10:45:00Z',
    ipAddress: '192.168.1.101',
  },
];

// Authentication Service
export const authService = {
  login: (email: string, password: string): User | null => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password && u.status === 'active'
    );
    return user || null;
  },
  
  resetPassword: (email: string): boolean => {
    const user = mockUsers.find((u) => u.email === email);
    return !!user;
  },
};

// Dashboard Stats
export const getDashboardStats = () => {
  const totalStudents = mockUsers.filter((u) => u.role === 'student').length;
  const activeStudents = mockUsers.filter(
    (u) => u.role === 'student' && u.status === 'active'
  ).length;
  const totalExams = mockExams.length;
  const activeExams = mockExams.filter((e) => e.status === 'active').length;
  const totalQuestions = mockQuestions.length;
  const totalAttempts = mockExamAttempts.length;
  const completedAttempts = mockExamAttempts.filter(
    (a) => a.status === 'completed'
  ).length;
  
  return {
    totalStudents,
    activeStudents,
    totalExams,
    activeExams,
    totalQuestions,
    totalAttempts,
    completedAttempts,
    averageScore:
      completedAttempts > 0
        ? mockExamAttempts
            .filter((a) => a.status === 'completed' && a.score !== undefined)
            .reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts
        : 0,
  };
};
