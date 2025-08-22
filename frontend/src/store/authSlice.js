import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, setAuthToken, clearAuthData, getStoredAuth as getAuthData } from '../utils/api'
import toast from 'react-hot-toast'

// Initialize auth state from localStorage
const initialAuth = getAuthData()

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(userData)
      const { token, user } = data

      if (!token || !user) {
        throw new Error('Invalid response format - missing token or user data')
      }

      // Store auth data and set header
      localStorage.setItem('dedpost-auth', JSON.stringify({ token, user }))
      setAuthToken(token)

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
      const { data } = await authAPI.login(credentials)
      const { token, user } = data

      if (!token || !user) {
        throw new Error('Invalid response format - missing token or user data')
      }

      // Store auth data and set header
      localStorage.setItem('dedpost-auth', JSON.stringify({ token, user }))
      setAuthToken(token)

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

      setAuthToken(storedAuth.token)

      const { data } = await authAPI.getCurrentUser()
      const { user } = data

      if (!user) {
        throw new Error('Invalid user data')
      }

      // Update stored user data
      localStorage.setItem('dedpost-auth', JSON.stringify({ token: storedAuth.token, user }))

      return { user, token: storedAuth.token }
    } catch (error) {
      clearAuthData()
      return rejectWithValue(error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { data } = await authAPI.updateProfile(profileData)
      const { user } = data

      if (!user) {
        throw new Error('Invalid response format')
      }

      // Update stored user data
      const { auth } = getState()
      localStorage.setItem('dedpost-auth', JSON.stringify({ token: auth.token, user }))

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
  async () => {
    try {
      // optional: await authAPI.logout() (not required in your backend)
    } catch (error) {
      console.warn('Logout API call failed:', error.message)
    } finally {
      // Always clear local auth data
      clearAuthData()
      setAuthToken(null)
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
    logoutSync: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.error = null
      clearAuthData()
      setAuthToken(null)
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
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
