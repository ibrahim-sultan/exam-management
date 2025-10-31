import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f04930f2`;

// Helper to get auth header
async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;
}

// Helper for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// ==================== AUTH API ====================
export const authAPI = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Get user profile
    const profile = await apiCall('/user/profile');
    
    return { user: data.user, profile: profile.profile, session: data.session };
  },

  async signUp(userData: { email: string; password: string; name: string; role?: string }) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const profile = await apiCall('/user/profile');
    return { session, profile: profile.profile };
  },
};

// ==================== STUDENTS API ====================
export const studentsAPI = {
  async getAll() {
    const data = await apiCall('/students');
    return data.students;
  },

  async create(student: any) {
    const data = await apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    return data.student;
  },

  async update(id: string, updates: any) {
    const data = await apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.student;
  },

  async delete(id: string) {
    await apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== QUESTIONS API ====================
export const questionsAPI = {
  async getAll() {
    const data = await apiCall('/questions');
    return data.questions;
  },

  async create(question: any) {
    const data = await apiCall('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return data.question;
  },

  async update(id: string, updates: any) {
    const data = await apiCall(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.question;
  },

  async delete(id: string) {
    await apiCall(`/questions/${id}`, {
      method: 'DELETE',
    });
  },

  async bulkCreate(questions: any[]) {
    // Create questions one by one
    const created = [];
    for (const question of questions) {
      const result = await this.create(question);
      created.push(result);
    }
    return created;
  },
};

// ==================== EXAMS API ====================
export const examsAPI = {
  async getAll() {
    const data = await apiCall('/exams');
    return data.exams;
  },

  async create(exam: any) {
    const data = await apiCall('/exams', {
      method: 'POST',
      body: JSON.stringify(exam),
    });
    return data.exam;
  },

  async update(id: string, updates: any) {
    const data = await apiCall(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.exam;
  },

  async delete(id: string) {
    await apiCall(`/exams/${id}`, {
      method: 'DELETE',
    });
  },

  async getForStudent(id: string) {
    const data = await apiCall(`/exams/${id}/take`);
    return data.exam;
  },
};

// ==================== SUBMISSIONS API ====================
export const submissionsAPI = {
  async submit(submission: { examId: string; answers: any[]; timeSpent: number }) {
    const data = await apiCall('/submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
    return data.submission;
  },

  async getAll() {
    const data = await apiCall('/submissions');
    return data.submissions;
  },

  async getMySubmissions() {
    const data = await apiCall('/submissions/my');
    return data.submissions;
  },
};

// ==================== SESSIONS API ====================
export const sessionsAPI = {
  async create(examId: string) {
    const data = await apiCall('/sessions', {
      method: 'POST',
      body: JSON.stringify({ examId }),
    });
    return data.session;
  },

  async update(id: string, updates: any) {
    const data = await apiCall(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.session;
  },

  async getActive() {
    const data = await apiCall('/monitoring/active');
    return data.sessions;
  },
};

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  async getStats() {
    const data = await apiCall('/analytics/stats');
    return data.stats;
  },
};
