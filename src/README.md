# 🎓 Online Examination System

A comprehensive, full-featured online examination platform built with React, TypeScript, Tailwind CSS, and Supabase. This system includes complete admin and student functionalities with role-based authentication, real-time monitoring, auto-grading, and anti-cheat measures.

![Online Examination System](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop)

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-Based Access Control** (Super Admin, Moderator, Student)
- Secure authentication powered by Supabase Auth
- Session management and persistence
- Password reset functionality

### 👨‍💼 Admin Features
- **Dashboard** - Real-time statistics and analytics
  - Total students, exams, questions, submissions
  - Recent activity feed
  - Performance metrics
- **Question Bank Management**
  - CRUD operations for questions
  - Multiple question types: Multiple Choice, Multiple Answer, True/False
  - Category and difficulty tagging
  - Points assignment
  - Bulk upload simulation
- **Exam Management**
  - Create and configure exams
  - Question selection and randomization
  - Time limits and scheduling
  - Anti-cheat settings (tab detection, fullscreen mode)
  - Publish/Draft status
- **Student Management**
  - Create and manage student accounts
  - View student profiles and performance
  - Bulk student import
- **Live Monitoring**
  - Real-time exam session tracking
  - Anti-cheat violation detection
  - Tab switch warnings
  - Student activity monitoring
- **Results & Analytics**
  - Auto-grading system
  - Detailed performance reports
  - Export capabilities
  - Grade distribution analytics

### 🎓 Student Features
- **Student Dashboard**
  - View available exams
  - Exam schedule and deadlines
  - Past results and performance
- **Exam Taking Interface**
  - Clean, distraction-free interface
  - Timer with auto-submit
  - Question navigation
  - Flag questions for review
  - Progress tracking
  - Anti-cheat warnings
- **Results View**
  - Detailed score breakdown
  - Correct/incorrect answers (if enabled)
  - Performance feedback

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Backend:** Supabase (PostgreSQL database, Edge Functions)
- **Authentication:** Supabase Auth
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner

## 📋 Prerequisites

- Node.js 16+ (for local development)
- Supabase account (for backend)
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/online-examination-system.git
cd online-examination-system
```

### 2. Supabase Setup

The project is already connected to Supabase. The connection details are in `/utils/supabase/info.tsx`.

### 3. Seed the Database

On first run, you'll need to seed the database with initial data:

1. Run the application
2. The database seeder will be available
3. Click "Seed Database" to populate with sample data

This will create:
- Admin, Moderator, and Student accounts
- Sample questions across different categories
- Example exams
- Test student accounts

### 4. Test Credentials

After seeding, use these credentials to login:

**Admin:**
- Email: `admin@exam.com`
- Password: `admin123`

**Moderator:**
- Email: `moderator@exam.com`
- Password: `mod123`

**Student:**
- Email: `student@exam.com`
- Password: `student123`

## 📁 Project Structure

```
/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── AdminDashboard.tsx     # Admin dashboard view
│   ├── QuestionManagement.tsx # Question CRUD interface
│   ├── ExamManagement.tsx     # Exam creation and management
│   ├── StudentManagement.tsx  # Student administration
│   ├── Monitoring.tsx         # Live exam monitoring
│   ├── Results.tsx            # Results and analytics
│   ├── StudentDashboard.tsx   # Student home page
│   ├── ExamTaking.tsx         # Exam interface for students
│   ├── Login.tsx              # Authentication component
│   └── DatabaseSeeder.tsx     # Database seeding tool
├── lib/
│   ├── api.ts                 # API service layer
│   ├── seedData.ts            # Seed data definitions
│   └── mockData.ts            # Legacy mock data (deprecated)
├── utils/
│   └── supabase/
│       ├── client.tsx         # Supabase client instance
│       └── info.tsx           # Supabase connection info
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx      # Main API server
│           └── kv_store.tsx   # Key-value store utilities
├── styles/
│   └── globals.css            # Global styles and theme
└── App.tsx                    # Main application component
```

## 🔑 Key Features Explained

### Auto-Grading System
The system automatically grades submitted exams based on:
- Multiple choice: Exact match with correct answer
- Multiple answer: All correct options selected, no incorrect ones
- True/False: Boolean match

### Anti-Cheat Measures
- Tab switch detection
- Copy/paste prevention
- Fullscreen mode enforcement
- Activity logging
- Session monitoring

### Question Randomization
- Randomize question order
- Randomize answer options
- Different question sets per student (when enabled)

### Real-Time Monitoring
Admins can monitor:
- Active exam sessions
- Student activity
- Warning events
- Submission status

## 🎨 Customization

### Theming
The app supports light and dark modes. Customize colors in `styles/globals.css`:

```css
:root {
  --primary: #your-color;
  --background: #your-color;
  /* ... more theme variables */
}
```

### Adding Question Types
Extend the question types in the backend and update the UI components to support new formats.

## 📊 API Endpoints

The backend server provides these main endpoints:

- `POST /auth/signup` - Create new user
- `GET /user/profile` - Get current user profile
- `GET /questions` - List all questions
- `POST /questions` - Create question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question
- `GET /exams` - List all exams
- `POST /exams` - Create exam
- `GET /exams/:id/take` - Get exam for student
- `POST /submissions` - Submit exam answers
- `GET /submissions` - Get all submissions (admin)
- `GET /monitoring/active` - Get active sessions
- `GET /analytics/stats` - Get dashboard statistics

## 🔒 Security Considerations

**Important:** This application is designed for educational and portfolio purposes.

- Do not store sensitive personal information
- Use strong passwords for production
- Implement proper email verification for production use
- Add rate limiting for API endpoints
- Enable Row Level Security (RLS) in Supabase for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

## 📧 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and Supabase
