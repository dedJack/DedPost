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
    default: 'DedPost'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  currencySymbol: {
    type: String,
    default: '$'
  },
  
  // File upload limits
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024, // 10MB
  },
  allowedImageTypes: [{
    type: String,
    default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }],
  allowedVideoTypes: [{
    type: String,
    default: ['video/mp4', 'video/avi', 'video/mov', 'video/webm']
  }],
  
  // Minimum payout threshold
  minPayoutAmount: {
    type: Number,
    default: 10.00 // $10 minimum payout
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
    default: 100.00 // Auto payout at $100
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update settings
settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);