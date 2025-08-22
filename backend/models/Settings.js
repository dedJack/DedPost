const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Earning rates
  viewRate: {
    type: Number,
    default: 0.01, // $0.01 per view
    min: 0
  },
  likeRate: {
    type: Number,
    default: 0.05, // $0.05 per like
    min: 0
  },
  
  // Platform settings
  platformName: {
    type: String,
    default: 'DedPost',
    trim: true,
    maxlength: 100
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
    maxlength: 10
  },
  currencySymbol: {
    type: String,
    default: '$',
    trim: true,
    maxlength: 5
  },
  
  // File upload limits (in bytes, but we'll store MB equivalent for easier handling)
  maxFileSize: {
    type: Number,
    default: 10, // 10MB (we'll convert to bytes in the backend when needed)
    min: 1,
    max: 100
  },
  allowedImageTypes: {
    type: [String],
    default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  allowedVideoTypes: {
    type: [String],
    default: ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
  },
  
  minPayoutAmount: {
    type: Number,
    default: 10.00, 
    min: 0
  },
  
  // Feature toggles
  allowVideoUploads: {
    type: Boolean,
    default: true
  },
  allowImageUploads: {
    type: Boolean,
    default: true
  },
  enableEarnings: {
    type: Boolean,
    default: true
  },
  
  // Auto payout settings
  autoPayoutEnabled: {
    type: Boolean,
    default: false
  },
  autoPayoutThreshold: {
    type: Number,
    default: 100.00, // Auto payout at $100
    min: 0
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  try {
    let settings = await this.findOne();
    if (!settings) {
      console.log('No settings found, creating default settings...');
      settings = await this.create({});
      console.log('Default settings created:', settings);
    }
    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

// Update settings
settingsSchema.statics.updateSettings = async function(updates) {
  try {
    let settings = await this.findOne();
    if (!settings) {
      console.log('No settings found, creating new with updates:', updates);
      settings = await this.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    return settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Add a method to convert maxFileSize to bytes when needed
settingsSchema.methods.getMaxFileSizeInBytes = function() {
  return this.maxFileSize * 1024 * 1024; 
};

// Validation middleware
settingsSchema.pre('save', function(next) {
  if (this.viewRate < 0) this.viewRate = 0;
  if (this.likeRate < 0) this.likeRate = 0;
  if (this.minPayoutAmount < 0) this.minPayoutAmount = 0;
  if (this.autoPayoutThreshold < 0) this.autoPayoutThreshold = 0;
  if (this.maxFileSize < 1) this.maxFileSize = 1;
  if (this.maxFileSize > 100) this.maxFileSize = 100;
  
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);