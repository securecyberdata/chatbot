import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Settings } from 'lucide-react';

const VoiceSettings = ({ 
  isVoiceMode, 
  onToggleVoiceMode, 
  isListening, 
  onStartListening, 
  onStopListening,
  onOpenVoicePanel 
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
      {/* Voice Mode Toggle */}
      <button
        onClick={onToggleVoiceMode}
        className={`p-2 rounded-lg transition-colors ${
          isVoiceMode 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
        title={isVoiceMode ? 'Voice Mode: ON' : 'Voice Mode: OFF'}
      >
        {isVoiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      
      {/* Voice Input Button */}
      {isVoiceMode && (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`p-2 rounded-lg transition-colors ${
            isListening 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          title={isListening ? 'Stop Listening' : 'Start Voice Input'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      )}
      
      {/* Voice Settings */}
      <button
        onClick={onOpenVoicePanel}
        className="p-2 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400 transition-colors"
        title="Voice Settings"
      >
        <Settings size={16} />
      </button>
      
      {/* Status Indicator */}
      {isVoiceMode && (
        <div className="flex items-center space-x-1">
          {isListening && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600">Listening</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSettings;
