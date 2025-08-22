// src/store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersAPI } from '../utils/api'

// Search Users
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async ({ query, page = 1 }, { rejectWithValue }) => {
    try {
      return await usersAPI.searchUsers(query, page)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Search failed'
      return rejectWithValue(message)
    }
  }
)

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      return await usersAPI.getUserProfile(userId)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user profile'
      return rejectWithValue(message)
    }
  }
)

// Fetch User Stats
export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (userId, { rejectWithValue }) => {
    try {
      return await usersAPI.getUserStats(userId)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user statistics'
      return rejectWithValue(message)
    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState: {
    searchResults: [],
    currentUserProfile: null,
    userStats: null,
    isLoading: false,
    error: null,
    searchLoading: false,
    profileLoading: false,
    statsLoading: false,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    clearCurrentUserProfile: (state) => {
      state.currentUserProfile = null
    },
    clearUserStats: (state) => {
      state.userStats = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload.users || []
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false
        state.currentUserProfile = action.payload.user || action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false
        state.error = action.payload
      })

      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsLoading = true
        state.error = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.userStats = action.payload.stats || action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })
  },
})

export const { clearSearchResults, clearCurrentUserProfile, clearUserStats, clearError } =
  userSlice.actions
export default userSlice.reducer
