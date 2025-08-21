// src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper functions for token management
const getAuthData = () => {
  try {
    const stored = localStorage.getItem('dedpost-auth')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setAuthData = (token, user) => {
  const authData = { token, user }
  localStorage.setItem('dedpost-auth', JSON.stringify(authData))
}

const clearAuthData = () => {
  localStorage.removeItem('dedpost-auth')
}

// Set initial token if exists
const initialAuth = getAuthData()
if (initialAuth?.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialAuth.token}`
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authData = getAuthData()
    if (authData?.token) {
      config.headers.Authorization = `Bearer ${authData.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    
    // Handle authentication errors
    if (status === 401) {
      clearAuthData()
      delete api.defaults.headers.common['Authorization']
      
      // Only redirect to login if not already on auth pages
      const currentPath = window.location.pathname
      if (!['/login', '/register'].includes(currentPath)) {
        window.location.href = '/login'
      }
    }
    
    // Extract error message
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Something went wrong'
    
    return Promise.reject(new Error(message))
  }
)

export default api
export { getAuthData, setAuthData, clearAuthData }