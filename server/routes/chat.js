const express = require('express');
// const Chat = require('../models/Chat'); // Commented out for demo mode
const LLMService = require('../services/llmService');
const router = express.Router();

// @route   POST /api/chat/ai
// @desc    Send message to AI provider and get response
// @access  Public (for demo mode)
router.post('/ai', async (req, res) => {
  console.log('=== SERVER: Chat AI route hit ===');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  try {
    const { message, llmProvider, apiKey, model } = req.body;

    // Validate input
    console.log('=== SERVER: Validating input ===');
    console.log('Message:', message);
    console.log('LLM Provider:', llmProvider);
    console.log('API Key present:', !!apiKey);
    console.log('Model:', model);
    
    if (!message || !llmProvider || !apiKey) {
      console.log('=== SERVER: Validation failed ===');
      console.log('Missing fields:', {
        message: !message,
        llmProvider: !llmProvider,
        apiKey: !apiKey
      });
      return res.status(400).json({ 
        error: 'Message, LLM provider, and API key are required' 
      });
    }
    
    console.log('=== SERVER: Input validation passed ===');

    try {
      console.log('=== SERVER: Initializing LLM service ===');
      console.log('Provider:', llmProvider);
      console.log('API Key length:', apiKey ? apiKey.length : 0);
      
      // Initialize the specific provider with the API key
      const apiKeys = {};
      apiKeys[llmProvider] = apiKey;
      console.log('API Keys object:', Object.keys(apiKeys));
      
      LLMService.initializeProviders(apiKeys);
      
      console.log('=== SERVER: LLM service initialized successfully ===');
      
      // Format messages for the LLM service
      console.log('=== SERVER: Formatting messages ===');
      const messages = [
        { role: 'user', content: message }
      ];
      console.log('Formatted messages:', messages);

      // Generate response
      console.log('=== SERVER: Calling generateResponse ===');
      const options = { model: model || 'default', temperature: 0.7, maxTokens: 1000 };
      console.log('Options:', options);
      console.log('LLM Provider:', llmProvider);
      
      const response = await LLMService.generateResponse(llmProvider, messages, options);
      
      console.log('=== SERVER: Response received ===');
      console.log('Response:', response);

      console.log('=== SERVER: Sending response ===');
      const responseData = {
        response: response.content || response.text || response,
        provider: llmProvider,
        model: model || 'default',
        timestamp: new Date().toISOString()
      };
      console.log('Response data being sent:', responseData);
      
      res.json(responseData);
      console.log('=== SERVER: Response sent successfully ===');

    } catch (error) {
      console.error('=== SERVER: Inner catch block - AI chat error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Failed to get AI response';
      let statusCode = 500;

      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        errorMessage = 'Invalid API key. Please check your settings.';
        statusCode = 401;
      } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (error.message?.includes('model') || error.message?.includes('not found')) {
        errorMessage = 'Invalid model. Please check your provider settings.';
        statusCode = 400;
      }

      res.status(statusCode).json({ 
        error: errorMessage,
        details: error.message 
      });
    }

  } catch (error) {
    console.error('=== SERVER: Outer catch block - General error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
});

// @route   GET /api/chat
// @desc    Get all chats for user (commented out for demo mode)
// @access  Private
// router.get('/', async (req, res) => {
//   try {
//     const chats = await Chat.find({ user: req.user?.userId })
//       .populate('campaign', 'name category')
//       .sort({ updatedAt: -1 });
//     res.json({ chats });
//   } catch (error) {
//     console.error('Get chats error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// @route   GET /api/chat/:id
// @desc    Get specific chat (commented out for demo mode)
// @access  Private
// router.get('/:id', async (req, res) => {
//   try {
//     const chat = await Chat.findOne({
//       _id: req.params.id,
//       user: req.user?.userId
//     }).populate('campaign', 'name prompt settings');

//     if (!chat) {
//       return res.status(404).json({ error: 'Chat not found' });
//     }

//     res.json({ chat });
//   } catch (error) {
//     console.error('Get chat error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// @route   POST /api/chat
// @desc    Create new chat (commented out for demo mode)
// @access  Private
// router.post('/', async (req, res) => {
//   try {
//     const { campaignId, title, settings } = req.body;
    
//     const chat = new Chat({
//       title,
//       campaign: campaignId,
//       user: req.user?.userId,
//       settings
//     });

//     await chat.save();
//     res.status(201).json({ chat });
//   } catch (error) {
//     console.error('Create chat error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// @route   POST /api/chat/:id/messages
// @desc    Add message to chat (commented out for demo mode)
// @access  Private
// router.post('/:id/messages', async (req, res) => {
//   try {
//     const { role, content, metadata } = req.body;
    
//     const chat = await Chat.findOne({
//       _id: req.params.id,
//       user: req.user?.userId
//     });

//     if (!chat) {
//       return res.status(404,
//         res.json({ error: 'Chat not found' });
//     }

//     const message = {
//       role,
//       content,
//       metadata
//     };

//     await chat.addMessage(message);
//     res.json({ message, chat });
//   } catch (error) {
//     console.error('Add message error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

module.exports = router;
