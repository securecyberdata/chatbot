import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Bot, User, Settings, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import VoiceChat from './VoiceChat';
import VoiceSettings from './VoiceSettings';

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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
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

  // Voice-related functions
  const handleVoiceInput = (transcript) => {
    console.log('Voice input received:', transcript);
    setInput(transcript);
    setIsListening(false);
    
    // Auto-send after voice input
    setTimeout(() => {
      handleSend();
    }, 500);
  };

  const handleToggleVoice = (listening, speaking = false) => {
    setIsListening(listening);
    if (speaking !== false) {
      setIsSpeaking(speaking);
    }
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      // Voice mode enabled
      toast.success('Voice mode enabled! Click the microphone to start speaking.');
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Voice mode activated! 🎤 You can now:\n\n• Click the microphone button to speak\n• The AI will respond with both text and voice\n• Adjust voice settings in the voice panel\n\nTry saying something!',
        timestamp: new Date().toISOString(),
        model: 'Voice Assistant'
      };
      setMessages(prev => [...prev, welcomeMessage]);
    } else {
      // Voice mode disabled
      toast.success('Voice mode disabled');
      
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const toggleVoicePanel = () => {
    setShowVoicePanel(!showVoicePanel);
  };

  // Voice input functions
  const startListening = () => {
    if (window.speechSynthesis && isVoiceMode) {
      setIsListening(true);
      // This will be handled by the VoiceChat component
    }
  };

  const stopListening = () => {
    setIsListening(false);
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
      
      // Auto-speak the response if voice mode is enabled
      if (isVoiceMode && response.data.response) {
        setTimeout(() => {
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(response.data.response);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }
        }, 1000); // Small delay to let user read the response first
      }
      
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
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">AI Chat</h2>
                {isVoiceMode && (
                  <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 px-2 py-1 rounded-full">
                    <Volume2 size={12} className="text-green-200" />
                    <span className="text-xs text-green-200 font-medium">VOICE</span>
                  </div>
                )}
              </div>
              <p className="text-blue-100">
                {hasValidApiKey() 
                  ? `Connected to ${getLLMDisplayName(selectedLLM)}` 
                  : 'Demo Mode - Configure API Key in Settings'
                }
                {isVoiceMode && ' • Voice Mode Active'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Voice Mode Toggle */}
            <button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceMode 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
              title={isVoiceMode ? 'Voice Mode: ON' : 'Voice Mode: OFF'}
            >
              {isVoiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            {/* Voice Panel Toggle */}
            <button
              onClick={toggleVoicePanel}
              className={`p-2 rounded-lg transition-colors ${
                showVoicePanel 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
              title="Voice Settings"
            >
              <Mic size={20} />
            </button>
            
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
            {isVoiceMode && (
              <span className="text-sm text-green-700 ml-2 flex items-center space-x-1">
                <Volume2 size={14} />
                Voice Mode Active
              </span>
            )}
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

      {/* Voice Panel */}
      {showVoicePanel && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <VoiceChat
            onVoiceInput={handleVoiceInput}
            onToggleVoice={handleToggleVoice}
            isListening={isListening}
            isSpeaking={isSpeaking}
            currentText={messages[messages.length - 1]?.content}
          />
        </div>
      )}

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
                  <div className="flex items-center justify-between">
                    <span>
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.model && ` • ${message.model}`}
                    </span>
                    {isVoiceMode && message.role === 'assistant' && (
                      <button
                        onClick={() => {
                          if (window.speechSynthesis) {
                            const utterance = new SpeechSynthesisUtterance(message.content);
                            utterance.onstart = () => setIsSpeaking(true);
                            utterance.onend = () => setIsSpeaking(false);
                            utterance.onerror = () => setIsSpeaking(false);
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                        className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded hover:bg-green-200 transition-colors ml-2"
                        title="Listen to this message"
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
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

      {/* Voice Settings Bar */}
      <div className="px-6 py-3 border-t bg-white">
        <VoiceSettings
          isVoiceMode={isVoiceMode}
          onToggleVoiceMode={toggleVoiceMode}
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
          onOpenVoicePanel={toggleVoicePanel}
        />
      </div>

      {/* Input */}
      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasValidApiKey() 
              ? `Type your message here... ${isVoiceMode ? 'Or use voice input!' : '(Connected to real AI)'}` 
              : "Type your message here... (Demo mode - configure API key in Settings)"
            }
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          
          {/* Voice Input Button */}
          {isVoiceMode && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          
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
          <div className="flex items-center space-x-4">
            <p className="text-xs text-gray-500">
              {hasValidApiKey() 
                ? `💡 Connected to ${getLLMDisplayName(selectedLLM)} - Ask anything!`
                : `💡 Demo Tip: Go to Settings to configure your API key for ${getLLMDisplayName(selectedLLM)}`
              }
            </p>
            {isVoiceMode && (
              <div className="flex items-center space-x-2">
                {isListening && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600">Listening...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Speaking...</span>
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  💡 Voice mode: Click mic to speak, AI will respond with voice
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {hasValidApiKey() ? 'Change Settings' : 'Configure API Keys'}
          </button>
        </div>
        
        {/* Voice Mode Help */}
        {isVoiceMode && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 size={16} className="text-green-600" />
              <h4 className="text-sm font-medium text-green-800">Voice Mode Active</h4>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>• Click the microphone button to start voice input</p>
              <p>• Speak clearly and naturally</p>
              <p>• The AI will respond with both text and voice</p>
              <p>• Use the voice panel for advanced settings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
