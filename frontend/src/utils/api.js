import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple redirections
let isRedirecting = false;

// Helper function to get stored auth data
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('dedpost-auth')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('dedpost-auth')
  delete api.defaults.headers.common['Authorization']
}

// Set initial auth token if exists
const initialAuth = getStoredAuth()
if (initialAuth?.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialAuth.token}`
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    // Add auth token if available and not already set
    const storedAuth = getStoredAuth()
    if (storedAuth?.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Only handle unauthorized if it's not a login/register attempt
          const isAuthEndpoint = error.config?.url?.includes('/auth/')
          
          if (!isAuthEndpoint) {
            // Clear auth data for non-auth endpoints
            clearAuthData()
            
            // Show toast only if not already redirecting and not on login page
            if (!isRedirecting && !window.location.pathname.includes('/login')) {
              isRedirecting = true
              toast.error('Session expired. Please login again.')
              
              // Redirect after a short delay to allow toast to show
              setTimeout(() => {
                window.location.href = '/login'
                isRedirecting = false
              }, 1000)
            }
          }
          break;
          
        case 403:
          if (!error.config?.url?.includes('/auth/')) {
            toast.error('Access denied. Insufficient permissions.')
          }
          break;
          
        case 404:
          // Don't show toast for auth endpoints
          if (!error.config?.url?.includes('/auth/')) {
            toast.error(data?.message || 'Resource not found.')
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please slow down.')
          break;
          
        case 500:
          toast.error('Server error. Please try again later.')
          break;
          
        default:
          // Don't show toast for expected errors (handled by components) or auth endpoints
          if (status >= 400 && status !== 422 && !error.config?.url?.includes('/auth/')) {
            const message = data?.message || 'An error occurred.'
            toast.error(message)
          }
      }
    } else if (error.request && !error.config?.url?.includes('/auth/')) {
      // Network error (but not for auth endpoints)
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for different types of requests

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    return api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Posts API calls
export const postsAPI = {
  getFeed: (params) => api.get('/posts/feed', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

// Users API calls
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (userId) => api.get(`/users/${userId}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  searchUsers: (params) => api.get('/users/search', { params }),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getPosts: (params) => api.get('/admin/posts', { params }),
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  approvePayouts: (payouts) => api.post('/admin/payouts/bulk-approve', { payouts }),
  approvePayout: (userId, amount) => api.post('/admin/payouts/approve', { userId, amount }),
  updateUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
};

// File upload helper
export const uploadFile = (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });
};

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;