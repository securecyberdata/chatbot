import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceChat = ({ onVoiceInput, onToggleVoice, isListening, isSpeaking, currentText }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceList, setVoiceList] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        toast.success('Listening... Speak now!');
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          console.log('Final transcript:', transcript);
          onVoiceInput(transcript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Voice recognition error: ${event.error}`);
      };
      
      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
      };
      
      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      console.warn('Speech recognition not supported');
      toast.error('Speech recognition not supported in this browser');
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setVoiceList(voices);
        
        // Set default voice (preferably English)
        const defaultVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.default
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        ) || voices[0];
        
        setSelectedVoice(defaultVoice);
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    } else {
      console.warn('Speech synthesis not supported');
      toast.error('Speech synthesis not supported in this browser');
    }
  }, [onVoiceInput]);

  // Start listening
  const startListening = () => {
    if (recognition && isSupported) {
      try {
        recognition.start();
        onToggleVoice(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      onToggleVoice(false);
    }
  };

  // Speak text
  const speakText = (text) => {
    if (synthesis && selectedVoice) {
      // Stop any current speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('Speech started');
        onToggleVoice(false, true); // isSpeaking = true
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        onToggleVoice(false, false); // isSpeaking = false
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        toast.error(`Speech error: ${event.error}`);
        onToggleVoice(false, false);
      };
      
      synthesis.speak(utterance);
    }
  };

  // Pause/Resume speech
  const toggleSpeech = () => {
    if (synthesis) {
      if (isPaused) {
        synthesis.resume();
        setIsPaused(false);
        toast.success('Speech resumed');
      } else {
        synthesis.pause();
        setIsPaused(true);
        toast.success('Speech paused');
      }
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsPaused(false);
      onToggleVoice(false, false);
      toast.success('Speech stopped');
    }
  };

  // Auto-speak when text changes
  useEffect(() => {
    if (currentText && isSpeaking) {
      speakText(currentText);
    }
  }, [currentText, isSpeaking]);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Voice features are not supported in this browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Recognition Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <span className="text-sm text-gray-600">
            {isListening ? 'Listening...' : 'Click to speak'}
          </span>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-gray-900">Voice Settings</h3>
        
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice
          </label>
          <select
            value={selectedVoice ? selectedVoice.name : ''}
            onChange={(e) => {
              const voice = voiceList.find(v => v.name === e.target.value);
              setSelectedVoice(voice);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {voiceList.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speech Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speech Rate: {speechRate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Speech Pitch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speech Pitch: {speechPitch}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechPitch}
            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Speech Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleSpeech}
          disabled={!isSpeaking}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isPaused ? 'Resume Speech' : 'Pause Speech'}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          onClick={stopSpeech}
          disabled={!isSpeaking}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Stop Speech"
        >
          <VolumeX size={16} />
        </button>
        <span className="text-sm text-gray-600">
          {isSpeaking ? (isPaused ? 'Paused' : 'Speaking...') : 'Not speaking'}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-medium text-blue-900 mb-2">Voice Commands</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click the microphone to start voice input</li>
          <li>• Speak clearly and naturally</li>
          <li>• The AI will respond with both text and voice</li>
          <li>• Use the controls above to adjust voice settings</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceChat;
