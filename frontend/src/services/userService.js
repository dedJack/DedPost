// // src/services/userService.js
// import api from './api'

// export const userService = {
//   async searchUsers(query, page = 1, limit = 10) {
//     const response = await api.get(`/users/search?q=${query}&page=${page}&limit=${limit}`)
//     return response
//   },

//   async getUserProfile(userId) {
//     const response = await api.get(`/users/${userId}`)
//     return response
//   },

//   async getUserStats(userId) {
//     const response = await api.get(`/users/${userId}/stats`)
//     console.log("hiii",response)
//     return response
//   },

//   async getAllUsers(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
//     const response = await api.get(`/users?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
//     return response
//   }
// }


// src/services/userService.js
import api from './api'

export const userService = {
  async searchUsers(query, page = 1, limit = 10) {
    try {
      const response = await api.get(`/users/search?q=${query}&page=${page}&limit=${limit}`)
      return response
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Search failed'
      throw new Error(message)
    }
  },

  async getUserProfile(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const response = await api.get(`/users/${userId}`)
      return response
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get user profile'
      throw new Error(message)
    }
  },

  async getUserStats(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      console.log('Fetching stats for user ID:', userId)
      const response = await api.get(`/users/${userId}/stats`)
      console.log('User stats response:', response.data)
      return response
    } catch (error) {
      console.error('getUserStats error:', error)
      const message = error.response?.data?.message || error.message || 'Failed to get user statistics'
      // throw new Error(message)
    }
  },

  async getAllUsers(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      return response
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get users'
      throw new Error(message)
    }
  }
}