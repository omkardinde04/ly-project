import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Type } from 'lucide-react';

interface VoiceInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea';
  placeholder?: string;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  onVoiceStart,
  onVoiceEnd
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      onVoiceStart?.();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(value ? `${value} ${transcript}` : transcript);
      setIsListening(false);
      onVoiceEnd?.();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      onVoiceEnd?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onVoiceEnd?.();
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      onVoiceEnd?.();
    }
  }, [value, onChange, onVoiceStart, onVoiceEnd]);

  const readAloud = () => {
    if (!value) return;
    const utterance = new SpeechSynthesisUtterance(value);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col space-y-3 p-4 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between">
        <label className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManual(!showManual)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Type manually"
          >
            <Type size={24} className={showManual ? "text-blue-600" : "text-gray-500"} />
          </button>
          <button
            onClick={readAloud}
            disabled={!value}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30"
            title="Read aloud"
          >
            <Volume2 size={24} className="text-blue-500" />
          </button>
        </div>
      </div>

      <div className="relative">
        {showManual ? (
          type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none min-h-[150px] leading-relaxed"
              style={{ fontFamily: 'OpenDyslexic, Inter, sans-serif' }}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none leading-relaxed"
              style={{ fontFamily: 'OpenDyslexic, Inter, sans-serif' }}
            />
          )
        ) : (
          <div 
            onClick={startListening}
            className={`cursor-pointer w-full p-8 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 ${
              isListening ? 'bg-red-50 border-red-300 animate-pulse' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={48} className="text-red-500" />
                <span className="text-lg font-bold text-red-600">Listening...</span>
              </>
            ) : (
              <>
                <Mic size={48} className="text-blue-500" />
                <span className="text-lg font-bold text-blue-600">Tap to Speak</span>
                {value && <p className="text-gray-600 text-center text-lg italic mt-2">"{value.substring(0, 50)}{value.length > 50 ? '...' : ''}"</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
