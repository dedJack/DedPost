// // src/store/userSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import { userService } from '../services/userService'

// export const searchUsers = createAsyncThunk(
//   'users/searchUsers',
//   async ({ query, page = 1 }, { rejectWithValue }) => {
//     try {
//       const response = await userService.searchUsers(query, page)
//       return response
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )

// export const fetchUserProfile = createAsyncThunk(
//   'users/fetchUserProfile',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await userService.getUserProfile(userId)
//       return response
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )

// export const fetchUserStats = createAsyncThunk(
//   'users/fetchUserStats',
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await userService.getUserStats(userId)
//       console.log(response)
//       return response
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )

// const userSlice = createSlice({
//   name: 'users',
//   initialState: {
//     searchResults: [],
//     currentUserProfile: null,
//     userStats: null,
//     isLoading: false,
//     error: null,
//   },
//   reducers: {
//     clearSearchResults: (state) => {
//       state.searchResults = []
//     },
//     clearCurrentUserProfile: (state) => {
//       state.currentUserProfile = null
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(searchUsers.pending, (state) => {
//         state.isLoading = true
//         state.error = null
//       })
//       .addCase(searchUsers.fulfilled, (state, action) => {
//         state.isLoading = false
//         state.searchResults = action.payload.users
//       })
//       .addCase(searchUsers.rejected, (state, action) => {
//         state.isLoading = false
//         state.error = action.payload
//       })
//       .addCase(fetchUserProfile.pending, (state) => {
//         state.isLoading = true
//       })
//       .addCase(fetchUserProfile.fulfilled, (state, action) => {
//         state.isLoading = false
//         state.currentUserProfile = action.payload.user
//       })
//       .addCase(fetchUserProfile.rejected, (state, action) => {
//         state.isLoading = false
//         state.error = action.payload
//       })
//       .addCase(fetchUserStats.fulfilled, (state, action) => {
//         state.userStats = action.payload.stats
//       })
//   },
// })

// export const { clearSearchResults, clearCurrentUserProfile } = userSlice.actions
// export default userSlice.reducer


// src/store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '../services/userService'

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async ({ query, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query, page)
      
      // Handle different response formats
      let responseData = response
      if (response.data) {
        responseData = response.data
      }
      
      return responseData
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Search failed'
      return rejectWithValue(message)
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(userId)
      
      // Handle different response formats
      let responseData = response
      if (response.data) {
        responseData = response.data
      }
      
      return responseData
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user profile'
      return rejectWithValue(message)
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (userId, { rejectWithValue }) => {
    try {
      // Ensure userId is properly formatted
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const response = await userService.getUserStats(userId)
      console.log('User stats response:', response)
      
      // Handle different response formats
      let responseData = response
      if (response) {
        responseData = response
      }
      
      return responseData
    } catch (error) {
      console.error('Fetch user stats error:', error)
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
        state.userStats = action.payload.status || action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
        console.error('User stats fetch failed:', action.payload)
      })
  },
})

export const { clearSearchResults, clearCurrentUserProfile, clearUserStats, clearError } = userSlice.actions
export default userSlice.reducer