import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, FileText, Zap, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { name: 'Total Chats', value: '0', icon: MessageSquare, color: 'bg-blue-500' },
    { name: 'Active Campaigns', value: '1', icon: Bot, color: 'bg-green-500' },
    { name: 'Documents', value: '0', icon: FileText, color: 'bg-purple-500' },
    { name: 'AI Models', value: '6', icon: Zap, color: 'bg-orange-500' },
  ];

  const quickActions = [
    {
      name: 'Start New Chat',
      description: 'Begin a conversation with AI',
      icon: MessageSquare,
      action: () => navigate('/chat'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Upload Document',
      description: 'Add files for RAG processing',
      icon: FileText,
      action: () => navigate('/chat'),
      color: 'bg-green-500 hover:bg-green-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to AI Chatbot!</h1>
        <p className="text-gray-600">You're in demo mode - no login required. Start chatting with AI right away!</p>
      </div>

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Demo Mode Active</h3>
            <p className="text-blue-100">Authentication disabled - you can use all features immediately!</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings size={20} />
            <span>Configure API Keys</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={action.action}
                className={`${action.color} text-white p-6 rounded-lg text-left transition-colors`}
              >
                <div className="flex items-center">
                  <Icon className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">{action.name}</h3>
                    <p className="text-blue-100">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <span className="text-gray-700">Configure your API keys in <button onClick={() => navigate('/settings')} className="text-blue-600 hover:text-blue-800 underline font-medium">Settings</button></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <span className="text-gray-700">Click "Start New Chat" above or go to the Chat page</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <span className="text-gray-700">Type your message and start chatting with AI</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
              <span className="text-gray-700">Upload documents for RAG-powered responses</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Reminder */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">!</div>
          <div>
            <h3 className="font-medium text-yellow-900 mb-2">API Keys Required for Real AI</h3>
            <p className="text-yellow-800 text-sm mb-3">
              To use real AI providers (OpenAI, Groq, Mistral, etc.), you need to configure your API keys in Settings.
              Currently running in demo mode with simulated responses.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
