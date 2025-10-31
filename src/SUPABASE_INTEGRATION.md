# 🗄️ Supabase Integration Guide

Complete guide to understanding how your Online Examination System integrates with Supabase.

## 🎯 Architecture Overview

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Supabase Auth  │  ← Authentication
│  Edge Functions │  ← API Server
│  PostgreSQL DB  │  ← Data Storage
└─────────────────┘
```

## 🔐 Authentication Flow

### How Login Works

1. **User enters credentials** in Login component
2. **Frontend calls** `authAPI.signIn(email, password)`
3. **Supabase Auth** validates credentials
4. **Returns** session token and user object
5. **Frontend fetches** user profile from API
6. **App** renders appropriate dashboard

### Code Flow

```typescript
// 1. User submits login form
await authAPI.signIn(email, password)

// 2. Supabase client makes request
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
})

// 3. On success, get user profile
const profile = await apiCall('/user/profile')

// 4. Set user in app state
setCurrentUser({ id, email, name, role })
```

### Session Management

- Sessions stored in browser (localStorage)
- Auto-checked on app load
- Renewed automatically
- Cleared on logout

## 📊 Data Structure

### Key-Value Store Pattern

The system uses Supabase's KV store table with this structure:

```typescript
{
  key: string,     // e.g., "user:123", "exam:456"
  value: object    // The actual data
}
```

### Data Prefixes

| Prefix | Example | Contains |
|--------|---------|----------|
| `user:` | `user:abc123` | User profiles |
| `question:` | `question:xyz789` | Question data |
| `exam:` | `exam:exam123` | Exam configurations |
| `submission:` | `submission:sub456` | Exam submissions |
| `session:` | `session:sess789` | Active exam sessions |

### Example Data Objects

**User Object:**
```json
{
  "id": "abc123",
  "email": "student@exam.com",
  "name": "Jane Student",
  "role": "student",
  "studentId": "STU001",
  "course": "Computer Science",
  "year": "3rd Year",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Question Object:**
```json
{
  "id": "q123",
  "question": "What is React?",
  "type": "multiple-choice",
  "options": ["Library", "Framework", "Language", "Tool"],
  "correctAnswer": "Library",
  "category": "Programming",
  "difficulty": "easy",
  "points": 1,
  "createdBy": "admin123",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Exam Object:**
```json
{
  "id": "exam123",
  "title": "Web Development Quiz",
  "description": "Test your HTML, CSS, JS knowledge",
  "duration": 30,
  "totalMarks": 10,
  "passingMarks": 6,
  "questionIds": ["q1", "q2", "q3"],
  "status": "published",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-22T10:00:00Z",
  "settings": {
    "randomizeQuestions": true,
    "randomizeOptions": true,
    "showResults": true,
    "allowReview": true,
    "antiCheat": {
      "enabled": true,
      "detectTabSwitch": true,
      "detectCopyPaste": true,
      "fullscreenRequired": false
    }
  },
  "createdBy": "admin123",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Submission Object:**
```json
{
  "id": "sub123",
  "examId": "exam123",
  "studentId": "student456",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Library",
      "isCorrect": true,
      "points": 1,
      "maxPoints": 1
    }
  ],
  "totalScore": 8,
  "maxScore": 10,
  "percentage": 80,
  "timeSpent": 1200,
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

## 🔌 API Endpoints

### Authentication

```typescript
// Sign up
POST /make-server-f04930f2/auth/signup
Body: { email, password, name, role }
Response: { user }

// Get profile
GET /make-server-f04930f2/user/profile
Headers: { Authorization: Bearer <token> }
Response: { profile }
```

### Questions

```typescript
// List questions
GET /make-server-f04930f2/questions
Response: { questions: [] }

// Create question
POST /make-server-f04930f2/questions
Body: { question, type, options, correctAnswer, ... }
Response: { question }

// Update question
PUT /make-server-f04930f2/questions/:id
Body: { updates }
Response: { question }

// Delete question
DELETE /make-server-f04930f2/questions/:id
Response: { success: true }
```

### Exams

```typescript
// List exams
GET /make-server-f04930f2/exams
Response: { exams: [] }

// Create exam
POST /make-server-f04930f2/exams
Body: { title, duration, questionIds, ... }
Response: { exam }

// Get exam for taking (student view)
GET /make-server-f04930f2/exams/:id/take
Response: { exam: { questions: [] } }
// Note: Correct answers removed for security

// Update exam
PUT /make-server-f04930f2/exams/:id
Body: { updates }
Response: { exam }

// Delete exam
DELETE /make-server-f04930f2/exams/:id
Response: { success: true }
```

### Submissions

```typescript
// Submit exam
POST /make-server-f04930f2/submissions
Body: { examId, answers, timeSpent }
Response: { submission: { totalScore, percentage, ... } }

// Get all submissions (admin)
GET /make-server-f04930f2/submissions
Response: { submissions: [] }

// Get my submissions (student)
GET /make-server-f04930f2/submissions/my
Response: { submissions: [] }
```

### Students

```typescript
// List students (admin)
GET /make-server-f04930f2/students
Response: { students: [] }

// Create student (admin)
POST /make-server-f04930f2/students
Body: { name, email, studentId, course, year }
Response: { student }
```

### Monitoring

```typescript
// Get active sessions
GET /make-server-f04930f2/monitoring/active
Response: { sessions: [] }

// Create session (student starts exam)
POST /make-server-f04930f2/sessions
Body: { examId }
Response: { session }

// Update session (warnings, etc.)
PUT /make-server-f04930f2/sessions/:id
Body: { warnings, status, ... }
Response: { session }
```

### Analytics

```typescript
// Get dashboard stats
GET /make-server-f04930f2/analytics/stats
Response: { 
  stats: {
    totalStudents,
    totalExams,
    totalQuestions,
    totalSubmissions
  }
}
```

## 🔒 Authorization

### Role-Based Access Control

```typescript
// Middleware checks user role
const userProfile = await kv.get(`user:${user.id}`);

if (userProfile?.role !== 'super_admin' && userProfile?.role !== 'moderator') {
  return c.json({ error: 'Forbidden' }, 403);
}
```

### Access Matrix

| Feature | Super Admin | Moderator | Student |
|---------|-------------|-----------|---------|
| Dashboard Stats | ✅ | ✅ | ❌ |
| Create Questions | ✅ | ✅ | ❌ |
| Create Exams | ✅ | ✅ | ❌ |
| Manage Students | ✅ | ✅ | ❌ |
| View All Results | ✅ | ✅ | ❌ |
| Monitor Exams | ✅ | ✅ | ❌ |
| Take Exams | ❌ | ❌ | ✅ |
| View Own Results | ❌ | ❌ | ✅ |

## 🎯 Auto-Grading Logic

### How It Works

```typescript
// 1. Get exam and questions
const exam = await kv.get(`exam:${examId}`);
const questions = await kv.mget(exam.questionIds);

// 2. Grade each answer
const gradedAnswers = answers.map(answer => {
  const question = questions.find(q => q.id === answer.questionId);
  
  // Multiple choice / True-false
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    isCorrect = answer.answer === question.correctAnswer;
  }
  
  // Multiple answer (all correct, none incorrect)
  if (question.type === 'multiple-answer') {
    const correctSet = new Set(question.correctAnswer);
    const answerSet = new Set(answer.answer);
    isCorrect = setsEqual(correctSet, answerSet);
  }
  
  return {
    ...answer,
    isCorrect,
    points: isCorrect ? question.points : 0,
    maxPoints: question.points
  };
});

// 3. Calculate total score
const totalScore = gradedAnswers.reduce((sum, a) => sum + a.points, 0);
const maxScore = gradedAnswers.reduce((sum, a) => sum + a.maxPoints, 0);
const percentage = (totalScore / maxScore) * 100;
```

## 🔄 Real-Time Features

### Session Monitoring

```typescript
// Student starts exam
const session = await sessionsAPI.create(examId);

// Periodic updates
setInterval(() => {
  await sessionsAPI.update(session.id, {
    warnings: [...warnings, newWarning],
    lastActivity: new Date()
  });
}, 30000); // Every 30 seconds

// Admin monitors
const activeSessions = await sessionsAPI.getActive();
```

### Anti-Cheat Detection

```typescript
// Tab switch detection
window.addEventListener('blur', () => {
  warnings.push({
    type: 'tab_switch',
    timestamp: new Date()
  });
  updateSession();
});

// Copy/Paste detection
document.addEventListener('paste', (e) => {
  if (antiCheat.detectCopyPaste) {
    e.preventDefault();
    warnings.push({
      type: 'paste_attempt',
      timestamp: new Date()
    });
  }
});

// Fullscreen check
if (antiCheat.fullscreenRequired && !document.fullscreenElement) {
  warnings.push({
    type: 'not_fullscreen',
    timestamp: new Date()
  });
}
```

## 📈 Performance Optimization

### Efficient Data Fetching

```typescript
// ✅ Good: Batch get questions
const questions = await kv.mget(questionIds.map(id => `question:${id}`));

// ❌ Bad: Individual gets
for (const id of questionIds) {
  const question = await kv.get(`question:${id}`);
}
```

### Caching Strategy

```typescript
// Client-side caching
const questionsCache = new Map();

async function getQuestions() {
  if (questionsCache.has('all')) {
    return questionsCache.get('all');
  }
  
  const questions = await questionsAPI.getAll();
  questionsCache.set('all', questions);
  
  return questions;
}
```

## 🐛 Error Handling

### API Error Handling

```typescript
// Server-side
try {
  const question = await kv.get(`question:${id}`);
  if (!question) {
    return c.json({ error: 'Question not found' }, 404);
  }
  return c.json({ question });
} catch (error) {
  console.error('Get question error:', error);
  return c.json({ error: 'Failed to get question' }, 500);
}

// Client-side
try {
  const question = await questionsAPI.get(id);
} catch (error) {
  toast.error(error.message || 'Failed to load question');
  console.error(error);
}
```

### Network Resilience

```typescript
// Retry logic
async function apiCallWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

## 📚 Best Practices

### 1. Data Validation

```typescript
// Server-side validation
const { title, duration, questionIds } = await c.req.json();

if (!title || title.length < 3) {
  return c.json({ error: 'Title must be at least 3 characters' }, 400);
}

if (duration < 1 || duration > 180) {
  return c.json({ error: 'Duration must be between 1-180 minutes' }, 400);
}

if (!questionIds || questionIds.length === 0) {
  return c.json({ error: 'At least one question required' }, 400);
}
```

### 2. Security

```typescript
// Never send correct answers to students
const studentQuestions = questions.map(q => ({
  id: q.id,
  question: q.question,
  type: q.type,
  options: q.options,
  points: q.points,
  // correctAnswer excluded!
}));
```

### 3. Logging

```typescript
// Comprehensive logging
console.log(`[${new Date().toISOString()}] User ${userId} submitted exam ${examId}:`, {
  score: totalScore,
  percentage,
  timeSpent
});
```

## 🔍 Debugging

### Server Logs

Check Supabase Edge Functions logs:
1. Go to Supabase Dashboard
2. Edge Functions → make-server-f04930f2
3. View logs in real-time

### Client Debugging

```typescript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Debug API calls
if (localStorage.getItem('debug')) {
  console.log('API Call:', endpoint, options);
  console.log('Response:', data);
}
```

## 📊 Database Queries

### Useful Queries

```sql
-- Count all users
SELECT COUNT(*) FROM kv_store_f04930f2 
WHERE key LIKE 'user:%';

-- Get all exams
SELECT * FROM kv_store_f04930f2 
WHERE key LIKE 'exam:%';

-- Get submissions for specific exam
SELECT * FROM kv_store_f04930f2 
WHERE key LIKE 'submission:%' 
AND value->>'examId' = 'exam123';

-- Get student submissions
SELECT * FROM kv_store_f04930f2 
WHERE key LIKE 'submission:student:student123%';
```

## ✅ Testing Checklist

- [ ] User signup works
- [ ] Login with all roles works
- [ ] Session persists on reload
- [ ] Create question saves to DB
- [ ] Create exam saves to DB
- [ ] Student can see published exams
- [ ] Exam submission works
- [ ] Auto-grading calculates correctly
- [ ] Results display properly
- [ ] Monitoring shows active sessions
- [ ] Anti-cheat warnings log
- [ ] Logout clears session

## 🎉 Conclusion

Your examination system is now fully integrated with Supabase! All data persists, authentication is real, and the system is ready for production use.

**Key Points:**
- ✅ Real authentication with Supabase Auth
- ✅ Persistent data storage with KV store
- ✅ Role-based access control
- ✅ Auto-grading functionality
- ✅ Real-time monitoring
- ✅ Production-ready API

Happy examining! 🎓
