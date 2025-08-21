import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../services/authService'
import { setAuthData, clearAuthData, getAuthData } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'

// Initialize auth state from localStorage
const initialAuth = getAuthData()

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      
      const { token, user } = response
      
      if (!token || !user) {
        throw new Error('Invalid response format - missing token or user data')
      }
      
      // Store auth data and set header
      setAuthData(token, user)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Registration successful!')
      return { token, user }
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      
      const { token, user } = response
      
      if (!token || !user) {
        throw new Error('Invalid response format - missing token or user data')
      }
      
      // Store auth data and set header
      setAuthData(token, user)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Welcome back!')
      return { token, user }
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const storedAuth = getAuthData()
      
      if (!storedAuth?.token) {
        throw new Error('No token found')
      }
      
      // Set token for the request
      api.defaults.headers.common['Authorization'] = `Bearer ${storedAuth.token}`
      
      const response = await authService.getCurrentUser()
      const { user } = response
      
      if (!user) {
        throw new Error('Invalid user data')
      }
      
      // Update stored user data
      setAuthData(storedAuth.token, user)
      
      return { user, token: storedAuth.token }
    } catch (error) {
      clearAuthData()
      delete api.defaults.headers.common['Authorization']
      return rejectWithValue(error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const response = await authService.updateProfile(profileData)
      const { user } = response
      
      if (!user) {
        throw new Error('Invalid response format')
      }
      
      // Update stored user data
      const { auth } = getState()
      setAuthData(auth.token, user)
      
      toast.success('Profile updated successfully!')
      return { user }
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout API call failed:', error.message)
    } finally {
      // Always clear local auth data
      clearAuthData()
      delete api.defaults.headers.common['Authorization']
      toast.success('Logged out successfully')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialAuth?.user || null,
    token: initialAuth?.token || null,
    isAuthenticated: !!initialAuth?.token,
    isLoading: true, // Start with loading true to check auth
    error: null,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setInitialized: (state) => {
      state.isInitialized = true
      state.isLoading = false
    },
    // Manual logout for cases where async logout isn't needed
    logoutSync: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.error = null
      clearAuthData()
      delete api.defaults.headers.common['Authorization']
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isInitialized = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.isInitialized = true
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isInitialized = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.isInitialized = true
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        if (!state.isInitialized) {
          state.isLoading = true
        }
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isInitialized = true
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.error = null
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.error = null
      })
  },
})

export const { clearError, setInitialized, logoutSync } = authSlice.actions
export default authSlice.reducer
