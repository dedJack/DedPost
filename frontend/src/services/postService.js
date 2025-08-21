// src/services/postService.js
import api from './api'

export const postService = {
  async getFeed(page = 1, limit = 10) {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`)
    return response
  },

  async getUserPosts(userId, page = 1, limit = 12) {
    try {
      const response = await api.get(`/posts/user/${userId}`, {
        params: { page, limit }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  async getPostDetails(postId) {
    const response = await api.get(`/posts/${postId}`)
    return response
  },

  async createPost(postData) {
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

  async likePost(postId) {
    const response = await api.post(`/posts/${postId}/like`)
    return response
  },

  async addComment(postId, content, parentCommentId = null) {
    const response = await api.post(`/posts/${postId}/comments`, {
        content: content, // Make sure content is sent as a string
    })
    return response
  },

  async deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`)
    return response
  },
}