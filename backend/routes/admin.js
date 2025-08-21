const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Settings = require('../models/Settings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get platform statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalViews = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } }
    ]);
    const totalLikes = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    const totalComments = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$commentsCount' } } }
    ]);

    // Get total earnings
    const totalEarnings = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);

    // Get total payable amount (pending earnings)
    const totalPayable = await User.aggregate([
      { $match: { isActive: true, role: 'user' } },
      { $group: { _id: null, total: { $sum: '$pendingEarnings' } } }
    ]);

    // Get recent posts with earnings
    const recentPosts = await Post.find({ isActive: true })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('caption mediaUrl mediaType viewsCount likesCount commentsCount totalEarnings viewEarnings likeEarnings createdAt author');

    // Get top earning posts
    const topEarningPosts = await Post.find({ isActive: true })
      .populate('author', 'username profileImage')
      .sort({ totalEarnings: -1 })
      .limit(5)
      .select('caption mediaUrl mediaType viewsCount likesCount commentsCount totalEarnings viewEarnings likeEarnings createdAt author');

    // Get current settings
    const settings = await Settings.getSettings();

    const dashboardData = {
      statistics: {
        totalUsers,
        totalPosts,
        totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
        totalLikes: totalLikes.length > 0 ? totalLikes[0].total : 0,
        totalComments: totalComments.length > 0 ? totalComments[0].total : 0,
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        totalPayable: totalPayable.length > 0 ? totalPayable[0].total : 0
      },
      recentPosts: recentPosts.map(post => ({
        id: post._id,
        caption: post.caption.substring(0, 100) + (post.caption.length > 100 ? '...' : ''),
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
        viewEarnings: post.viewEarnings,
        likeEarnings: post.likeEarnings,
        createdAt: post.createdAt
      })),
      topEarningPosts: topEarningPosts.map(post => ({
        id: post._id,
        caption: post.caption.substring(0, 100) + (post.caption.length > 100 ? '...' : ''),
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
        viewEarnings: post.viewEarnings,
        likeEarnings: post.likeEarnings,
        createdAt: post.createdAt
      })),
      currentRates: {
        viewRate: settings.viewRate,
        likeRate: settings.likeRate,
        enableEarnings: settings.enableEarnings
      }
    };

    res.json({
      message: 'Dashboard data retrieved successfully',
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard data'
    });
  }
});

