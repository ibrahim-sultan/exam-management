# 🏗️ System Architecture

Visual guide to understanding how your Online Examination System is structured.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                     (React + TypeScript)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Login     │  │    Admin     │  │   Student    │     │
│  │  Component   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                    ┌──────▼───────┐                         │
│                    │   API Layer  │                         │
│                    │  (lib/api.ts)│                         │
│                    └──────┬───────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                            │
                   HTTPS/REST Calls
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      SUPABASE                                │
│                                                              │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Auth Service  │  │  Edge Functions │  │  PostgreSQL │  │
│  │   (Sessions)   │  │  (Hono Server)  │  │   (KV Store)│  │
│  └────────────────┘  └────────┬────────┘  └──────┬───���──┘  │
│                               │                   │          │
│                               └───────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### Example: Student Takes an Exam

```
1. Frontend: Student clicks "Start Exam"
   ↓
2. API Layer: sessionsAPI.create(examId)
   ↓
3. HTTP Request: POST /make-server-f04930f2/sessions
   ↓
4. Auth Check: Verify session token
   ↓
5. Edge Function: Create session record
   ↓
6. KV Store: Save session data
   ↓
7. Response: Return session object
   ↓
8. Frontend: Render exam interface
```

---

## 📁 File Structure

```
online-examination-system/
│
├── 📱 Frontend (React App)
│   ├── App.tsx                      # Main app component
│   ├── components/
│   │   ├── Login.tsx                # Authentication
│   │   ├── AdminDashboard.tsx       # Admin home
│   │   ├── StudentDashboard.tsx     # Student home
│   │   ├── QuestionManagement.tsx   # CRUD questions
│   │   ├── ExamManagement.tsx       # CRUD exams
│   │   ├── StudentManagement.tsx    # CRUD students
│   │   ├── Monitoring.tsx           # Live monitoring
│   │   ├── Results.tsx              # View results
│   │   ├── ExamTaking.tsx           # Exam interface
│   │   ├── DatabaseSeeder.tsx       # Seed utility
│   │   └── ui/                      # shadcn components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── ... (40+ components)
│   │
│   ├── lib/
│   │   ├── api.ts                   # API service layer
│   │   ├── seedData.ts              # Seed definitions
│   │   └── mockData.ts              # Legacy (unused)
│   │
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.tsx           # Supabase client
│   │       └── info.tsx             # Connection info
│   │
│   └── styles/
│       └── globals.css              # Theme & styles
│
├── 🔧 Backend (Supabase Edge Functions)
│   └── supabase/
│       └── functions/
│           └── server/
│               ├── index.tsx        # API server (21 endpoints)
│               └── kv_store.tsx     # KV utilities
│
├── 📚 Documentation
│   ├── README.md                    # Main documentation
│   ├── QUICK_START.md               # Quick guide
│   ├── SETUP_GUIDE.md               # Detailed setup
│   ├── SUPABASE_INTEGRATION.md      # Technical details
│   ├── DEPLOYMENT.md                # Deploy guide
│   ├── ARCHITECTURE.md              # This file
│   └── INTEGRATION_COMPLETE.md      # Summary
│
└── 🔧 Config
    ├── package.json                 # Dependencies
    ├── .gitignore                   # Git exclusions
    └── tsconfig.json                # TypeScript config
```

---

## 🔐 Authentication Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: User enters credentials                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 2: Frontend → Supabase Auth                       │
│  supabase.auth.signInWithPassword({ email, password })  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 3: Supabase validates & returns session token     │
│  { user, session: { access_token } }                    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 4: Frontend → API Server (with token)             │
│  GET /user/profile                                       │
│  Headers: { Authorization: Bearer <token> }             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 5: Server validates token & fetches profile       │
│  const { user } = await supabase.auth.getUser(token)    │
│  const profile = await kv.get(`user:${user.id}`)        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 6: Return profile to frontend                     │
│  { id, email, name, role }                              │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Step 7: App renders appropriate dashboard              │
│  if (role === 'student') → StudentDashboard             │
│  if (role === 'super_admin') → AdminDashboard           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Creating an Exam

```
Admin Dashboard → Exam Management Component
                       ↓
              Click "Create Exam"
                       ↓
              Fill in form data
                       ↓
              Click "Create"
                       ↓
        examsAPI.create(examData)
                       ↓
        POST /exams with Bearer token
                       ↓
        Server validates auth & role
                       ↓
        Generate unique exam ID
                       ↓
        Save to KV: exam:${id}
                       ↓
        Return created exam
                       ↓
        Update UI with new exam
                       ↓
        Show success toast
```

### Taking an Exam

```
Student Dashboard → See available exams
                       ↓
              Click "Start Exam"
                       ↓
        sessionsAPI.create(examId)
                       ↓
        Create session record
                       ↓
        Fetch exam: GET /exams/:id/take
                       ↓
        Server removes correct answers
                       ↓
        Return sanitized exam
                       ↓
        Render ExamTaking component
                       ↓
        Student answers questions
                       ↓
        Click "Submit"
                       ↓
        submissionsAPI.submit(answers)
                       ↓
        Server grades answers
                       ↓
        Calculate score
                       ↓
        Save submission
                       ↓
        Return results
                       ↓
        Show score to student
```

