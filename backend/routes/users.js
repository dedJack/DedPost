const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' },
      isActive: true,
      role: 'user'
    })
    .select('username profileImage bio followersCount postsCount')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ followersCount: -1 });

    const totalUsers = await User.countDocuments({
      username: { $regex: searchTerm, $options: 'i' },
      isActive: true,
      role: 'user'
    });

    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      followersCount: user.followersCount,
      postsCount: user.postsCount
    }));

    res.json({
      message: 'Users found',
      users: formattedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      message: 'Server error searching users'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username profileImage bio followersCount followingCount postsCount createdAt isActive');

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's recent posts (first 6 for profile preview)
    const recentPosts = await Post.find({
      author: userId,
      isActive: true
    })
    .select('mediaUrl mediaType viewsCount likesCount commentsCount createdAt')
    .sort({ createdAt: -1 })
    .limit(6);

    const userProfile = {
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      stats: {
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount
      },
      memberSince: user.createdAt,
      recentPosts: recentPosts.map(post => ({
        id: post._id,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        viewsCount: post.viewsCount,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt
      })),
      isOwn: req.user ? req.user._id.toString() === userId : false
    };

    res.json({
      message: 'User profile retrieved successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error retrieving user profile'
    });
  }
});

// @route   GET /api/users/:userId/stats
// @desc    Get detailed user statistics
// @access  Private (user can only see own detailed stats)
router.get('/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only see their own detailed stats unless they're admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Can only view your own detailed statistics'
      });
    }

    const user = await User.findById(userId)
      .select('username totalEarnings pendingEarnings paidEarnings postsCount followersCount followingCount createdAt');

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get post analytics
    const postAnalytics = await Post.aggregate([
      { $match: { author: user._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
          totalViewEarnings: { $sum: '$viewEarnings' },
          totalLikeEarnings: { $sum: '$likeEarnings' },
          avgViewsPerPost: { $avg: '$viewsCount' },
          avgLikesPerPost: { $avg: '$likesCount' },
          avgCommentsPerPost: { $avg: '$commentsCount' }
        }
      }
    ]);

    const analytics = postAnalytics.length > 0 ? postAnalytics[0] : {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalViewEarnings: 0,
      totalLikeEarnings: 0,
      avgViewsPerPost: 0,
      avgLikesPerPost: 0,
      avgCommentsPerPost: 0
    };

    // Get monthly earnings for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyEarnings = await Post.aggregate([
      {
        $match: {
          author: user._id,
          isActive: true,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$totalEarnings' },
          posts: { $sum: 1 },
          views: { $sum: '$viewsCount' },
          likes: { $sum: '$likesCount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get top performing posts
    const topPosts = await Post.find({
      author: userId,
      isActive: true
    })
    .select('caption mediaUrl mediaType viewsCount likesCount commentsCount totalEarnings createdAt')
    .sort({ totalEarnings: -1, viewsCount: -1 })
    .limit(5);

    const userStats = {
      user: {
        id: user._id,
        username: user.username,
        memberSince: user.createdAt
      },
      earnings: {
        total: user.totalEarnings,
        pending: user.pendingEarnings,
        paid: user.paidEarnings,
        breakdown: {
          fromViews: analytics.totalViewEarnings,
          fromLikes: analytics.totalLikeEarnings
        }
      },
      engagement: {
        totalViews: analytics.totalViews,
        totalLikes: analytics.totalLikes,
        totalComments: analytics.totalComments,
        averages: {
          viewsPerPost: Math.round(analytics.avgViewsPerPost * 100) / 100,
          likesPerPost: Math.round(analytics.avgLikesPerPost * 100) / 100,
          commentsPerPost: Math.round(analytics.avgCommentsPerPost * 100) / 100
        }
      },
      growth: {
        postsCount: user.postsCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      },
      monthlyData: monthlyEarnings.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        earnings: item.earnings,
        posts: item.posts,
        views: item.views,
        likes: item.likes
      })),
      topPosts: topPosts.map(post => ({
        id: post._id,
        caption: post.caption.substring(0, 100) + (post.caption.length > 100 ? '...' : ''),
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        stats: {
          views: post.viewsCount,
          likes: post.likesCount,
          comments: post.commentsCount,
          earnings: post.totalEarnings
        },
        createdAt: post.createdAt
      }))
    };

    res.json({
      message: 'User statistics retrieved successfully',
      stats: userStats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving user statistics'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    const users = await User.find({
      isActive: true,
      role: 'user'
    })
    .select('username profileImage bio followersCount postsCount createdAt')
    .sort(sort)
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments({
      isActive: true,
      role: 'user'
    });

    const totalPages = Math.ceil(totalUsers / limit);

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      stats: {
        followersCount: user.followersCount,
        postsCount: user.postsCount
      },
      memberSince: user.createdAt
    }));

    res.json({
      message: 'Users retrieved successfully',
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users'
    });
  }
});

module.exports = router;