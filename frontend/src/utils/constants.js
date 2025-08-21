// src/utils/constants.js
// Add this import at the top of helpers.js
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MEDIA_TYPES } from './constants.js'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'DedPost'

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
}

export const POST_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/webm',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  POSTS_PER_PAGE: 10,
  USERS_PER_PAGE: 20,
}