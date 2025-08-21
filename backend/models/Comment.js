const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
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
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// Toggle like on comment
commentSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (existingLikeIndex > -1) {
    // Unlike
    this.likes.splice(existingLikeIndex, 1);
    this.likesCount -= 1;
  } else {
    // Like
    this.likes.push({ user: userId });
    this.likesCount += 1;
  }
  
  return this.save();
};

// Check if user liked the comment
commentSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Add reply to comment
commentSchema.methods.addReply = function(replyId) {
  this.replies.push(replyId);
  return this.save();
};

module.exports = mongoose.model('Comment', commentSchema);