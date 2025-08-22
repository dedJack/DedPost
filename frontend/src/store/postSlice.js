import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postsAPI } from '../utils/api'   // ✅ switched from postService
import toast from 'react-hot-toast'

export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await postsAPI.getFeed({ page, limit })   
      return { ...data, page }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const { data } = await postsAPI.createPost(postData)   
      toast.success('Post created successfully!')
      return data
    } catch (error) {
      toast.error(error.message || 'Failed to create post')
      return rejectWithValue(error.message)
    }
  }
)

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await postsAPI.likePost(postId)   
      return { postId, ...data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const data  = await postsAPI.addComment(postId, content)   
      return { postId, comment: data.comment }  
    } catch (error) {
      toast.error(error.message || 'Failed to add comment')
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPostDetails = createAsyncThunk(
  'posts/fetchPostDetails',
  async (postId, { rejectWithValue }) => {
    try {
      const response  = await postsAPI.getPost(postId)  
      return response.post || response 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feed: [],
    currentPost: null,
    isLoading: false,
    isCreating: false,
    hasMore: true,
    currentPage: 1,
    error: null,
  },
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null
    },
    clearFeed: (state) => {
      state.feed = []
      state.currentPage = 1
      state.hasMore = true
    },
    updatePostInFeed: (state, action) => {
      const { postId, updates } = action.payload
      const postIndex = state.feed.findIndex(
        post => post._id === postId || post.id === postId
      )
      if (postIndex !== -1) {
        state.feed[postIndex] = { ...state.feed[postIndex], ...updates }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false
        const { posts, pagination, page } = action.payload

        const normalizedPosts = posts.map(p => ({
          ...p,
          id: p.id || p._id,
        }))

        if (page === 1) {
          state.feed = normalizedPosts
        } else {
          state.feed = [...state.feed, ...normalizedPosts]
        }

        state.currentPage = pagination.currentPage
        state.hasMore = pagination.hasNextPage
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false
        const post = { ...action.payload.post, id: action.payload.post.id || action.payload.post._id }
        state.feed.unshift(post)
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload
        const postIndex = state.feed.findIndex(post => post._id === postId || post.id === postId)
        if (postIndex !== -1) {
          state.feed[postIndex].isLiked = isLiked
          state.feed[postIndex].likesCount = likesCount
        }
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.isLiked = isLiked
          state.currentPost.likesCount = likesCount
        }
      })
      // Fetch Post Details
      .addCase(fetchPostDetails.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPost = {
          ...action.payload,
          id: action.payload.id || action.payload._id,
        }
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.comments.unshift(comment)
          state.currentPost.commentsCount += 1
        }
        const postIndex = state.feed.findIndex(post => post._id === postId || post.id === postId)
        if (postIndex !== -1) {
          state.feed[postIndex].commentsCount += 1
        }
      })
  },
})

export const { clearCurrentPost, clearFeed, updatePostInFeed } = postSlice.actions
export default postSlice.reducer
