import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  search: (params) => api.get('/patients', { params }),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

// ── Care Plans ────────────────────────────────────────────────────────────────
export const carePlanApi = {
  getByPatient: (patientId) => api.get(`/care-plans/patient/${patientId}`),
  getMy: (params) => api.get('/care-plans/my', { params }),
  get: (id) => api.get(`/care-plans/${id}`),
  create: (data) => api.post('/care-plans', data),
  update: (id, data) => api.put(`/care-plans/${id}`, data),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskApi = {
  getMy: (params) => api.get('/tasks/my', { params }),
  getByCarePlan: (carePlanId) => api.get(`/tasks/care-plan/${carePlanId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/mark-all-read'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
