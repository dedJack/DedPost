const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadPostMedia, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, uploadPostMedia, handleUploadError, [
  body('caption')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Caption must be between 1 and 2000 characters')
    .trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Media file is required'
      });
    }

    const { caption } = req.body;

    // Determine media type
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Create new post
    const post = new Post({
      caption,
      mediaUrl: `/uploads/posts/${req.file.filename}`,
      mediaType,
      author: req.user._id
    });

    await post.save();

    // Update user's posts count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postsCount: 1 }
    });

    // Populate author information
    await post.populate('author', 'username profileImage');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        author: {
          id: post.author._id,
          username: post.author.username,
          profileImage: post.author.profileImage
        },
        viewsCount: post.viewsCount,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        totalEarnings: post.totalEarnings,
        createdAt: post.createdAt,
        isLiked: false,
        isViewed: false
      }
    });

  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      message: 'Server error creating post'
    });
  }
});

// @route   GET /api/posts/feed
// @desc    Get news feed posts
// @access  Private/Public (with optional auth)
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts sorted by creation date (newest first)
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format posts with user interaction info
    const formattedPosts = posts.map(post => ({
      id: post._id,
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: {
        id: post.author._id,
        username: post.author.username,
        profileImage: post.author.profileImage
      },
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      totalEarnings: post.totalEarnings,
      createdAt: post.createdAt,
      isLiked: req.user ? post.isLikedByUser(req.user._id) : false,
      isViewed: req.user ? post.isViewedByUser(req.user._id) : false
    }));

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      message: 'Feed retrieved successfully',
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      message: 'Server error retrieving feed'
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Public
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(userId).select('username profileImage postsCount');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's posts
    const posts = await Post.find({ 
      author: userId, 
      isActive: true 
    })
    .populate('author', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Format posts
    const formattedPosts = posts.map(post => ({
      id: post._id,
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      totalEarnings: post.totalEarnings,
      createdAt: post.createdAt,
      isLiked: req.user ? post.isLikedByUser(req.user._id) : false,
      isViewed: req.user ? post.isViewedByUser(req.user._id) : false
    }));

    const totalPages = Math.ceil(user.postsCount / limit);

    res.json({
      message: 'User posts retrieved successfully',
      user: {
        id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        postsCount: user.postsCount
      },
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: user.postsCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('User posts error:', error);
    res.status(500).json({
      message: 'Server error retrieving user posts'
    });
  }
});

// @route   GET /api/posts/:postId
// @desc    Get single post with details
// @access  Public
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'username profileImage');

    if (!post || !post.isActive) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Add view if user is authenticated and hasn't viewed before
    if (req.user && !post.isViewedByUser(req.user._id)) {
      const settings = await Settings.getSettings();
      await post.addView(req.user._id, settings.viewRate);
      
      // Update user earnings
      if (settings.enableEarnings && settings.viewRate > 0) {
        await User.findByIdAndUpdate(post.author._id, {
          $inc: { 
            totalEarnings: settings.viewRate,
            pendingEarnings: settings.viewRate
          }
        });
      }
    }

    // Get comments for this post
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null, 
      isActive: true 
    })
    .populate('author', 'username profileImage')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username profileImage'
      }
    })
    .sort({ createdAt: -1 });

    const formattedPost = {
      id: post._id,
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: {
        id: post.author._id,
        username: post.author.username,
        profileImage: post.author.profileImage
      },
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      totalEarnings: post.totalEarnings,
      createdAt: post.createdAt,
      isLiked: req.user ? post.isLikedByUser(req.user._id) : false,
      isViewed: req.user ? post.isViewedByUser(req.user._id) : true,
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        author: {
          id: comment.author._id,
          username: comment.author.username,
          profileImage: comment.author.profileImage
        },
        likesCount: comment.likesCount,
        createdAt: comment.createdAt,
        isLiked: req.user ? comment.isLikedByUser(req.user._id) : false,
        replies: comment.replies.map(reply => ({
          id: reply._id,
          content: reply.content,
          author: {
            id: reply.author._id,
            username: reply.author.username,
            profileImage: reply.author.profileImage
          },
          createdAt: reply.createdAt
        }))
      }))
    };

    res.json({
      message: 'Post retrieved successfully',
      post: formattedPost
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Server error retrieving post'
    });
  }
});

// @route   POST /api/posts/:postId/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    const settings = await Settings.getSettings();
    const wasLiked = post.isLikedByUser(req.user._id);
    
    // Toggle like
    await post.toggleLike(req.user._id, settings.likeRate);

    // Update author's earnings
    if (settings.enableEarnings && settings.likeRate > 0) {
      const earningChange = wasLiked ? -settings.likeRate : settings.likeRate;
      await User.findByIdAndUpdate(post.author._id, {
        $inc: { 
          totalEarnings: earningChange,
          pendingEarnings: earningChange
        }
      });
    }

    const isNowLiked = !wasLiked;

    res.json({
      message: isNowLiked ? 'Post liked' : 'Post unliked',
      isLiked: isNowLiked,
      likesCount: post.likesCount
    });

  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({
      message: 'Server error toggling like'
    });
  }
});

// @route   POST /api/posts/:postId/comments
// @desc    Add comment to a post
// @access  Private
router.post('/:postId/comments', auth, [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim(),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Update post comments count
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // If it's a reply, add to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    // Populate author info
    await comment.populate('author', 'username profileImage');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        author: {
          id: comment.author._id,
          username: comment.author.username,
          profileImage: comment.author.profileImage
        },
        likesCount: comment.likesCount,
        createdAt: comment.createdAt,
        isLiked: false
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      message: 'Server error adding comment'
    });
  }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post (soft delete)
// @access  Private
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Update user's posts count
    await User.findByIdAndUpdate(post.author, {
      $inc: { postsCount: -1 }
    });

    res.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      message: 'Server error deleting post'
    });
  }
});

module.exports = router;