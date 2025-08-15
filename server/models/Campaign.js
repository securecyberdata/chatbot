const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['customer-support', 'outbound-sales', 'lead-generation', 'upsell-crosssell', 'technical-support', 'general', 'custom'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  settings: {
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 100,
      max: 4000,
      default: 1000
    },
    enableRAG: {
      type: Boolean,
      default: false
    },
    enableVoice: {
      type: Boolean,
      default: false
    },
    enableEmojis: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    tags: [String],
    industry: String,
    targetAudience: String,
    language: {
      type: String,
      default: 'en'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usage: {
    totalConversations: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Ensure only one default campaign per user
campaignSchema.index({ user: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

// Update lastUsed when campaign is used
campaignSchema.methods.updateUsage = function() {
  this.usage.lastUsed = new Date();
  this.usage.totalConversations += 1;
  return this.save();
};

module.exports = mongoose.model('Campaign', campaignSchema);
