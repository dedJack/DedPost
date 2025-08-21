// src/services/adminService.js
import api from './api'

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard')
    return response
  },

  async getUsers(page = 1, limit = 20, options = {}) {
    const { sortBy = 'createdAt', sortOrder = 'desc', role = 'all' } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(role !== 'all' && { role })
    }).toString()
    
    const response = await api.get(`/admin/users?${queryParams}`)
    return response
  },

  async getPosts(page = 1, limit = 20, options = {}) {
    const { sortBy = 'createdAt', sortOrder = 'desc' } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    }).toString()
    
    const response = await api.get(`/admin/posts?${queryParams}`)
    return response
  },

  async getPayouts(page = 1, limit = 20, options = {}) {
    const { minAmount = 0, sortBy = 'pendingEarnings', sortOrder = 'desc' } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      minAmount: minAmount.toString(),
      sortBy,
      sortOrder
    }).toString()
    
    const response = await api.get(`/admin/payouts?${queryParams}`)
    return response
  },

  async getSettings() {
    const response = await api.get('/admin/settings')
    return response
  },

  async updateSettings(settings) {
    const response = await api.put('/admin/settings', settings)
    return response
  },

  async approvePayout(userId, amount) {
    const response = await api.post('/admin/payouts/approve', {
      userId,
      amount,
    })
    return response
  },

  async bulkApprovePayout(payouts) {
    const response = await api.post('/admin/payouts/bulk-approve', {
      payouts,
    })
    return response
  },

  async updateUserStatus(userId, isActive) {
    const response = await api.put(`/admin/users/${userId}/status`, {
      isActive,
    })
    return response
  },

  async deletePost(postId) {
    const response = await api.delete(`/admin/posts/${postId}`)
    return response
  },

  // Additional utility methods
  async getUserStats() {
    const response = await api.get('/admin/users/stats')
    return response
  },

  async getPostStats() {
    const response = await api.get('/admin/posts/stats')
    return response
  },

  async getEarningsReport(startDate, endDate) {
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }).toString()
    
    const response = await api.get(`/admin/reports/earnings?${queryParams}`)
    return response
  },

  async exportData(type, format = 'csv') {
    const response = await api.get(`/admin/export/${type}?format=${format}`, {
      responseType: 'blob'
    })
    return response
  }
}