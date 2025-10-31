import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/user.js';
import Question from './models/question.js';
import Exam from './models/exam.js';
import Submission from './models/submission.js';
import Session from './models/session.js';
import { auth, requireRole } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// DB connection
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set');
}
mongoose
  .connect(process.env.MONGODB_URI || '', { dbName: 'exam_mgmt' })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role });
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/user/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...profile } = user;
  res.json({ profile: { ...profile, id: user._id } });
});

// Students
app.get('/api/students', auth, requireRole(['super_admin', 'moderator']), async (_req, res) => {
  const students = await User.find({ role: 'student' }).lean();
  const out = students.map(({ _id, passwordHash, ...rest }) => ({ id: _id, ...rest }));
  res.json({ students: out });
});

app.post('/api/students', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  try {
    const { name, email, studentId, course, year, password } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password || 'student123', 10);
    const user = await User.create({ email, name, role: 'student', studentId, course, year, passwordHash });
    res.json({ student: { id: user._id, email: user.email, name: user.name, role: user.role, studentId, course, year } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.put('/api/students/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  delete updates.passwordHash;
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!user) return res.status(404).json({ error: 'Student not found' });
  const { passwordHash, ...rest } = user;
  res.json({ student: { id: user._id, ...rest } });
});

app.delete('/api/students/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ success: true });
});

// Questions
app.get('/api/questions', auth, async (_req, res) => {
  const questions = await Question.find().lean();
  const out = questions.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  res.json({ questions: out });
});

app.post('/api/questions', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  try {
    const q = await Question.create({ ...req.body, createdBy: req.user.id });
    res.json({ question: { id: q._id, question: q.question, type: q.type, options: q.options, correctAnswer: q.correctAnswer, points: q.points } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/questions/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  const q = await Question.findByIdAndUpdate(id, req.body, { new: true }).lean();
  if (!q) return res.status(404).json({ error: 'Question not found' });
  res.json({ question: { id: q._id, ...q } });
});

app.delete('/api/questions/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  await Question.findByIdAndDelete(id);
  res.json({ success: true });
});

// Exams
app.get('/api/exams', auth, async (_req, res) => {
  const exams = await Exam.find().lean();
  const out = exams.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  res.json({ exams: out });
});

app.post('/api/exams', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  try {
    const e = await Exam.create({ ...req.body, createdBy: req.user.id });
    res.json({ exam: { id: e._id, ...e.toObject() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

app.put('/api/exams/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  const e = await Exam.findByIdAndUpdate(id, req.body, { new: true }).lean();
  if (!e) return res.status(404).json({ error: 'Exam not found' });
  res.json({ exam: { id: e._id, ...e } });
});

app.delete('/api/exams/:id', auth, requireRole(['super_admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndDelete(id);
  res.json({ success: true });
});

app.get('/api/exams/:id/take', auth, async (req, res) => {
  const { id } = req.params;
  const exam = await Exam.findById(id).lean();
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  const questions = await Question.find({ _id: { $in: exam.questionIds || [] } }).lean();
  const studentQuestions = questions.map((q) => ({ id: q._id, question: q.question, type: q.type, options: q.options, points: q.points }));
  res.json({ exam: { id: exam._id, ...exam, questions: studentQuestions } });
});

// Submissions
app.post('/api/submissions', auth, async (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body || {};
    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const questions = await Question.find({ _id: { $in: exam.questionIds || [] } }).lean();

    let totalScore = 0;
    let maxScore = 0;
    const graded = (answers || []).map((a) => {
      const q = questions.find((qq) => qq._id.toString() === a.questionId);
      if (!q) return a;
      maxScore += q.points || 0;
      let isCorrect = false;
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        isCorrect = a.answer === q.correctAnswer;
      } else if (q.type === 'multiple-answer') {
        const correctSet = new Set(q.correctAnswer || []);
        const answerSet = new Set(a.answer || []);
        isCorrect = correctSet.size === answerSet.size && [...correctSet].every((x) => answerSet.has(x));
      }
      const points = isCorrect ? (q.points || 0) : 0;
      totalScore += points;
      return { ...a, isCorrect, points, maxPoints: q.points || 0 };
    });

    const submission = await Submission.create({
      examId,
      studentId: req.user.id,
      answers: graded,
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      timeSpent,
    });

    res.json({ submission: { id: submission._id, ...submission.toObject() } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

app.get('/api/submissions', auth, requireRole(['super_admin', 'moderator']), async (_req, res) => {
  const subs = await Submission.find().lean();
  const out = subs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  res.json({ submissions: out });
});

app.get('/api/submissions/my', auth, async (req, res) => {
  const subs = await Submission.find({ studentId: req.user.id }).lean();
  const out = subs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  res.json({ submissions: out });
});

// Monitoring
app.get('/api/monitoring/active', auth, requireRole(['super_admin', 'moderator']), async (_req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sessions = await Session.find({ createdAt: { $gte: since } }).lean();
  const out = sessions.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  res.json({ sessions: out });
});

// Sessions
app.post('/api/sessions', auth, async (req, res) => {
  try {
    const { examId } = req.body || {};
    const s = await Session.create({ examId, studentId: req.user.id, status: 'in-progress', startedAt: new Date(), warnings: [] });
    res.json({ session: { id: s._id, ...s.toObject() } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.put('/api/sessions/:id', auth, async (req, res) => {
  const { id } = req.params;
  const s = await Session.findByIdAndUpdate(id, { ...req.body, updatedAt: new Date() }, { new: true }).lean();
  if (!s) return res.status(404).json({ error: 'Session not found' });
  res.json({ session: { id: s._id, ...s } });
});

// Analytics
app.get('/api/analytics/stats', auth, requireRole(['super_admin', 'moderator']), async (_req, res) => {
  const [students, exams, questions, submissions] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Exam.countDocuments(),
    Question.countDocuments(),
    Submission.countDocuments(),
  ]);
  res.json({ stats: { totalStudents: students, totalExams: exams, totalQuestions: questions, totalSubmissions: submissions } });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
