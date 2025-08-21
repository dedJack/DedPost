// src/store/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {adminService} from '../services/adminService'
import { toast } from 'react-hot-toast'

const initialState = {
  dashboard: null,
  settings: null,
  isLoading: false,
  error: null,
  platformSettings: {
    platformName: 'DedPost',
    currency: 'USD',
    currencySymbol: '$'
  }
}

export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboard()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', role = 'all' }, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(page, limit, { sortBy, sortOrder, role })
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPosts = createAsyncThunk(
  'admin/fetchPosts',
  async ({ page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const response = await adminService.getPosts(page, limit, { sortBy, sortOrder })
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPayouts = createAsyncThunk(
  'admin/fetchPayouts',
  async ({ page = 1, limit = 20, minAmount = 0, sortBy = 'pendingEarnings', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const response = await adminService.getPayouts(page, limit, { minAmount, sortBy, sortOrder })
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSettings()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings(settings)
      toast.success('Settings updated successfully!')
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to update settings')
      return rejectWithValue(error.message)
    }
  }
)

export const approvePayout = createAsyncThunk(
  'admin/approvePayout',
  async ({ userId, amount }, { rejectWithValue }) => {
    try {
      const response = await adminService.approvePayout(userId, amount)
      toast.success('Payout approved successfully!')
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to approve payout')
      return rejectWithValue(error.message)
    }
  }
)

export const bulkApprovePayout = createAsyncThunk(
  'admin/bulkApprovePayout',
  async (payouts, { rejectWithValue }) => {
    try {
      const response = await adminService.bulkApprovePayout(payouts)
      toast.success('Bulk payouts approved successfully!')
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to approve bulk payouts')
      return rejectWithValue(error.message)
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserStatus(userId, isActive)
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to update user status')
      return rejectWithValue(error.message)
    }
  }
)

export const deletePost = createAsyncThunk(
  'admin/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await adminService.deletePost(postId)
      toast.success('Post deleted successfully!')
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to delete post')
      return rejectWithValue(error.message)
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboard = action.payload.dashboard
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.users
        state.pagination.users = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts = action.payload.posts
        state.pagination.posts = action.payload.pagination
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Payouts
      .addCase(fetchPayouts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.isLoading = false
        state.payouts = action.payload.payouts.users
        state.pagination.payouts = action.payload.pagination
      })
      .addCase(fetchPayouts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Settings
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload.settings
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload
        // Update platformSettings when settings are updated
        state.platformSettings = {
          platformName: action.payload.platformName || state.platformSettings.platformName,
          currency: action.payload.currency || state.platformSettings.currency,
          currencySymbol: action.payload.currencySymbol || state.platformSettings.currencySymbol
        }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Approve Payout
      .addCase(approvePayout.fulfilled, (state, action) => {
        // Remove approved user from payouts list or update their status
        const userId = action.payload.payout.userId
        state.payouts = state.payouts.filter(payout => payout.id !== userId)
      })

      // Bulk Approve Payout
      .addCase(bulkApprovePayout.fulfilled, (state, action) => {
        // Remove approved users from payouts list
        const approvedUserIds = action.payload.results.map(result => result.userId)
        state.payouts = state.payouts.filter(payout => !approvedUserIds.includes(payout.id))
      })

      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.user
        const userIndex = state.users.findIndex(user => user.id === updatedUser.id)
        if (userIndex !== -1) {
          state.users[userIndex].isActive = updatedUser.isActive
        }
      })

      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload.deletedPost.id
        state.posts = state.posts.filter(post => post.id !== deletedPostId)
      })
  },
})

export default adminSlice.reducer