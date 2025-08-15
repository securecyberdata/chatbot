import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Brain, Cpu, Sparkles } from 'lucide-react';

const LLMSelector = ({ selectedLLM, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const llmProviders = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5-turbo models',
      icon: Brain,
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      color: 'text-green-400'
    },
    {
      id: 'groq',
      name: 'Groq',
      description: 'Fast Llama and Mixtral models',
      icon: Zap,
      models: ['llama3-8b', 'llama3-70b', 'mixtral-8x7b'],
      color: 'text-blue-400'
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'Large, Medium, Small models',
      icon: Sparkles,
      models: ['mistral-large', 'mistral-medium', 'mistral-small'],
      color: 'text-purple-400'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Chat and Coder models',
      icon: Cpu,
      models: ['deepseek-chat', 'deepseek-coder'],
      color: 'text-orange-400'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: 'Open-source models',
      icon: Brain,
      models: ['llama-2-70b', 'dialo-gpt', 'gpt2'],
      color: 'text-yellow-400'
    }
  ];

  const selectedProvider = llmProviders.find(p => p.id === selectedLLM);
  const IconComponent = selectedProvider ? selectedProvider.icon : Brain;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white hover:border-neon-blue transition-all duration-200"
      >
        <IconComponent className={`w-4 h-4 ${selectedProvider?.color || 'text-neon-blue'}`} />
        <span className="text-sm font-medium">
          {selectedProvider?.name || 'Select LLM'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl z-50"
          >
            <div className="p-2 space-y-1">
              {llmProviders.map((provider) => (
                <motion.button
                  key={provider.id}
                  whileHover={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}
                  onClick={() => {
                    onSelect(provider.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedLLM === provider.id
                      ? 'bg-neon-blue/20 border border-neon-blue/30'
                      : 'hover:bg-dark-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedLLM === provider.id
                      ? 'bg-neon-blue text-white'
                      : 'bg-dark-600 text-dark-300'
                  }`}>
                    <provider.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      selectedLLM === provider.id ? 'text-white' : 'text-white'
                    }`}>
                      {provider.name}
                    </p>
                    <p className="text-sm text-dark-400 mt-1">
                      {provider.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.models.slice(0, 2).map((model) => (
                        <span
                          key={model}
                          className="px-2 py-1 bg-dark-700 text-xs text-dark-300 rounded"
                        >
                          {model}
                        </span>
                      ))}
                      {provider.models.length > 2 && (
                        <span className="px-2 py-1 bg-dark-700 text-xs text-dark-300 rounded">
                          +{provider.models.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LLMSelector;
