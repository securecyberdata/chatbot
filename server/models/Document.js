const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  metadata: {
    pageNumber: Number,
    section: String,
    startIndex: Number,
    endIndex: Number
  }
});

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'txt'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  chunks: [chunkSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  metadata: {
    title: String,
    author: String,
    subject: String,
    keywords: [String],
    language: {
      type: String,
      default: 'en'
    },
    pageCount: Number,
    wordCount: Number
  },
  statistics: {
    totalChunks: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    accessCount: {
      type: Number,
      default: 0
    }
  },
  tags: [String]
}, {
  timestamps: true
});

// Update statistics when chunks are added
documentSchema.methods.updateStatistics = function() {
  this.statistics.totalChunks = this.chunks.length;
  this.statistics.lastAccessed = new Date();
  this.statistics.accessCount += 1;
  return this.save();
};

// Add chunk to document
documentSchema.methods.addChunk = function(chunk) {
  this.chunks.push(chunk);
  this.statistics.totalChunks = this.chunks.length;
  return this.save();
};

// Search chunks by similarity (placeholder for vector search)
documentSchema.methods.searchChunks = function(query, limit = 5) {
  // This would typically use a vector database like Pinecone or FAISS
  // For now, return chunks with basic text matching
  const queryLower = query.toLowerCase();
  return this.chunks
    .filter(chunk => chunk.content.toLowerCase().includes(queryLower))
    .slice(0, limit);
};

module.exports = mongoose.model('Document', documentSchema);
