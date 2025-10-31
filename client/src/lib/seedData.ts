import { authAPI, questionsAPI, examsAPI, studentsAPI } from './api';

// Initial admin and test accounts
export const seedUsers = [
  {
    email: 'admin@exam.com',
    password: 'admin123',
    name: 'Super Admin',
    role: 'super_admin',
  },
  {
    email: 'moderator@exam.com',
    password: 'mod123',
    name: 'John Moderator',
    role: 'moderator',
  },
  {
    email: 'student@exam.com',
    password: 'student123',
    name: 'Jane Student',
    role: 'student',
  },
];

// Sample questions
export const seedQuestions = [
  {
    question: "What is the capital of France?",
    type: "multiple-choice",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    category: "Geography",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "Which programming language is known as the 'language of the web'?",
    type: "multiple-choice",
    options: ["Python", "JavaScript", "Java", "C++"],
    correctAnswer: "JavaScript",
    category: "Programming",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "React is a JavaScript library for building user interfaces.",
    type: "true-false",
    correctAnswer: "true",
    category: "Programming",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "Which of the following are valid JavaScript data types?",
    type: "multiple-answer",
    options: ["String", "Boolean", "Integer", "Undefined", "Symbol"],
    correctAnswer: ["String", "Boolean", "Undefined", "Symbol"],
    category: "Programming",
    difficulty: "medium",
    points: 2,
  },
  {
    question: "What does HTML stand for?",
    type: "multiple-choice",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language"
    ],
    correctAnswer: "Hyper Text Markup Language",
    category: "Web Development",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "CSS stands for Cascading Style Sheets.",
    type: "true-false",
    correctAnswer: "true",
    category: "Web Development",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "Which HTTP methods are idempotent?",
    type: "multiple-answer",
    options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    correctAnswer: ["GET", "PUT", "DELETE"],
    category: "Web Development",
    difficulty: "hard",
    points: 3,
  },
  {
    question: "What is the time complexity of binary search?",
    type: "multiple-choice",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: "O(log n)",
    category: "Algorithms",
    difficulty: "medium",
    points: 2,
  },
  {
    question: "Python is a compiled language.",
    type: "true-false",
    correctAnswer: "false",
    category: "Programming",
    difficulty: "easy",
    points: 1,
  },
  {
    question: "Which databases are NoSQL databases?",
    type: "multiple-answer",
    options: ["MongoDB", "PostgreSQL", "Redis", "MySQL", "Cassandra"],
    correctAnswer: ["MongoDB", "Redis", "Cassandra"],
    category: "Databases",
    difficulty: "medium",
    points: 2,
  },
];

// Sample students
export const seedStudentsData = [
  {
    name: "Alice Johnson",
    email: "alice@student.com",
    studentId: "STU001",
    course: "Computer Science",
    year: "3rd Year",
  },
  {
    name: "Bob Smith",
    email: "bob@student.com",
    studentId: "STU002",
    course: "Information Technology",
    year: "2nd Year",
  },
  {
    name: "Carol Williams",
    email: "carol@student.com",
    studentId: "STU003",
    course: "Computer Science",
    year: "4th Year",
  },
  {
    name: "David Brown",
    email: "david@student.com",
    studentId: "STU004",
    course: "Software Engineering",
    year: "3rd Year",
  },
  {
    name: "Emma Davis",
    email: "emma@student.com",
    studentId: "STU005",
    course: "Computer Science",
    year: "1st Year",
  },
];

// Function to seed the database
export async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. Create admin and test users
    console.log('Creating users...');
    for (const user of seedUsers) {
      try {
        await authAPI.signUp(user);
        console.log(`✅ Created user: ${user.email}`);
      } catch (error: any) {
        if (error.message?.includes('already registered')) {
          console.log(`⚠️ User already exists: ${user.email}`);
        } else {
          console.error(`❌ Failed to create user ${user.email}:`, error.message);
        }
      }
    }
    
    // 2. Sign in as admin to create other resources
    console.log('\nSigning in as admin...');
    await authAPI.signIn('admin@exam.com', 'admin123');
    
    // 3. Create questions
    console.log('\nCreating questions...');
    const createdQuestions = [];
    for (const question of seedQuestions) {
      try {
        const created = await questionsAPI.create(question);
        createdQuestions.push(created);
        console.log(`✅ Created question: ${question.question.substring(0, 50)}...`);
      } catch (error: any) {
        console.error(`❌ Failed to create question:`, error.message);
      }
    }
    
    // 4. Create students
    console.log('\nCreating students...');
    for (const student of seedStudentsData) {
      try {
        await studentsAPI.create(student);
        console.log(`✅ Created student: ${student.name}`);
      } catch (error: any) {
        if (error.message?.includes('already registered')) {
          console.log(`⚠️ Student already exists: ${student.email}`);
        } else {
          console.error(`❌ Failed to create student ${student.name}:`, error.message);
        }
      }
    }
    
    // 5. Create sample exams
    if (createdQuestions.length > 0) {
      console.log('\nCreating exams...');
      
      const exam1 = {
        title: "Web Development Fundamentals",
        description: "Test your knowledge of HTML, CSS, and JavaScript basics",
        duration: 30,
        totalMarks: 10,
        passingMarks: 6,
        questionIds: createdQuestions.slice(0, 6).map(q => q.id),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'published',
        settings: {
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          allowReview: true,
          antiCheat: {
            enabled: true,
            detectTabSwitch: true,
            detectCopyPaste: true,
            fullscreenRequired: false,
          },
        },
      };
      
      const exam2 = {
        title: "Programming Concepts Quiz",
        description: "Advanced programming and algorithm questions",
        duration: 45,
        totalMarks: 15,
        passingMarks: 9,
        questionIds: createdQuestions.slice(3, 10).map(q => q.id),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        status: 'published',
        settings: {
          randomizeQuestions: false,
          randomizeOptions: true,
          showResults: false,
          allowReview: false,
          antiCheat: {
            enabled: true,
            detectTabSwitch: true,
            detectCopyPaste: true,
            fullscreenRequired: true,
          },
        },
      };
      
      try {
        await examsAPI.create(exam1);
        console.log(`✅ Created exam: ${exam1.title}`);
      } catch (error: any) {
        console.error(`❌ Failed to create exam:`, error.message);
      }
      
      try {
        await examsAPI.create(exam2);
        console.log(`✅ Created exam: ${exam2.title}`);
      } catch (error: any) {
        console.error(`❌ Failed to create exam:`, error.message);
      }
    }
    
    console.log('\n✅ Database seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@exam.com / admin123');
    console.log('Moderator: moderator@exam.com / mod123');
    console.log('Student: student@exam.com / student123');
    
    return true;
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    return false;
  }
}
