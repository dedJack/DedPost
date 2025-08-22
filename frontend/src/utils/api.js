import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple redirections
let isRedirecting = false;

// Helper function to get stored auth data
export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('dedpost-auth')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper function to clear auth data
export const clearAuthData = () => {
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
  getFeed: async (page = 1, limit = 10) => {
    const res = await api.get(`/posts/feed?page=${page}&limit=${limit}`)
    return res
  },

  getPost: async (postId) => {
    const res = await api.get(`/posts/${postId}`)
    return res.data
  },

  getUserPosts: async (userId, params) => {
    const res = await api.get(`/posts/user/${userId}`, { params })
    return res
  },

  createPost: async (postData) => {
    const formData = new FormData()
    formData.append('caption', postData.caption)
    formData.append('media', postData.media)

    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  likePost: async (postId) => {
    const res = await api.post(`/posts/${postId}/like`)
    return res.data
  },

  addComment: async (postId, content, parentCommentId = null) => {
    const res = await api.post(`/posts/${postId}/comments`, { content })
    return res.data
  },

  deletePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}`)
    return res.data
  },
}


// Users API calls
export const usersAPI = {
  // Search users
  searchUsers: (query, page = 1, limit = 10) =>
    api
      .get('/users/search', { params: { q: query, page, limit } })
      .then((res) => res.data),

  // Get user profile
  getUserProfile: (userId) =>
    api.get(`/users/${userId}`).then((res) => res.data),

  // Get user stats
  getUserStats: (userId) => {
    if (!userId) throw new Error('User ID is required')
    return api.get(`/users/${userId}/stats`).then((res) => res.data)
  },

  // Get all users
  getAllUsers: (page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') =>
    api
      .get('/users', { params: { page, limit, sortBy, sortOrder } })
      .then((res) => res.data),
}

//Admin Api calls
export const adminAPI = {
  getDashboard: () => 
    api.get('/admin/dashboard')
      .then(res => res.data)
      .catch(err => {
        console.error('Dashboard API error:', err);
        throw err;
      }),

  getUsers: (page = 1, limit = 20, { sortBy = 'createdAt', sortOrder = 'desc', role = 'all' } = {}) => {
    const params = { page, limit, sortBy, sortOrder };
    if (role !== 'all') params.role = role;
    return api.get('/admin/users', { params })
      .then(res => res.data)
      .catch(err => {
        console.error('Users API error:', err);
        throw err;
      });
  },

  getPosts: (page = 1, limit = 20, { sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    api.get('/admin/posts', { params: { page, limit, sortBy, sortOrder } })
      .then(res => res.data)
      .catch(err => {
        console.error('Posts API error:', err);
        throw err;
      }),

  getPayouts: (page = 1, limit = 20, { minAmount = 0, sortBy = 'pendingEarnings', sortOrder = 'desc' } = {}) =>
    api.get('/admin/payouts', { params: { page, limit, minAmount, sortBy, sortOrder } })
      .then(res => res.data)
      .catch(err => {
        console.error('Payouts API error:', err);
        throw err;
      }),

  getSettings: () => 
    api.get('/admin/settings')
      .then(res => {
        console.log('Settings API response:', res.data); // Debug log
        return res.data;
      })
      .catch(err => {
        console.error('Get settings API error:', err);
        throw err;
      }),

  updateSettings: (settings) => {
    console.log('Updating settings via API:', settings); // Debug log
    return api.put('/admin/settings', settings)
      .then(res => {
        console.log('Update settings API response:', res.data); // Debug log
        return res.data;
      })
      .catch(err => {
        console.error('Update settings API error:', err);
        throw err;
      });
  },

  approvePayout: (userId, amount) =>
    api.post('/admin/payouts/approve', { userId, amount })
      .then(res => res.data)
      .catch(err => {
        console.error('Approve payout API error:', err);
        throw err;
      }),

  bulkApprovePayout: (payouts) =>
    api.post('/admin/payouts/bulk-approve', { payouts })
      .then(res => res.data)
      .catch(err => {
        console.error('Bulk approve payout API error:', err);
        throw err;
      }),

  updateUserStatus: (userId, isActive) =>
    api.put(`/admin/users/${userId}/status`, { isActive })
      .then(res => res.data)
      .catch(err => {
        console.error('Update user status API error:', err);
        throw err;
      }),

  deletePost: (postId) => 
    api.delete(`/admin/posts/${postId}`)
      .then(res => res.data)
      .catch(err => {
        console.error('Delete post API error:', err);
        throw err;
      }),
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