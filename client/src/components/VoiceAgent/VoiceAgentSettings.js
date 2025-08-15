import React, { useState, useEffect } from 'react';
import { Save, Key, Settings, Headphones, Mic, Volume2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VoiceAgentSettings = () => {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState({
    assemblyai: '',
    deepgram: '',
    azure: '',
    google: '',
    elevenlabs: '',
    openai: ''
  });
  const [selectedServices, setSelectedServices] = useState({
    stt: 'assemblyai',
    tts: 'elevenlabs',
    llm: 'openai'
  });
  const [voiceSettings, setVoiceSettings] = useState({
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedKeys = localStorage.getItem('voice-agent-api-keys');
        const savedServices = localStorage.getItem('voice-agent-services');
        const savedVoiceSettings = localStorage.getItem('voice-agent-voice-settings');
        
        if (savedKeys) {
          setApiKeys(JSON.parse(savedKeys));
        }
        if (savedServices) {
          setSelectedServices(JSON.parse(savedServices));
        }
        if (savedVoiceSettings) {
          setVoiceSettings(JSON.parse(savedVoiceSettings));
        }
      } catch (error) {
        console.error('Failed to load voice agent settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('voice-agent-api-keys', JSON.stringify(apiKeys));
      localStorage.setItem('voice-agent-services', JSON.stringify(selectedServices));
      localStorage.setItem('voice-agent-voice-settings', JSON.stringify(voiceSettings));
      
      // Also save to main chatbot storage for compatibility
      const mainKeys = JSON.parse(localStorage.getItem('ai-chatbot-api-keys') || '{}');
      const updatedKeys = { ...mainKeys, ...apiKeys };
      localStorage.setItem('ai-chatbot-api-keys', JSON.stringify(updatedKeys));
      
      toast.success('Voice Agent settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Test API key
  const testApiKey = async (service) => {
    const apiKey = apiKeys[service];
    if (!apiKey) {
      toast.error(`${service} API key not configured`);
      return;
    }

    try {
      setIsLoading(true);
      
      switch (service) {
        case 'elevenlabs':
          await testElevenLabsKey(apiKey);
          break;
        case 'assemblyai':
          await testAssemblyAIKey(apiKey);
          break;
        case 'deepgram':
          await testDeepgramKey(apiKey);
          break;
        case 'openai':
          await testOpenAIKey(apiKey);
          break;
        default:
          toast.success(`${service} API key configured`);
      }
    } catch (error) {
      console.error(`Error testing ${service} API key:`, error);
      toast.error(`Failed to test ${service} API key`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test ElevenLabs API key
  const testElevenLabsKey = async (apiKey) => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      if (response.ok) {
        const voices = await response.json();
        toast.success(`ElevenLabs connected! ${voices.voices?.length || 0} voices available`);
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      throw new Error('Failed to connect to ElevenLabs');
    }
  };

  // Test AssemblyAI API key
  const testAssemblyAIKey = async (apiKey) => {
    try {
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: 'https://example.com/test.mp3'
        })
      });
      
      if (response.status === 400) {
        // 400 is expected for invalid audio URL, but means API key is valid
        toast.success('AssemblyAI API key is valid!');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else {
        toast.success('AssemblyAI connected!');
      }
    } catch (error) {
      throw new Error('Failed to connect to AssemblyAI');
    }
  };

  // Test Deepgram API key
  const testDeepgramKey = async (apiKey) => {
    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'authorization': `Token ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com/test.mp3'
        })
      });
      
      if (response.status === 400) {
        // 400 is expected for invalid audio URL, but means API key is valid
        toast.success('Deepgram API key is valid!');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else {
        toast.success('Deepgram connected!');
      }
    } catch (error) {
      throw new Error('Failed to connect to Deepgram');
    }
  };

  // Test OpenAI API key
  const testOpenAIKey = async (apiKey) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        const models = await response.json();
        toast.success(`OpenAI connected! ${models.data?.length || 0} models available`);
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      throw new Error('Failed to connect to OpenAI');
    }
  };

  // Service configurations
  const sttServices = {
    assemblyai: {
      name: 'AssemblyAI',
      description: 'High-accuracy speech recognition with real-time transcription',
      features: ['Real-time', 'Speaker diarization', 'Custom vocabulary', 'Multi-language'],
      pricing: 'Pay per minute',
      website: 'https://www.assemblyai.com/'
    },
    deepgram: {
      name: 'Deepgram',
      description: 'Fast, accurate speech recognition with low latency',
      features: ['Low latency', 'Custom models', 'Real-time streaming', 'Multiple languages'],
      pricing: 'Pay per minute',
      website: 'https://deepgram.com/'
    },
    azure: {
      name: 'Azure Speech',
      description: 'Microsoft\'s comprehensive speech services',
      features: ['Custom models', 'Speaker recognition', 'Translation', 'Enterprise ready'],
      pricing: 'Pay per hour',
      website: 'https://azure.microsoft.com/services/cognitive-services/speech-services/'
    },
    google: {
      name: 'Google Speech-to-Text',
      description: 'Google\'s advanced speech recognition',
      features: ['High accuracy', 'Multiple languages', 'Custom models', 'Real-time'],
      pricing: 'Pay per minute',
      website: 'https://cloud.google.com/speech-to-text'
    }
  };

  const ttsServices = {
    elevenlabs: {
      name: 'ElevenLabs',
      description: 'AI-powered voice cloning and natural speech synthesis',
      features: ['Voice cloning', 'Emotion control', 'High quality', 'Custom voices'],
      pricing: 'Pay per character',
      website: 'https://elevenlabs.io/'
    },
    azure: {
      name: 'Azure TTS',
      description: 'Microsoft\'s neural text-to-speech',
      features: ['Neural voices', 'SSML support', 'Multiple languages', 'Custom voices'],
      pricing: 'Pay per character',
      website: 'https://azure.microsoft.com/services/cognitive-services/text-to-speech/'
    },
    google: {
      name: 'Google Text-to-Speech',
      description: 'Google\'s advanced TTS with WaveNet',
      features: ['WaveNet voices', 'Multiple languages', 'SSML support', 'High quality'],
      pricing: 'Pay per character',
      website: 'https://cloud.google.com/text-to-speech'
    },
    openai: {
      name: 'OpenAI TTS',
      description: 'OpenAI\'s text-to-speech API',
      features: ['High quality', 'Multiple voices', 'Fast generation', 'Simple API'],
      pricing: 'Pay per character',
      website: 'https://platform.openai.com/docs/guides/text-to-speech'
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center relative">
        <button
          onClick={() => navigate('/voice-agent')}
          className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Voice Agent</span>
        </button>
        
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Headphones className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Voice Agent Settings</h1>
        </div>
        <p className="text-gray-600">
          Configure your AI voice agent with professional STT/TTS services and LLM providers
        </p>
      </div>

      {/* Service Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STT Service Selection */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mic className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Speech Recognition</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(sttServices).map(([key, service]) => (
              <div
                key={key}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.stt === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedServices(prev => ({ ...prev, stt: key }))}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{service.name}</span>
                  {selectedServices.stt === key && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {service.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{service.pricing}</span>
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Get API Key
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TTS Service Selection */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Volume2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Text-to-Speech</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(ttsServices).map(([key, service]) => (
              <div
                key={key}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.tts === key
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedServices(prev => ({ ...prev, tts: key }))}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{service.name}</span>
                  {selectedServices.tts === key && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {service.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{service.pricing}</span>
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    Get API Key
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Service Selection */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Language Model</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'openai', name: 'OpenAI GPT-4', description: 'Advanced language model with high accuracy' },
              { key: 'groq', name: 'Groq (Fast)', description: 'Ultra-fast inference with low latency' },
              { key: 'mistral', name: 'Mistral AI', description: 'Efficient and powerful language model' },
              { key: 'deepseek', name: 'DeepSeek', description: 'High-performance language model' }
            ].map((service) => (
              <div
                key={service.key}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.llm === service.key
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedServices(prev => ({ ...prev, llm: service.key }))}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{service.name}</span>
                  {selectedServices.llm === service.key && (
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Keys Configuration */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Key className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">API Keys Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STT API Keys */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 text-sm">Speech Recognition</h3>
            {Object.entries(sttServices).map(([key, service]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {service.name}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={apiKeys[key] || ''}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${service.name} API key`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => testApiKey(key)}
                    disabled={!apiKeys[key] || isLoading}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TTS API Keys */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 text-sm">Text-to-Speech</h3>
            {Object.entries(ttsServices).map(([key, service]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {service.name}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={apiKeys[key] || ''}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${service.name} API key`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => testApiKey(key)}
                    disabled={!apiKeys[key] || isLoading}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      {selectedServices.tts === 'elevenlabs' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Volume2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">ElevenLabs Voice Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice ID
              </label>
              <input
                type="text"
                value={voiceSettings.voiceId}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, voiceId: e.target.value }))}
                placeholder="Enter ElevenLabs voice ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find voice IDs in your ElevenLabs dashboard
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <p className="text-xs text-gray-500 mt-1">
                Higher values = more stable voice
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <p className="text-xs text-gray-500 mt-1">
                Higher values = more similar to original voice
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style: {voiceSettings.style}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={voiceSettings.style}
                onChange={(e) => setVoiceSettings(prev => ({
                  ...prev,
                  style: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values = more expressive
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={saveSettings}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">Getting Started</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>1. <strong>Choose Services:</strong> Select your preferred STT and TTS providers from the options above</p>
          <p>2. <strong>Get API Keys:</strong> Visit the service websites to obtain your API keys</p>
          <p>3. <strong>Configure Keys:</strong> Enter your API keys in the configuration section</p>
          <p>4. <strong>Test Connection:</strong> Use the Test buttons to verify your API keys work</p>
          <p>5. <strong>Save Settings:</strong> Click Save to store your configuration</p>
          <p>6. <strong>Start Using:</strong> Navigate to the Voice Agent to begin voice conversations!</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentSettings;
