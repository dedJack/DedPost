const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
const postsDir = 'uploads/posts/';
const profilesDir = 'uploads/profiles/';

[uploadDir, postsDir, profilesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file purpose
    if (req.route.path.includes('profile')) {
      cb(null, profilesDir);
    } else {
      cb(null, postsDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    // Allow common image formats
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
  } else if (file.mimetype.startsWith('video/')) {
    // Allow common video formats
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, AVI, MOV, and WebM videos are allowed'), false);
    }
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field name. Use "media" for posts or "avatar" for profile.'
      });
    }
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next(error);
};

// Single file upload for posts
const uploadPostMedia = upload.single('media');

// Single file upload for profile pictures
const uploadProfileImage = upload.single('avatar');

// Multiple files upload (if needed in future)
const uploadMultiple = upload.array('media', 5); // Max 5 files

module.exports = {
  uploadPostMedia,
  uploadProfileImage,
  uploadMultiple,
  handleUploadError
};