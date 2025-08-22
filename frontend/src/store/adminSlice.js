import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAPI } from "../utils/api";
import { toast } from "react-hot-toast";

const initialState = {
  dashboard: null,
  settings: null,
  users: [],
  posts: [],
  payouts: [],
  pagination: {},
  isLoading: false,
  error: null,
  platformSettings: {
    platformName: "DedPost",
    currency: "USD",
    currencySymbol: "$",
  },
};

// Async thunks
export const fetchDashboard = createAsyncThunk("admin/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    return await adminAPI.getDashboard();
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch dashboard';
    return rejectWithValue(message);
  }
});

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 20, ...options } = params;
    return await adminAPI.getUsers(page, limit, options);
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch users';
    return rejectWithValue(message);
  }
});

export const fetchPosts = createAsyncThunk("admin/fetchPosts", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 20, ...options } = params;
    return await adminAPI.getPosts(page, limit, options);
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch posts';
    return rejectWithValue(message);
  }
});

export const fetchPayouts = createAsyncThunk("admin/fetchPayouts", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 20, ...options } = params;
    return await adminAPI.getPayouts(page, limit, options);
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch payouts';
    return rejectWithValue(message);
  }
});

export const fetchSettings = createAsyncThunk("admin/fetchSettings", async (_, { rejectWithValue }) => {
  try {
    return await adminAPI.getSettings();
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to fetch settings';
    return rejectWithValue(message);
  }
});

export const updateSettings = createAsyncThunk("admin/updateSettings", async (settings, { rejectWithValue }) => {
  try {
    const res = await adminAPI.updateSettings(settings);
    toast.success("Settings updated successfully!");
    return res;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to update settings';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const approvePayout = createAsyncThunk("admin/approvePayout", async ({ userId, amount }, { rejectWithValue }) => {
  try {
    const res = await adminAPI.approvePayout(userId, amount);
    toast.success("Payout approved successfully!");
    return res;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to approve payout';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const bulkApprovePayout = createAsyncThunk("admin/bulkApprovePayout", async (payouts, { rejectWithValue }) => {
  try {
    const res = await adminAPI.bulkApprovePayout(payouts);
    toast.success("Bulk payouts approved successfully!");
    return res;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to approve bulk payouts';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateUserStatus = createAsyncThunk("admin/updateUserStatus", async ({ userId, isActive }, { rejectWithValue }) => {
  try {
    const res = await adminAPI.updateUserStatus(userId, isActive);
    toast.success(`User ${isActive ? "activated" : "deactivated"} successfully!`);
    return res;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to update user status';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const deletePost = createAsyncThunk("admin/deletePost", async (postId, { rejectWithValue }) => {
  try {
    const res = await adminAPI.deletePost(postId);
    toast.success("Post deleted successfully!");
    return res;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to delete post';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Specific cases MUST come first
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.dashboard;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
        state.pagination.users = action.payload.pagination;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload.posts || [];
        state.pagination.posts = action.payload.pagination;
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.payouts = action.payload.payouts?.users || [];
        state.pagination.payouts = action.payload.pagination;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        // Update platform settings when fetching
        if (action.payload.settings?.platform) {
          state.platformSettings = {
            platformName: action.payload.settings.platform.platformName || state.platformSettings.platformName,
            currency: action.payload.settings.platform.currency || state.platformSettings.currency,
            currencySymbol: action.payload.settings.platform.currencySymbol || state.platformSettings.currencySymbol,
          };
        }
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        // Update platform settings when updating
        if (action.payload.settings?.platform) {
          state.platformSettings = {
            platformName: action.payload.settings.platform.platformName || state.platformSettings.platformName,
            currency: action.payload.settings.platform.currency || state.platformSettings.currency,
            currencySymbol: action.payload.settings.platform.currencySymbol || state.platformSettings.currencySymbol,
          };
        }
      })
      .addCase(approvePayout.fulfilled, (state, action) => {
        const userId = action.payload.payout.userId;
        state.payouts = state.payouts.filter((p) => p.id !== userId);
      })
      .addCase(bulkApprovePayout.fulfilled, (state, action) => {
        const approvedUserIds = action.payload.results.map((r) => r.userId);
        state.payouts = state.payouts.filter((p) => !approvedUserIds.includes(p.id));
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const idx = state.users.findIndex((u) => u.id === updatedUser.id);
        if (idx !== -1) state.users[idx].isActive = updatedUser.isActive;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload.deletedPost.id;
        state.posts = state.posts.filter((post) => post.id !== deletedPostId);
      })
      
      // Generic matchers MUST come after all addCase calls
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
          state.error = null;
        }
      );
  },
});

export const { clearError, setLoading } = adminSlice.actions;
export default adminSlice.reducer;