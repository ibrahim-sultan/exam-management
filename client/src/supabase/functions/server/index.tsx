import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase admin client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: error?.message || 'Unauthorized' };
  }
  
  return { user, error: null };
}

// Health check endpoint
app.get("/make-server-f04930f2/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up new user
app.post("/make-server-f04930f2/auth/signup", async (c) => {
  try {
    const { email, password, name, role = 'student' } = await c.req.json();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role, // 'super_admin', 'moderator', or 'student'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ 
      user: {
        id: data.user.id,
        email,
        name,
        role,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// ==================== USER ROUTES ====================

// Get current user profile
app.get("/make-server-f04930f2/user/profile", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const profile = await kv.get(`user:${user.id}`);
  return c.json({ profile });
});

// ==================== STUDENT ROUTES ====================

// Get all students (Admin only)
app.get("/make-server-f04930f2/students", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const students = await kv.getByPrefix('user:');
  const studentList = students.filter((s: any) => s.role === 'student');
  
  return c.json({ students: studentList });
});

// Create student (Admin only)
app.post("/make-server-f04930f2/students", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  try {
    const { name, email, studentId, course, year } = await c.req.json();
    const defaultPassword = 'student123'; // In production, generate random password
    
    const { data, error: signupError } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      user_metadata: { 
        name,
        role: 'student',
        studentId,
        course,
        year,
      },
      email_confirm: true
    });
    
    if (signupError) {
      return c.json({ error: signupError.message }, 400);
    }
    
    const student = {
      id: data.user.id,
      name,
      email,
      studentId,
      course,
      year,
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${data.user.id}`, student);
    
    return c.json({ student });
  } catch (error) {
    console.error('Create student error:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// ==================== QUESTION ROUTES ====================

// Get all questions
app.get("/make-server-f04930f2/questions", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const questions = await kv.getByPrefix('question:');
  return c.json({ questions });
});

// Create question
app.post("/make-server-f04930f2/questions", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  try {
    const questionData = await c.req.json();
    const id = crypto.randomUUID();
    
    const question = {
      id,
      ...questionData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`question:${id}`, question);
    
    return c.json({ question });
  } catch (error) {
    console.error('Create question error:', error);
    return c.json({ error: 'Failed to create question' }, 500);
  }
});

// Update question
app.put("/make-server-f04930f2/questions/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`question:${id}`);
    if (!existing) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    const question = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`question:${id}`, question);
    
    return c.json({ question });
  } catch (error) {
    console.error('Update question error:', error);
    return c.json({ error: 'Failed to update question' }, 500);
  }
});

// Delete question
app.delete("/make-server-f04930f2/questions/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const id = c.req.param('id');
  await kv.del(`question:${id}`);
  
  return c.json({ success: true });
});

// ==================== EXAM ROUTES ====================

// Get all exams
app.get("/make-server-f04930f2/exams", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const exams = await kv.getByPrefix('exam:');
  return c.json({ exams });
});

// Create exam
app.post("/make-server-f04930f2/exams", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  try {
    const examData = await c.req.json();
    const id = crypto.randomUUID();
    
    const exam = {
      id,
      ...examData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`exam:${id}`, exam);
    
    return c.json({ exam });
  } catch (error) {
    console.error('Create exam error:', error);
    return c.json({ error: 'Failed to create exam' }, 500);
  }
});

// Update exam
app.put("/make-server-f04930f2/exams/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`exam:${id}`);
    if (!existing) {
      return c.json({ error: 'Exam not found' }, 404);
    }
    
    const exam = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`exam:${id}`, exam);
    
    return c.json({ exam });
  } catch (error) {
    console.error('Update exam error:', error);
    return c.json({ error: 'Failed to update exam' }, 500);
  }
});

// Delete exam
app.delete("/make-server-f04930f2/exams/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const id = c.req.param('id');
  await kv.del(`exam:${id}`);
  
  return c.json({ success: true });
});

// Get exam for student
app.get("/make-server-f04930f2/exams/:id/take", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const id = c.req.param('id');
  const exam = await kv.get(`exam:${id}`);
  
  if (!exam) {
    return c.json({ error: 'Exam not found' }, 404);
  }
  
  // Get questions for the exam
  const questions = await kv.mget(exam.questionIds.map((qId: string) => `question:${qId}`));
  
  // Remove correct answers before sending to student
  const studentQuestions = questions.map((q: any) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    points: q.points,
  }));
  
  return c.json({ 
    exam: {
      ...exam,
      questions: studentQuestions,
    }
  });
});

// ==================== SUBMISSION ROUTES ====================

// Submit exam
app.post("/make-server-f04930f2/submissions", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  try {
    const { examId, answers, timeSpent } = await c.req.json();
    const id = crypto.randomUUID();
    
    // Get exam and questions
    const exam = await kv.get(`exam:${examId}`);
    const questions = await kv.mget(exam.questionIds.map((qId: string) => `question:${qId}`));
    
    // Auto-grade the submission
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = answers.map((answer: any) => {
      const question = questions.find((q: any) => q.id === answer.questionId);
      if (!question) return answer;
      
      maxScore += question.points;
      let isCorrect = false;
      
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = answer.answer === question.correctAnswer;
      } else if (question.type === 'multiple-answer') {
        const correctSet = new Set(question.correctAnswer);
        const answerSet = new Set(answer.answer);
        isCorrect = correctSet.size === answerSet.size && 
                   [...correctSet].every(a => answerSet.has(a));
      }
      
      const points = isCorrect ? question.points : 0;
      totalScore += points;
      
      return {
        ...answer,
        isCorrect,
        points,
        maxPoints: question.points,
      };
    });
    
    const submission = {
      id,
      examId,
      studentId: user.id,
      answers: gradedAnswers,
      totalScore,
      maxScore,
      percentage: (totalScore / maxScore) * 100,
      timeSpent,
      submittedAt: new Date().toISOString(),
    };
    
    await kv.set(`submission:${id}`, submission);
    await kv.set(`submission:student:${user.id}:exam:${examId}`, submission);
    
    return c.json({ submission });
  } catch (error) {
    console.error('Submit exam error:', error);
    return c.json({ error: 'Failed to submit exam' }, 500);
  }
});

// Get all submissions (Admin)
app.get("/make-server-f04930f2/submissions", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const submissions = await kv.getByPrefix('submission:');
  const filtered = submissions.filter((s: any) => !s.id?.includes(':student:'));
  
  return c.json({ submissions: filtered });
});

// Get student's submissions
app.get("/make-server-f04930f2/submissions/my", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const submissions = await kv.getByPrefix(`submission:student:${user.id}:`);
  
  return c.json({ submissions });
});

// ==================== MONITORING ROUTES ====================

// Get active exam sessions
app.get("/make-server-f04930f2/monitoring/active", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  // Get active sessions (sessions created in last 24 hours)
  const sessions = await kv.getByPrefix('session:');
  const now = Date.now();
  const activeSessions = sessions.filter((s: any) => {
    const createdAt = new Date(s.createdAt).getTime();
    return (now - createdAt) < 24 * 60 * 60 * 1000; // 24 hours
  });
  
  return c.json({ sessions: activeSessions });
});

// Create exam session (when student starts exam)
app.post("/make-server-f04930f2/sessions", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  try {
    const { examId } = await c.req.json();
    const id = crypto.randomUUID();
    
    const session = {
      id,
      examId,
      studentId: user.id,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      warnings: [],
    };
    
    await kv.set(`session:${id}`, session);
    
    return c.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// Update session (for warnings, tab switches, etc.)
app.put("/make-server-f04930f2/sessions/:id", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`session:${id}`);
    if (!existing) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    const session = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`session:${id}`, session);
    
    return c.json({ session });
  } catch (error) {
    console.error('Update session error:', error);
    return c.json({ error: 'Failed to update session' }, 500);
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard stats
app.get("/make-server-f04930f2/analytics/stats", async (c) => {
  const { user, error } = await verifyAuth(c.req.header('Authorization'));
  if (error) return c.json({ error }, 401);
  
  const userProfile = await kv.get(`user:${user.id}`);
  if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const [students, exams, questions, submissions] = await Promise.all([
    kv.getByPrefix('user:'),
    kv.getByPrefix('exam:'),
    kv.getByPrefix('question:'),
    kv.getByPrefix('submission:'),
  ]);
  
  const studentList = students.filter((s: any) => s.role === 'student');
  const submissionList = submissions.filter((s: any) => !s.id?.includes(':student:'));
  
  const stats = {
    totalStudents: studentList.length,
    totalExams: exams.length,
    totalQuestions: questions.length,
    totalSubmissions: submissionList.length,
  };
  
  return c.json({ stats });
});

Deno.serve(app.fetch);
