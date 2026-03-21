import { useState } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { speakText, stopSpeech } from '../../utils/textToSpeech';

interface AudioControlProps {
  text?: string;
  showControls?: boolean;
}

export function AudioControl({ text = '', showControls = true }: AudioControlProps) {
  const { language, audioSpeed, setAudioSpeed } = useDyslexia();
  const t = getTranslation(language);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      speakText(text, language, audioSpeed);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlaying) {
      stopSpeech();
      speakText(text, language, newSpeed);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-blue-100">
      {/* Play/Pause Button */}
      <button
        onClick={handlePlay}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          isPlaying
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }`}
        aria-label={isPlaying ? t.stop : t.listen}
      >
        {isPlaying ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t.stop}</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="hidden sm:inline">{t.listen}</span>
          </>
        )}
      </button>

      {/* Speed Controls */}
      {showControls && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Speed:</span>
          <button
            onClick={() => handleSpeedChange(0.8)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              audioSpeed === 0.8
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Slow
          </button>
          <button
            onClick={() => handleSpeedChange(1)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              audioSpeed === 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Normal
          </button>
        </div>
      )}

      {/* Language Indicator */}
      <div className="flex items-center gap-1 ml-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-xs font-medium text-gray-600 uppercase">
          {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'MR'}
        </span>
      </div>
    </div>
  );
}
