const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

// Simple token store
const tokenKey = 'ems_token';

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

// Helper for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'API request failed');
  }
  return data;
}

// ==================== AUTH API ====================
export const authAPI = {
  async signIn(email: string, password: string) {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    const profile = await apiCall('/user/profile');
    return { user: profile.profile, token: data.token };
  },

  async signUp(userData: { email: string; password: string; name: string; role?: string }) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async signOut() {
    setToken(null);
  },

  async getSession() {
    const token = getToken();
    if (!token) return null;
    const profile = await apiCall('/user/profile');
    return { token, profile: profile.profile };
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
    const created = [] as any[];
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
