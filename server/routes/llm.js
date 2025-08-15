const express = require('express');
const LLMService = require('../services/llmService');
const router = express.Router();

// @route   POST /api/llm/chat
// @desc    Generate AI response
// @access  Private
router.post('/chat', async (req, res) => {
  try {
    const { messages, provider, options, campaignId } = req.body;
    
    if (!messages || !provider) {
      return res.status(400).json({ error: 'Messages and provider are required' });
    }

    // Generate response using selected LLM
    const response = await LLMService.generateResponse(provider, messages, options);
    
    res.json({ response });
  } catch (error) {
    console.error('LLM chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// @route   GET /api/llm/providers
// @desc    Get available LLM providers
// @access  Private
router.get('/providers', async (req, res) => {
  try {
    const providers = [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4, GPT-3.5-turbo models',
        models: LLMService.getAvailableModels('openai'),
        isAvailable: true
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'Fast Llama and Mixtral models',
        models: LLMService.getAvailableModels('groq'),
        isAvailable: true
      },
      {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'Large, Medium, Small models',
        models: LLMService.getAvailableModels('mistral'),
        isAvailable: true
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        description: 'Chat and Coder models',
        models: LLMService.getAvailableModels('deepseek'),
        isAvailable: true
      },
      {
        id: 'huggingface',
        name: 'Hugging Face',
        description: 'Open-source models',
        models: LLMService.getAvailableModels('huggingface'),
        isAvailable: true
      }
    ];

    res.json({ providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/llm/models/:provider
// @desc    Get available models for a provider
// @access  Private
router.get('/models/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const models = LLMService.getAvailableModels(provider);
    
    res.json({ provider, models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/llm/estimate
// @desc    Estimate token count and cost
// @access  Private
router.post('/estimate', async (req, res) => {
  try {
    const { text, provider, model } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const tokenCount = LLMService.estimateTokens(text);
    const cost = LLMService.estimateCost(provider, model, tokenCount);
    
    res.json({ 
      tokenCount,
      cost,
      provider,
      model
    });
  } catch (error) {
    console.error('Estimate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
