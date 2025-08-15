const OpenAI = require('openai');
const axios = require('axios');

class LLMService {
  constructor() {
    this.providers = {
      openai: null,
      groq: null,
      mistral: null,
      deepseek: null,
      xai: null,
      huggingface: null
    };
  }

  // Initialize OpenAI client
  initializeOpenAI(apiKey) {
    if (apiKey) {
      this.providers.openai = new OpenAI({
        apiKey: apiKey
      });
    }
  }

  // Initialize other providers
  initializeProviders(apiKeys) {
    console.log('=== LLMService: initializeProviders called ===');
    console.log('API Keys received:', Object.keys(apiKeys));
    console.log('OpenAI key present:', !!apiKeys.openai);
    
    if (apiKeys.openai) {
      console.log('Initializing OpenAI with key length:', apiKeys.openai.length);
      this.initializeOpenAI(apiKeys.openai);
      console.log('OpenAI initialized successfully');
    }
    // Initialize other providers as needed
    console.log('=== LLMService: initializeProviders completed ===');
  }

  // Generate response using OpenAI
  async generateOpenAIResponse(messages, options = {}) {
    try {
      if (!this.providers.openai) {
        throw new Error('OpenAI not initialized');
      }

      const {
        model = 'gpt-4',
        temperature = 0.7,
        maxTokens = 1000,
        stream = false
      } = options;

      const response = await this.providers.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream
      });

      return {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  // Generate response using Groq
  async generateGroqResponse(messages, options = {}) {
    try {
      const {
        model = 'llama3-8b-8192',
        temperature = 0.7,
        maxTokens = 1000
      } = options;

      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage,
        provider: 'groq'
      };
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  // Generate response using Mistral
  async generateMistralResponse(messages, options = {}) {
    try {
      const {
        model = 'mistral-large-latest',
        temperature = 0.7,
        maxTokens = 1000
      } = options;

      const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage,
        provider: 'mistral'
      };
    } catch (error) {
      console.error('Mistral API error:', error);
      throw new Error(`Mistral API error: ${error.message}`);
    }
  }

  // Generate response using DeepSeek
  async generateDeepSeekResponse(messages, options = {}) {
    try {
      const {
        model = 'deepseek-chat',
        temperature = 0.7,
        maxTokens = 1000
      } = options;

      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage,
        provider: 'deepseek'
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  // Generate response using Hugging Face
  async generateHuggingFaceResponse(messages, options = {}) {
    try {
      const {
        model = 'meta-llama/Llama-2-70b-chat-hf',
        temperature = 0.7,
        maxTokens = 1000
      } = options;

      const lastMessage = messages[messages.length - 1];
      const prompt = this.formatHuggingFacePrompt(messages);

      const response = await axios.post(`https://api-inference.huggingface.co/models/${model}`, {
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
          return_full_text: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: response.data[0].generated_text,
        model,
        usage: { total_tokens: maxTokens },
        provider: 'huggingface'
      };
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw new Error(`Hugging Face API error: ${error.message}`);
    }
  }

  // Format messages for Hugging Face
  formatHuggingFacePrompt(messages) {
    let prompt = '';
    messages.forEach((message, index) => {
      if (message.role === 'user') {
        prompt += `[INST] ${message.content} [/INST]`;
      } else if (message.role === 'assistant') {
        prompt += ` ${message.content}`;
      }
      if (index < messages.length - 1) {
        prompt += ' ';
      }
    });
    return prompt;
  }

  // Main method to generate response based on selected provider
  async generateResponse(provider, messages, options = {}) {
    console.log('=== LLMService: generateResponse called ===');
    console.log('Provider:', provider);
    console.log('Messages:', messages);
    console.log('Options:', options);
    console.log('Providers initialized:', Object.keys(this.providers).filter(k => this.providers[k]));
    
    const startTime = Date.now();

    try {
      let response;
      
      console.log('=== LLMService: Processing provider ===');
      switch (provider) {
        case 'openai':
          console.log('Calling OpenAI response generator');
          response = await this.generateOpenAIResponse(messages, options);
          break;
        case 'groq':
          console.log('Calling Groq response generator');
          response = await this.generateGroqResponse(messages, options);
          break;
        case 'mistral':
          console.log('Calling Mistral response generator');
          response = await this.generateMistralResponse(messages, options);
          break;
        case 'deepseek':
          console.log('Calling DeepSeek response generator');
          response = await this.generateDeepSeekResponse(messages, options);
          break;
        case 'huggingface':
          console.log('Calling HuggingFace response generator');
          response = await this.generateHuggingFaceResponse(messages, options);
          break;
        default:
          console.log('Unsupported provider:', provider);
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const processingTime = Date.now() - startTime;
      
      console.log('=== LLMService: Response generated successfully ===');
      console.log('Response:', response);
      console.log('Processing time:', processingTime);
      
      const finalResponse = {
        ...response,
        processingTime,
        timestamp: new Date().toISOString()
      };
      
      console.log('Final response:', finalResponse);
      return finalResponse;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('=== LLMService: Error in generateResponse ===');
      console.error('Error:', error);
      console.error('Processing time:', processingTime);
      console.error('Provider:', provider);
      
      throw {
        ...error,
        processingTime,
        provider
      };
    }
  }

  // Get available models for a provider
  getAvailableModels(provider) {
    const models = {
      openai: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'gpt-3.5-turbo'
      ],
      groq: [
        'llama3-8b-8192',
        'llama3-70b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it'
      ],
      mistral: [
        'mistral-large-latest',
        'mistral-medium-latest',
        'mistral-small-latest'
      ],
      deepseek: [
        'deepseek-chat',
        'deepseek-coder'
      ],
      huggingface: [
        'meta-llama/Llama-2-70b-chat-hf',
        'microsoft/DialoGPT-medium',
        'gpt2'
      ]
    };

    return models[provider] || [];
  }

  // Estimate token count (rough estimation)
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  // Estimate cost for OpenAI (approximate)
  estimateCost(provider, model, tokens) {
    const costs = {
      openai: {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
      }
    };

    if (costs[provider] && costs[provider][model]) {
      const cost = costs[provider][model];
      return (tokens * cost.input) / 1000; // Cost per 1K tokens
    }

    return null;
  }
}

module.exports = new LLMService();