---

## 🗄️ Database Schema (KV Store)

### Key Patterns

```typescript
// Users
"user:{userId}"
  → { id, email, name, role, ... }

// Questions
"question:{questionId}"
  → { question, type, options, correctAnswer, category, ... }

// Exams
"exam:{examId}"
  → { title, duration, questionIds, settings, ... }

// Submissions
"submission:{submissionId}"
  → { examId, studentId, answers, score, ... }

// Student Submissions (for quick lookup)
"submission:student:{studentId}:exam:{examId}"
  → { ...same as above }

// Sessions
"session:{sessionId}"
  → { examId, studentId, status, warnings, ... }
```

### Query Patterns

```typescript
// Get all users
await kv.getByPrefix('user:')

// Get all questions
await kv.getByPrefix('question:')

// Get specific exam
await kv.get('exam:123')

// Get all student submissions
await kv.getByPrefix('submission:student:abc123:')

// Batch get questions
await kv.mget(['question:1', 'question:2', 'question:3'])
```

---

## 🔌 API Architecture

### Edge Function Structure

```typescript
// Server setup
const app = new Hono()
const supabase = createClient(...)

// Middleware
app.use('*', logger)
app.use('/*', cors)

// Auth helper
async function verifyAuth(authHeader) {
  const token = authHeader.split(' ')[1]
  const { user } = await supabase.auth.getUser(token)
  return { user, error }
}

// Routes
app.get('/make-server-f04930f2/questions', async (c) => {
  // Verify auth
  const { user, error } = await verifyAuth(...)
  
  // Get data
  const questions = await kv.getByPrefix('question:')
  
  // Return
  return c.json({ questions })
})

// Start server
Deno.serve(app.fetch)
```

### API Endpoints Map

```
Authentication (2)
├── POST /auth/signup
└── GET /user/profile

Questions (5)
├── GET /questions
├── POST /questions
├── PUT /questions/:id
├── DELETE /questions/:id
└── POST /questions/bulk

Exams (5)
├── GET /exams
├── POST /exams
├── PUT /exams/:id
├── DELETE /exams/:id
└── GET /exams/:id/take

Submissions (3)
├── POST /submissions
├── GET /submissions
└── GET /submissions/my

Students (3)
├── GET /students
├── POST /students
└── DELETE /students/:id

Monitoring (3)
├── GET /monitoring/active
├── POST /sessions
└── PUT /sessions/:id

Analytics (1)
└── GET /analytics/stats

Total: 22 endpoints
```

---

## 🎯 Component Hierarchy

```
App
├── Login (when not authenticated)
│   └── Tabs
│       ├── Admin Login
│       └── Student Login
│
├── AdminDashboard (admin authenticated)
│   ├── Sidebar Navigation
│   │   ├── Dashboard
│   │   ├── Questions
│   │   ├── Exams
│   │   ├── Students
│   │   ├── Monitoring
│   │   └── Results
│   │
│   └── Content Area
│       ├── QuestionManagement
│       │   ├── Question List
│       │   ├── Add Question Dialog
│       │   └── Edit Question Dialog
│       │
│       ├── ExamManagement
│       │   ├── Exam List
│       │   ├── Create Exam Dialog
│       │   └── Edit Exam Dialog
│       │
│       ├── StudentManagement
│       │   ├── Student List
│       │   ├── Add Student Dialog
│       │   └── Edit Student Dialog
│       │
│       ├── Monitoring
│       │   ├── Active Sessions List
│       │   └── Session Details
│       │
│       └── Results
│           ├── Submissions List
│           ├── Filters
│           └── Export Options
│
└── StudentDashboard (student authenticated)
    ├── Available Exams
    │   └── Exam Cards
    │
    ├── Completed Exams
    │   └── Result Cards
    │
    └── ExamTaking (during exam)
        ├── Timer
        ├── Question Display
        ├── Navigation
        ├── Flag for Review
        └── Submit Button
```

---

## 🔄 State Management

### Global State (App.tsx)

```typescript
State {
  currentUser: User | null
  adminView: AdminView
  studentView: StudentView
  currentExamId: string | null
  loading: boolean
}
```

### Component State Examples

```typescript
// Login Component
{
  email: string
  password: string
  error: string
  loading: boolean
}

// ExamTaking Component
{
  exam: Exam
  answers: Answer[]
  currentQuestionIndex: number
  timeRemaining: number
  warnings: Warning[]
  session: Session
}

// QuestionManagement Component
{
  questions: Question[]
  selectedQuestion: Question | null
  isDialogOpen: boolean
  filter: FilterOptions
}
```

---

## 🚀 Performance Optimizations

### Frontend

