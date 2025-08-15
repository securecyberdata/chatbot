import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Settings, Phone, PhoneOff, MessageCircle, Headphones, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { faqData, conversationStarters, voiceAgentPersonality } from './FAQData';

const VoiceAgent = () => {
  const navigate = useNavigate();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [input, setInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedSTT, setSelectedSTT] = useState('assemblyai');
  const [selectedTTS, setSelectedTTS] = useState('elevenlabs');
  const [selectedLLM, setSelectedLLM] = useState('openai');
  const [apiKeys, setApiKeys] = useState({});
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs default
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  });

  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // STT/TTS Service configurations
  const sttServices = {
    assemblyai: {
      name: 'AssemblyAI',
      description: 'High-accuracy speech recognition with real-time transcription',
      features: ['Real-time', 'Speaker diarization', 'Custom vocabulary', 'Multi-language']
    },
    deepgram: {
      name: 'Deepgram',
      description: 'Fast, accurate speech recognition with low latency',
      features: ['Low latency', 'Custom models', 'Real-time streaming', 'Multiple languages']
    },
    azure: {
      name: 'Azure Speech',
      description: 'Microsoft\'s comprehensive speech services',
      features: ['Custom models', 'Speaker recognition', 'Translation', 'Enterprise ready']
    },
    google: {
      name: 'Google Speech-to-Text',
      description: 'Google\'s advanced speech recognition',
      features: ['High accuracy', 'Multiple languages', 'Custom models', 'Real-time']
    }
  };

  const ttsServices = {
    elevenlabs: {
      name: 'ElevenLabs',
      description: 'AI-powered voice cloning and natural speech synthesis',
      features: ['Voice cloning', 'Emotion control', 'High quality', 'Custom voices']
    },
    azure: {
      name: 'Azure TTS',
      description: 'Microsoft\'s neural text-to-speech',
      features: ['Neural voices', 'SSML support', 'Multiple languages', 'Custom voices']
    },
    google: {
      name: 'Google Text-to-Speech',
      description: 'Google\'s advanced TTS with WaveNet',
      features: ['WaveNet voices', 'Multiple languages', 'SSML support', 'High quality']
    },
    openai: {
      name: 'OpenAI TTS',
      description: 'OpenAI\'s text-to-speech API',
      features: ['High quality', 'Multiple voices', 'Fast generation', 'Simple API']
    }
  };

  // Load saved settings
  useEffect(() => {
    const loadSettings = () => {
      const savedKeys = localStorage.getItem('ai-chatbot-api-keys');
      const savedLLM = localStorage.getItem('ai-chatbot-selected-llm');
      const savedVoiceSettings = localStorage.getItem('voice-agent-settings');
      
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
      if (savedLLM) {
        setSelectedLLM(savedLLM);
      }
      if (savedVoiceSettings) {
        setVoiceSettings(JSON.parse(savedVoiceSettings));
      }
    };
    
    loadSettings();
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCallActive && callStartTime) {
      intervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive, callStartTime]);

  // Initialize speech recognition
  const initializeSTT = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Use Web Speech API as fallback
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('STT started');
        setIsListening(true);
        toast.success('Listening... Speak now!');
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserInput(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('STT error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log('STT ended');
        setIsListening(false);
      };
    }
  };

  // Start voice call
  const startCall = async () => {
    try {
      setIsCallActive(true);
      setCallStartTime(Date.now());
      setCallDuration(0);
      setConversationHistory([]);
      
      // Initialize STT
      initializeSTT();
      
      // Start listening
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Welcome message
      const welcomeMessage = {
        role: 'assistant',
        content: 'Hello! I\'m your AI voice assistant. I can help you with questions, provide information, or just chat. What would you like to know?',
        timestamp: new Date().toISOString()
      };
      
      setConversationHistory([welcomeMessage]);
      await speakText(welcomeMessage.content);
      
      toast.success('Voice call started!');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start voice call');
      setIsCallActive(false);
    }
  };

  // End voice call
  const endCall = () => {
    setIsCallActive(false);
    setCallStartTime(null);
    setCallDuration(0);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    setIsListening(false);
    setIsSpeaking(false);
    setIsPaused(false);
    
    toast.success('Call ended');
  };

  // Handle user input
  const handleUserInput = async (userInput) => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(userInput);
      
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setConversationHistory(prev => [...prev, aiMessage]);
      setAiResponse(response);
      
      // Speak the response
      await speakText(response);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get AI response from backend
  const getAIResponse = async (userInput) => {
    if (!apiKeys[selectedLLM]) {
      return "I'm sorry, but I don't have access to the AI service right now. Please configure your API keys in the settings.";
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat/ai', {
        message: userInput,
        llmProvider: selectedLLM,
        apiKey: apiKeys[selectedLLM],
        model: selectedLLM === 'openai' ? 'gpt-4' : 'default'
      });
      
      return response.data.response || 'I apologize, but I couldn\'t generate a response at the moment.';
    } catch (error) {
      console.error('AI API error:', error);
      return 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';
    }
  };

  // Text-to-Speech using selected service
  const speakText = async (text) => {
    if (!text.trim()) return;
    
    try {
      setIsSpeaking(true);
      
      switch (selectedTTS) {
        case 'elevenlabs':
          await speakWithElevenLabs(text);
          break;
        case 'azure':
          await speakWithAzure(text);
          break;
        case 'google':
          await speakWithGoogle(text);
          break;
        case 'openai':
          await speakWithOpenAI(text);
          break;
        default:
          // Fallback to Web Speech API
          speakWithWebSpeech(text);
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to speak text');
      setIsSpeaking(false);
    }
  };

  // ElevenLabs TTS
  const speakWithElevenLabs = async (text) => {
    const apiKey = apiKeys.elevenlabs;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );
    
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play();
  };

  // Azure TTS
  const speakWithAzure = async (text) => {
    const apiKey = apiKeys.azure;
    if (!apiKey) {
      throw new Error('Azure Speech API key not configured');
    }
    
    // Azure TTS implementation would go here
    // This is a placeholder for the actual implementation
    speakWithWebSpeech(text);
  };

  // Google TTS
  const speakWithGoogle = async (text) => {
    const apiKey = apiKeys.google;
    if (!apiKey) {
      throw new Error('Google TTS API key not configured');
    }
    
    // Google TTS implementation would go here
    // This is a placeholder for the actual implementation
    speakWithWebSpeech(text);
  };

  // OpenAI TTS
  const speakWithOpenAI = async (text) => {
    const apiKey = apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // OpenAI TTS implementation would go here
    // This is a placeholder for the actual implementation
    speakWithWebSpeech(text);
  };

  // Web Speech API fallback
  const speakWithWebSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Pause/Resume speech
  const toggleSpeech = () => {
    if (window.speechSynthesis) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        toast.success('Speech resumed');
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        toast.success('Speech paused');
      }
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPaused(false);
      setIsSpeaking(false);
      toast.success('Speech stopped');
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Voice Agent</h2>
              <p className="text-purple-100">
                Professional voice interactions with advanced STT/TTS services
              </p>
            </div>
          </div>
          
          {/* Call Controls */}
          <div className="flex items-center space-x-3">
            {!isCallActive ? (
              <button
                onClick={startCall}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                title="Start Voice Call"
              >
                <Phone size={20} />
              </button>
            ) : (
              <button
                onClick={endCall}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="End Call"
              >
                <PhoneOff size={20} />
              </button>
            )}
            
            <button
              onClick={() => navigate('/voice-agent/settings')}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Voice Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Call Status */}
      {isCallActive && (
        <div className="px-6 py-3 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Call Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-mono font-medium text-gray-800">
                  {formatDuration(callDuration)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isListening && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-600">Listening</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Speaking</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
                  <span className="text-xs text-blue-600">Processing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Services & Settings */}
        <div className="w-80 border-r bg-white p-4 space-y-6">
          {/* STT Service Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Speech Recognition</h3>
            <div className="space-y-2">
              {Object.entries(sttServices).map(([key, service]) => (
                <div
                  key={key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSTT === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSTT(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{service.name}</span>
                    {selectedSTT === key && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TTS Service Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Text-to-Speech</h3>
            <div className="space-y-2">
              {Object.entries(ttsServices).map(([key, service]) => (
                <div
                  key={key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTTS === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTTS(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{service.name}</span>
                    {selectedTTS === key && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          {selectedTTS === 'elevenlabs' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Voice Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stability: {voiceSettings.stability}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voiceSettings.stability}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      stability: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Similarity Boost: {voiceSettings.similarityBoost}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voiceSettings.similarityBoost}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      similarityBoost: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Conversation */}
        <div className="flex-1 flex flex-col">
          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         {conversationHistory.length === 0 ? (
               <div className="text-center py-12">
                 <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">
                   Start a Voice Conversation
                 </h3>
                 <p className="text-gray-600 mb-6">
                   Click the phone button to begin talking with your AI voice assistant.
                 </p>
                 
                 {/* Conversation Starters */}
                 <div className="max-w-2xl mx-auto mb-6">
                   <h4 className="text-sm font-medium text-gray-700 mb-3">Try asking about:</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {conversationStarters.slice(0, 8).map((starter, index) => (
                       <button
                         key={index}
                         onClick={() => {
                           setInput(starter);
                           handleUserInput(starter);
                         }}
                         className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-left"
                       >
                         {starter}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 <div className="space-y-2 text-sm text-gray-500">
                   <p>• Ask questions and get voice responses</p>
                   <p>• Have natural conversations</p>
                   <p>• Use professional STT/TTS services</p>
                 </div>
               </div>
             ) : (
              conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

                     {/* Text Input and Speech Controls */}
           {isCallActive && (
             <div className="p-4 border-t bg-white">
               {/* Text Input */}
               <div className="mb-4">
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyPress={(e) => {
                       if (e.key === 'Enter' && input.trim()) {
                         handleUserInput(input.trim());
                         setInput('');
                       }
                     }}
                     placeholder="Type your question here or speak naturally..."
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                   />
                   <button
                     onClick={() => {
                       if (input.trim()) {
                         handleUserInput(input.trim());
                         setInput('');
                       }
                     }}
                     disabled={!input.trim()}
                     className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Send
                   </button>
                 </div>
               </div>
               
               {/* Speech Controls */}
               <div className="flex items-center justify-center space-x-4">
                 <button
                   onClick={toggleSpeech}
                   disabled={!isSpeaking}
                   className={`p-3 rounded-full transition-colors ${
                     isSpeaking
                       ? 'bg-blue-500 text-white hover:bg-blue-600'
                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   }`}
                   title={isPaused ? 'Resume Speech' : 'Pause Speech'}
                 >
                   {isPaused ? <Play size={20} /> : <Pause size={20} />}
                 </button>
                 
                 <button
                   onClick={stopSpeech}
                   disabled={!isSpeaking}
                   className={`p-3 rounded-full transition-colors ${
                     isSpeaking
                       ? 'bg-red-500 text-white hover:bg-red-600'
                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   }`}
                   title="Stop Speech"
                 >
                   <VolumeX size={20} />
                 </button>
               </div>
               
               <div className="text-center mt-3">
                 <p className="text-xs text-gray-500">
                   {isListening ? 'Listening... Speak now!' : 
                    isSpeaking ? 'Speaking...' : 
                    isProcessing ? 'Processing your request...' : 'Ready for voice or text input'}
                 </p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
