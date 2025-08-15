const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    tokens: Number,
    model: String,
    processingTime: Number,
    hasRAG: {
      type: Boolean,
      default: false
    },
    ragSources: [String]
  }
});

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  messages: [messageSchema],
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    selectedLLM: {
      type: String,
      enum: ['openai', 'groq', 'mistral', 'deepseek', 'xai', 'huggingface'],
      required: true
    },
    model: String,
    temperature: Number,
    maxTokens: Number
  },
  statistics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    lastMessageTime: {
      type: Date,
      default: Date.now
    }
  },
  tags: [String]
}, {
  timestamps: true
});

// Auto-generate title from first user message if not provided
chatSchema.pre('save', function(next) {
  if (!this.title && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      this.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
  }
  next();
});

// Update statistics when messages are added
chatSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.statistics.totalMessages = this.messages.length;
  this.statistics.lastMessageTime = new Date();
  
  if (message.metadata.tokens) {
    this.statistics.totalTokens += message.metadata.tokens;
  }
  
  return this.save();
};

// Calculate average response time
chatSchema.methods.updateResponseTime = function(processingTime) {
  const currentAvg = this.statistics.averageResponseTime;
  const totalResponses = this.messages.filter(msg => msg.role === 'assistant').length;
  
  this.statistics.averageResponseTime = 
    ((currentAvg * (totalResponses - 1)) + processingTime) / totalResponses;
  
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
