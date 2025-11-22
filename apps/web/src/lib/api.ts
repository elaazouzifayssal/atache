import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendOtp: (phone: string, purpose: string) => api.post('/auth/send-otp', { phone, purpose }),
  verifyOtp: (phone: string, code: string, purpose: string) => api.post('/auth/verify-otp', { phone, code, purpose }),
  register: (data: any) => api.post('/auth/register', data),
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// Users API
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.patch('/users/me', data),
  getPublicProfile: (id: string) => api.get(`/users/${id}/public`),
};

// Jobs API
export const jobsApi = {
  create: (data: any) => api.post('/jobs', data),
  getAll: (params?: any) => api.get('/jobs', { params }),
  getMyJobs: (status?: string) => api.get('/jobs/my', { params: { status } }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  start: (id: string) => api.post(`/jobs/${id}/start`),
  complete: (id: string) => api.post(`/jobs/${id}/complete`),
  confirm: (id: string) => api.post(`/jobs/${id}/confirm`),
};

// Applications API
export const applicationsApi = {
  apply: (jobId: string, data: any) => api.post(`/jobs/${jobId}/applications`, data),
  getJobApplications: (jobId: string) => api.get(`/jobs/${jobId}/applications`),
  getMyApplications: (status?: string) => api.get('/applications/my', { params: { status } }),
  accept: (id: string) => api.post(`/applications/${id}/accept`),
  decline: (id: string) => api.post(`/applications/${id}/decline`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/conversations'),
  getMessages: (conversationId: string, cursor?: string) =>
    api.get(`/conversations/${conversationId}/messages`, { params: { cursor } }),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/conversations/${conversationId}/messages`, { content }),
  markAsRead: (conversationId: string) => api.post(`/conversations/${conversationId}/read`),
};

// Reviews API
export const reviewsApi = {
  create: (jobId: string, data: any) => api.post(`/jobs/${jobId}/reviews`, data),
  getUserReviews: (userId: string) => api.get(`/users/${userId}/reviews`),
};
