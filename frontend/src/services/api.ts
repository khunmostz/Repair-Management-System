import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1234/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  ID: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'technician' | 'requester';
  phoneNumber?: string;
  telegramId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  ID: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairRequest {
  ID: number;
  title: string;
  description: string;
  location?: string;
  categoryId: number;
  category?: Category;
  requesterId: number;
  requester?: User;
  technicianId?: number;
  technician?: User;
  status: 'pending' | 'in_progress' | 'waiting_part' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images?: string[];
  completedAt?: string;
  rejectionReason?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  waitingPartRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  recentRequests: RepairRequest[];
}

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string; fullName: string }) =>
    api.post('/auth/register', userData),
};

// Repair Request API
export const repairRequestAPI = {
  getAll: () => api.get<RepairRequest[]>('/repair-requests'),
  getById: (id: number) => api.get<RepairRequest>(`/repair-requests/${id}`),
  create: (data: Partial<RepairRequest>) => api.post<RepairRequest>('/repair-requests', data),
  update: (id: number, data: Partial<RepairRequest>) => api.put<RepairRequest>(`/repair-requests/${id}`, data),
  delete: (id: number) => api.delete(`/repair-requests/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// User API
export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await repairRequestAPI.getAll();
    const requests = response.data;

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      inProgressRequests: requests.filter(r => r.status === 'in_progress').length,
      waitingPartRequests: requests.filter(r => r.status === 'waiting_part').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      recentRequests: requests
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };

    return stats;
  },
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings: any) => api.put('/settings', settings),
  testTelegram: (testData: { botToken: string; chatId: string }) => api.post('/settings/test-telegram', testData),
};

// Upload API
export const uploadAPI = {
  uploadImages: (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    return api.post<{ message: string; files: string[] }>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;