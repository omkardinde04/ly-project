import { useState } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { speakText, stopSpeech, changeSpeechSpeed } from '../../utils/textToSpeech';

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
    changeSpeechSpeed(newSpeed);
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3 bg-white/60 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-gray-100/50 transition-all hover:bg-white/80 hover:shadow">
      {/* Play/Pause Button */}
      <button
        onClick={handlePlay}
        className={`group flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-300 ${
          isPlaying
            ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-inner'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm hover:shadow'
        }`}
        aria-label={isPlaying ? t.stop : t.listen}
      >
        {isPlaying ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
            </svg>
            <span className="hidden sm:inline">{t.stop}</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t.listen}</span>
          </>
        )}
      </button>

      {/* Vertical Divider */}
      {showControls && <div className="h-4 w-px bg-gray-200/80 mx-1"></div>}

      {/* Sleek Segmented Speed Controls */}
      {showControls && (
        <div className="flex items-center bg-gray-100/50 rounded-full p-0.5 border border-gray-100">
          <button
            onClick={() => handleSpeedChange(0.5)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
              audioSpeed === 0.5
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            0.5x
          </button>
          <button
            onClick={() => handleSpeedChange(1)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
              audioSpeed === 1
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            1.0x
          </button>
        </div>
      )}

      {/* Vertical Divider */}
      <div className="h-4 w-px bg-gray-200/80 mx-1"></div>

      {/* Compact Language Indicator */}
      <div className="flex items-center gap-1.5 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
          {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'MR'}
        </span>
      </div>
    </div>
  );
}