```
1. Component-level code splitting
   ├── Lazy loading for heavy components
   └── Dynamic imports

2. Memoization
   ├── useMemo for expensive calculations
   └── useCallback for event handlers

3. Efficient rendering
   ├── Keys on list items
   ├── Avoiding unnecessary re-renders
   └── Virtual scrolling (if needed)

4. Asset optimization
   ├── SVG icons (lucide-react)
   ├── Optimized images
   └── CSS-in-JS (Tailwind)
```

### Backend

```
1. Batch operations
   ├── kv.mget() instead of multiple kv.get()
   └── Bulk question creation

2. Efficient queries
   ├── Prefix-based filtering
   └── Direct key lookups

3. Caching
   ├── Session caching
   └── Static data caching

4. Connection pooling
   └── Supabase handles automatically
```

---

## 🔒 Security Layers

```
Layer 1: Frontend
├── Client-side validation
├── Input sanitization
└── Protected routes

Layer 2: Authentication
├── Supabase Auth
├── Secure session tokens
└── Token expiration

Layer 3: Authorization
├── Role-based access
├── Permission checks
└── Resource ownership

Layer 4: API Server
├── Token validation
├── Role verification
└── Input validation

Layer 5: Database
├── Row-level security (optional)
├── Prepared statements
└── Access policies
```

---

## 📦 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│             CDN / Edge Network              │
│          (Vercel/Netlify Global)            │
└──────────────────┬──────────────────────────┘
                   │
         Static Assets (HTML, CSS, JS)
                   │
┌──────────────────▼──────────────────────────┐
│            Frontend (React SPA)             │
│           Served from CDN Edge              │
└──────────────────┬──────────────────────────┘
                   │
              API Calls (HTTPS)
                   │
┌──────────────────▼──────────────────────────┐
│         Supabase (Cloud Infrastructure)     │
│  ┌────────────┐  ┌────────────┐            │
│  │    Auth    │  │ Edge Funcs │            │
│  └────────────┘  └────────────┘            │
│  ┌────────────────────────────┐            │
│  │    PostgreSQL Database     │            │
│  └────────────────────────────┘            │
└─────────────────────────────────────────────┘
```

---

## 🎯 Auto-Grading Algorithm

```typescript
function gradeExam(exam, answers) {
  // 1. Fetch questions
  const questions = getQuestions(exam.questionIds)
  
  // 2. Grade each answer
  const gradedAnswers = answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    
    let isCorrect = false
    
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        // Exact match
        isCorrect = answer.answer === question.correctAnswer
        break
        
      case 'multiple-answer':
        // All correct, none incorrect
        const correct = new Set(question.correctAnswer)
        const given = new Set(answer.answer)
        isCorrect = setsAreEqual(correct, given)
        break
    }
    
    return {
      ...answer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      maxPoints: question.points
    }
  })
  
  // 3. Calculate totals
  const totalScore = sum(gradedAnswers.map(a => a.points))
  const maxScore = sum(gradedAnswers.map(a => a.maxPoints))
  const percentage = (totalScore / maxScore) * 100
  
  // 4. Determine pass/fail
  const passed = percentage >= exam.passingPercentage
  
  return {
    answers: gradedAnswers,
    totalScore,
    maxScore,
    percentage,
    passed
  }
}
```

---

## 🔄 Data Synchronization

### How Real-Time Works

```
1. Student submits exam
   ↓
2. Server saves submission
   ↓
3. Submission includes timestamp
   ↓
4. Admin monitoring polls every 30s
   ↓
5. Fetches active sessions
   ↓
6. Compares timestamps
   ↓
7. Shows new submissions
   ↓
8. Updates dashboard stats
```

### Future: Real-Time Subscriptions (Optional)

```typescript
// Supabase Realtime (if needed)
const channel = supabase
  .channel('exam-submissions')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public',
      table: 'submissions'
    },
    (payload) => {
      // Update UI immediately
      updateSubmissionsList(payload.new)
    }
  )
  .subscribe()
```

---

## 📊 Monitoring & Observability

```
Frontend
├── Error Boundaries
├── Console Logging (dev)
└── Analytics Events

Backend
├── Supabase Logs
├── Edge Function Logs
├── Request/Response Logging
└── Error Tracking

Database
├── Query Performance
├── Connection Pool Stats
└── Storage Usage

Performance
├── Page Load Times
├── API Response Times
├── Database Query Times
└── User Session Duration
```

---

## 🎓 Learning Path

To understand this architecture:

```
1. React Basics
   ├── Components
   ├── State & Props
   ├── Hooks
   └── Context

2. TypeScript
   ├── Types & Interfaces
   ├── Generics
   └── Type Safety

3. API Integration
   ├── Fetch API
   ├── Async/Await
   ├── Error Handling
   └── Authentication

4. Supabase
   ├── Auth
   ├── Database
   ├── Edge Functions
   └── Real-time (optional)

5. Deployment
   ├── Build Process
   ├── Environment Variables
   ├── CDN
   └── CI/CD
```

---

## 🎯 Conclusion

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
- ✅ Performance
- ✅ Developer experience

**Clean, modern, production-ready architecture!** 🚀

---

*For more details, see the other documentation files.*
