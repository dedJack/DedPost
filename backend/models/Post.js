const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
    maxlength: 2000
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Interaction counters
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  // Earnings tracking
  viewEarnings: {
    type: Number,
    default: 0
  },
  likeEarnings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  // User interactions tracking
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Add view to post
postSchema.methods.addView = function(userId, viewRate = 0) {
  // Check if user already viewed this post
  const existingView = this.views.find(view => view.user.toString() === userId.toString());
  
  if (!existingView) {
    this.views.push({ user: userId });
    this.viewsCount += 1;
    
    // Calculate earnings
    if (viewRate > 0) {
      this.viewEarnings += viewRate;
      this.totalEarnings += viewRate;
    }
  }
  
  return this.save();
};

// Toggle like on post
postSchema.methods.toggleLike = function(userId, likeRate = 0) {
  const existingLikeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (existingLikeIndex > -1) {
    // Unlike - remove like
    this.likes.splice(existingLikeIndex, 1);
    this.likesCount -= 1;
    
    // Remove earnings
    if (likeRate > 0) {
      this.likeEarnings -= likeRate;
      this.totalEarnings -= likeRate;
    }
  } else {
    // Like - add like
    this.likes.push({ user: userId });
    this.likesCount += 1;
    
    // Add earnings
    if (likeRate > 0) {
      this.likeEarnings += likeRate;
      this.totalEarnings += likeRate;
    }
  }
  
  return this.save();
};

// Check if user liked the post
postSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Check if user viewed the post
postSchema.methods.isViewedByUser = function(userId) {
  return this.views.some(view => view.user.toString() === userId.toString());
};

module.exports = mongoose.model('Post', postSchema);