// @route   GET /api/admin/posts
// @desc    Get all posts with detailed analytics
// @access  Admin
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    const posts = await Post.find({ isActive: true })
      .populate('author', 'username email profileImage totalEarnings')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalPosts / limit);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: {
        id: post.author._id,
        username: post.author.username,
        email: post.author.email,
        profileImage: post.author.profileImage,
        totalEarnings: post.author.totalEarnings
      },
      analytics: {
        viewsCount: post.viewsCount,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        viewEarnings: post.viewEarnings,
        likeEarnings: post.likeEarnings,
        totalEarnings: post.totalEarnings
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.json({
      message: 'Posts retrieved successfully',
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
    console.error('Admin posts error:', error);
    res.status(500).json({
      message: 'Server error retrieving posts'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with earnings info
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const role = req.query.role || 'all';

    // Build filter
    const filter = { isActive: true };
    if (role !== 'all') {
      filter.role = role;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get post counts for each user
    const userIds = users.map(user => user._id);
    const postCounts = await Post.aggregate([
      { $match: { author: { $in: userIds }, isActive: true } },
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);

    const postCountMap = {};
    postCounts.forEach(item => {
      postCountMap[item._id] = item.count;
    });

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      earnings: {
        totalEarnings: user.totalEarnings,
        pendingEarnings: user.pendingEarnings,
        paidEarnings: user.paidEarnings
      },
      stats: {
        postsCount: postCountMap[user._id] || 0,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      },
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      isActive: user.isActive
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
    console.error('Admin users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users'
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get platform settings
// @access  Admin
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.json({
      message: 'Settings retrieved successfully',
      settings: {
        rates: {
          viewRate: settings.viewRate,
          likeRate: settings.likeRate
        },
        platform: {
          platformName: settings.platformName,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol
        },
        uploads: {
          maxFileSize: settings.maxFileSize,
          allowedImageTypes: settings.allowedImageTypes,
          allowedVideoTypes: settings.allowedVideoTypes
        },
        payouts: {
          minPayoutAmount: settings.minPayoutAmount,
          autoPayoutEnabled: settings.autoPayoutEnabled,
          autoPayoutThreshold: settings.autoPayoutThreshold
        },
        features: {
          allowVideoUploads: settings.allowVideoUploads,
          allowImageUploads: settings.allowImageUploads,
          enableEarnings: settings.enableEarnings
        }
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      message: 'Server error retrieving settings'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update platform settings
// @access  Admin
router.put('/settings', adminAuth, [
  body('viewRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('View rate must be a positive number'),
  body('likeRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Like rate must be a positive number'),
  body('minPayoutAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum payout amount must be a positive number'),
  body('enableEarnings')
    .optional()
    .isBoolean()
    .withMessage('Enable earnings must be a boolean'),
  body('allowVideoUploads')
    .optional()
    .isBoolean()
    .withMessage('Allow video uploads must be a boolean'),
  body('allowImageUploads')
    .optional()
    .isBoolean()
    .withMessage('Allow image uploads must be a boolean')
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

    const updates = {};
    const allowedFields = [
      'viewRate', 'likeRate', 'platformName', 'currency', 'currencySymbol',
      'maxFileSize', 'minPayoutAmount', 'autoPayoutEnabled', 'autoPayoutThreshold',
      'allowVideoUploads', 'allowImageUploads', 'enableEarnings'
    ];

    // Only include allowed fields that are present in request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedSettings = await Settings.updateSettings(updates);

    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      message: 'Server error updating settings'
    });
  }
});

// @route   GET /api/admin/payouts
// @desc    Get users with pending payouts
// @access  Admin
router.get('/payouts', adminAuth, async (req, res) => {
  try {
    const minAmount = parseFloat(req.query.minAmount) || 0;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get users with pending earnings above minimum threshold
    const users = await User.find({
      role: 'user',
      isActive: true,
      pendingEarnings: { $gte: minAmount }
    })
    .select('username email profileImage totalEarnings pendingEarnings paidEarnings postsCount createdAt')
    .sort({ pendingEarnings: -1 })
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments({
      role: 'user',
      isActive: true,
      pendingEarnings: { $gte: minAmount }
    });

    const totalPages = Math.ceil(totalUsers / limit);

    // Calculate total payable amount
    const totalPayableResult = await User.aggregate([
      {
        $match: {
          role: 'user',
          isActive: true,
          pendingEarnings: { $gte: minAmount }
        }
      },
      {
        $group: {
          _id: null,
          totalPayable: { $sum: '$pendingEarnings' }
        }
      }
    ]);

    const totalPayable = totalPayableResult.length > 0 ? totalPayableResult[0].totalPayable : 0;

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      earnings: {
        totalEarnings: user.totalEarnings,
        pendingEarnings: user.pendingEarnings,
        paidEarnings: user.paidEarnings
      },
      postsCount: user.postsCount,
      memberSince: user.createdAt
    }));

    res.json({
      message: 'Payout data retrieved successfully',
      payouts: {
        users: formattedUsers,
        summary: {
          totalPayable,
          totalUsers,
          averagePayable: totalUsers > 0 ? totalPayable / totalUsers : 0
        }
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      message: 'Server error retrieving payout data'
    });
  }
});

// @route   POST /api/admin/payouts/approve
// @desc    Approve payout for a user
// @access  Admin
router.post('/payouts/approve', adminAuth, [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
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

    const { userId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.pendingEarnings < amount) {
      return res.status(400).json({
        message: 'Insufficient pending earnings'
      });
    }

    // Process payout
    user.pendingEarnings -= amount;
    user.paidEarnings += amount;
    await user.save();

    res.json({
      message: 'Payout approved successfully',
      payout: {
        userId: user._id,
        username: user.username,
        amount,
        newPendingBalance: user.pendingEarnings,
        totalPaidOut: user.paidEarnings
      }
    });

  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({
      message: 'Server error processing payout'
    });
  }
});

// @route   POST /api/admin/payouts/bulk-approve
// @desc    Bulk approve payouts for multiple users
// @access  Admin
router.post('/payouts/bulk-approve', adminAuth, [
  body('payouts')
    .isArray({ min: 1 })
    .withMessage('Payouts must be a non-empty array'),
  body('payouts.*.userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('payouts.*.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
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

    const { payouts } = req.body;
    const results = [];

    for (const payout of payouts) {
      try {
        const user = await User.findById(payout.userId);
        
        if (!user) {
          errors.push({
            userId: payout.userId,
            error: 'User not found'
          });
          continue;
        }

        if (user.pendingEarnings < payout.amount) {
          errors.push({
            userId: payout.userId,
            username: user.username,
            error: 'Insufficient pending earnings'
          });
          continue;
        }

        // Process payout
        user.pendingEarnings -= payout.amount;
        user.paidEarnings += payout.amount;
        await user.save();

        results.push({
          userId: user._id,
          username: user.username,
          amount: payout.amount,
          newPendingBalance: user.pendingEarnings,
          totalPaidOut: user.paidEarnings
        });

      } catch (error) {
        errors.push({
          userId: payout.userId,
          error: 'Processing failed'
        });
      }
    }

    res.json({
      message: 'Bulk payout processing completed',
      summary: {
        successful: results.length,
        failed: errors.length,
        totalProcessed: payouts.length
      },
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk approve payouts error:', error);
    res.status(500).json({
      message: 'Server error processing bulk payouts'
    });
  }
});

// @route   PUT /api/admin/users/:userId/status
// @desc    Update user status (activate/deactivate)
// @access  Admin
router.put('/users/:userId/status', adminAuth, [
  body('isActive')
    .isBoolean()
    .withMessage('Status must be a boolean value')
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

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Server error updating user status'
    });
  }
});

// @route   DELETE /api/admin/posts/:postId
// @desc    Delete a post (admin override)
// @access  Admin
router.delete('/posts/:postId', adminAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
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
      message: 'Post deleted successfully by admin',
      deletedPost: {
        id: post._id,
        caption: post.caption.substring(0, 100),
        author: post.author
      }
    });

  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({
      message: 'Server error deleting post'
    });
  }
});

module.exports = router;
    