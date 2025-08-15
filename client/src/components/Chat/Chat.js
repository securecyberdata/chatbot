import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Bot, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can now connect to real AI providers! How can I help you today?',
      timestamp: new Date().toISOString(),
      model: 'AI Assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState('openai');
  const [apiKeys, setApiKeys] = useState({});
  const messagesEndRef = useRef(null);

  // Load saved LLM selection and API keys
  useEffect(() => {
    const loadSavedSettings = () => {
      const savedLLM = localStorage.getItem('ai-chatbot-selected-llm');
      const savedKeys = localStorage.getItem('ai-chatbot-api-keys');
      
      if (savedLLM) {
        setSelectedLLM(savedLLM);
      }
      if (savedKeys) {
        try {
          setApiKeys(JSON.parse(savedKeys));
        } catch (error) {
          console.error('Failed to parse saved API keys:', error);
        }
      }
    };

    // Load settings on mount
    loadSavedSettings();

    // Listen for localStorage changes (when settings are saved in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'ai-chatbot-api-keys' || e.key === 'ai-chatbot-selected-llm') {
        loadSavedSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getLLMDisplayName = (llmId) => {
    const llmNames = {
      openai: 'OpenAI GPT-4',
      groq: 'Groq (Fast)',
      mistral: 'Mistral AI',
      deepseek: 'DeepSeek',
      xai: 'xAI Grok',
      huggingface: 'Hugging Face'
    };
    return llmNames[llmId] || 'Unknown';
  };

  const hasValidApiKey = () => {
    const selectedKey = apiKeys[selectedLLM];
    return selectedKey && selectedKey.trim().length > 0;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log('=== CHAT: Starting message send ===');
    console.log('Input:', input);
    console.log('Selected LLM:', selectedLLM);
    console.log('API Keys available:', Object.keys(apiKeys).filter(k => apiKeys[k]));
    console.log('Has valid API key:', hasValidApiKey());

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!hasValidApiKey()) {
        // No API key - show demo response
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `I understand you said: "${input}". This is a demo response because no API key is configured for ${getLLMDisplayName(selectedLLM)}. Please go to Settings to configure your API key.`,
            timestamp: new Date().toISOString(),
            model: `${getLLMDisplayName(selectedLLM)} (Demo - No API Key)`
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Make real API call to backend
      console.log('=== CHAT: Making API call ===');
      console.log('URL:', 'http://localhost:5000/api/chat/ai');
      console.log('Request payload:', {
        message: input,
        llmProvider: selectedLLM,
        apiKey: apiKeys[selectedLLM] ? '***' : 'undefined',
        model: selectedLLM === 'openai' ? 'gpt-4' : 'default'
      });
      
      const response = await axios.post('http://localhost:5000/api/chat/ai', {
        message: input,
        llmProvider: selectedLLM,
        apiKey: apiKeys[selectedLLM],
        model: selectedLLM === 'openai' ? 'gpt-4' : 'default'
      });
      
      console.log('=== CHAT: API Response received ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response || 'No response received from AI provider.',
        timestamp: new Date().toISOString(),
        model: `${getLLMDisplayName(selectedLLM)} (Real)`
      };
      
      setMessages(prev => [...prev, aiMessage]);
      toast.success('AI response received!');
      
    } catch (error) {
      console.error('=== CHAT: API Error occurred ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error request config:', error.config);
      
      let errorMessage = 'Failed to get AI response. ';
      if (error.response?.status === 401) {
        errorMessage += 'Invalid API key. Please check your settings.';
      } else if (error.response?.status === 429) {
        errorMessage += 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        model: `${getLLMDisplayName(selectedLLM)} (Error)`
      };
      
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to get AI response');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    toast.success('File upload feature would be implemented here in the full app!');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Chat</h2>
              <p className="text-blue-100">
                {hasValidApiKey() 
                  ? `Connected to ${getLLMDisplayName(selectedLLM)}` 
                  : 'Demo Mode - Configure API Key in Settings'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Configure API Keys & LLM"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleFileUpload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Upload Document"
            >
              <Upload size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${hasValidApiKey() ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className={`text-sm ${hasValidApiKey() ? 'text-green-700' : 'text-yellow-700'}`}>
              {hasValidApiKey() 
                ? `✅ Connected to ${getLLMDisplayName(selectedLLM)}` 
                : `⚠️ Demo Mode - No API key for ${getLLMDisplayName(selectedLLM)}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              <strong>Current LLM:</strong> {getLLMDisplayName(selectedLLM)}
            </span>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : message.model?.includes('Error') 
                    ? 'bg-red-100 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                  {message.model && ` • ${message.model}`}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasValidApiKey() 
              ? "Type your message here... (Connected to real AI)" 
              : "Type your message here... (Demo mode - configure API key in Settings)"
            }
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {hasValidApiKey() 
              ? `💡 Connected to ${getLLMDisplayName(selectedLLM)} - Ask anything!`
              : `💡 Demo Tip: Go to Settings to configure your API key for ${getLLMDisplayName(selectedLLM)}`
            }
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {hasValidApiKey() ? 'Change Settings' : 'Configure API Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
