const express = require('express');
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const RAGService = require('../services/ragService');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExt} is not allowed`));
    }
  }
});

// @route   POST /api/files/upload
// @desc    Upload document for RAG
// @access  Private
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { campaignId, tags } = req.body;
    
    // Process document with RAG service
    const processedDoc = await RAGService.processDocument(
      req.file.path,
      path.extname(req.file.originalname).substring(1)
    );

    // Create document record
    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      filePath: req.file.path,
      content: processedDoc.content,
      chunks: processedDoc.chunks,
      user: req.user.userId,
      campaign: campaignId,
      isProcessed: true,
      processingStatus: 'completed',
      metadata: processedDoc.metadata,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await document.save();
    res.status(201).json({ document });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// @route   GET /api/files
// @desc    Get all documents for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId })
      .populate('campaign', 'name')
      .sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // TODO: Remove file from filesystem
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
