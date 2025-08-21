// src/utils/helpers.js
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const validateFile = (file) => {
  const errors = []

  if (!file) {
    errors.push('File is required')
    return errors
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Check file type
  const isValidImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isValidVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isValidImage && !isValidVideo) {
    errors.push('File type not supported. Please upload an image or video.')
  }

  return errors
}

export const getFileType = (file) => {
  if (file.type.startsWith('image/')) return MEDIA_TYPES.IMAGE
  if (file.type.startsWith('video/')) return MEDIA_TYPES.VIDEO
  return null
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const generateAvatarUrl = (username) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3B82F6&color=fff&size=200`
}

export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}