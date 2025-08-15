import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Bot, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    groq: '',
    mistral: '',
    deepseek: '',
    xai: '',
    huggingface: ''
  });
  const [showKeys, setShowKeys] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState('openai');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings on component mount and listen for changes
  useEffect(() => {
    // Only load once on mount, don't duplicate
    const loadOnMount = () => {
      try {
        const savedKeys = localStorage.getItem('ai-chatbot-api-keys');
        const savedLLM = localStorage.getItem('ai-chatbot-selected-llm');
        
        if (savedKeys) {
          setApiKeys(JSON.parse(savedKeys));
        }
        if (savedLLM) {
          setSelectedLLM(savedLLM);
        }
        
        console.log('Settings loaded on mount:', { 
          hasKeys: !!savedKeys, 
          selectedLLM: savedLLM,
          apiKeysCount: savedKeys ? Object.keys(JSON.parse(savedKeys)).filter(k => JSON.parse(savedKeys)[k]).length : 0
        });
      } catch (error) {
        console.error('Failed to load saved settings on mount:', error);
      }
    };
    
    loadOnMount();
    
    // Listen for localStorage changes (when settings are saved in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'ai-chatbot-api-keys' || e.key === 'ai-chatbot-selected-llm') {
        console.log('Storage change detected:', e.key);
        handleLoadSaved();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const llmProviders = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo', icon: '🤖' },
    { id: 'groq', name: 'Groq', description: 'Fast inference, Llama models', icon: '⚡' },
    { id: 'mistral', name: 'Mistral AI', description: 'Mistral 7B, Mixtral', icon: '🌪️' },
    { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek models', icon: '🔍' },
    { id: 'xai', name: 'xAI', description: 'Grok models', icon: '🚀' },
    { id: 'huggingface', name: 'Hugging Face', description: 'Open source models', icon: '🤗' }
  ];

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      // In a real app, you'd save to localStorage or backend
      localStorage.setItem('ai-chatbot-api-keys', JSON.stringify(apiKeys));
      localStorage.setItem('ai-chatbot-selected-llm', selectedLLM);
      
      toast.success('Settings saved successfully!');
      setIsSaving(false);
    }, 1000);
  };

  const handleLoadSaved = () => {
    console.log('handleLoadSaved called');
    try {
      const savedKeys = localStorage.getItem('ai-chatbot-api-keys');
      const savedLLM = localStorage.getItem('ai-chatbot-selected-llm');
      
      console.log('Loading saved settings:', { 
        hasKeys: !!savedKeys, 
        selectedLLM: savedLLM,
        apiKeysCount: savedKeys ? Object.keys(JSON.parse(savedKeys)).filter(k => JSON.parse(savedKeys)[k]).length : 0
      });
      
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      }
      if (savedLLM) {
        setSelectedLLM(savedLLM);
      }
      
      toast.success('Saved settings loaded!');
    } catch (error) {
      console.error('Failed to load saved settings:', error);
      toast.error('Failed to load saved settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your AI providers and API keys</p>
      </div>

      {/* LLM Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          Select AI Provider
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {llmProviders.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedLLM === provider.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedLLM(provider.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
              </div>
              {selectedLLM === provider.id && (
                <div className="mt-2 text-blue-600 text-sm font-medium">
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Keys
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showKeys ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              onClick={handleLoadSaved}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Load Saved
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {llmProviders.map((provider) => (
            <div key={provider.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {provider.name} API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={apiKeys[provider.id]}
                  onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                  placeholder={`Enter your ${provider.name} API key`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {apiKeys[provider.id] && (
                  <div className="absolute right-2 top-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">💡 How to get API keys:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>OpenAI:</strong> Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
            <li>• <strong>Groq:</strong> Visit <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a></li>
            <li>• <strong>Mistral:</strong> Visit <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" className="underline">console.mistral.ai</a></li>
            <li>• <strong>DeepSeek:</strong> Visit <a href="https://platform.deepseek.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.deepseek.com</a></li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Save size={20} />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Selected AI Provider:</span>
            <span className="font-medium text-gray-900">
              {llmProviders.find(p => p.id === selectedLLM)?.name || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">API Keys Configured:</span>
            <span className="font-medium text-gray-900">
              {Object.values(apiKeys).filter(key => key.trim()).length} / {llmProviders.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
