import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response
  },

  async updateProfile(profileData) {
    const formData = new FormData()
    
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key])
      }
    })

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  async changePassword(passwordData) {
    const response = await api.post('/auth/change-password', passwordData)
    return response
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error.message)
    }
  }
}
