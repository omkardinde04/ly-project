import React from 'react';
import { useDyslexia, type Language } from '../../contexts/DyslexiaContext';
import { useSpotlightReader } from '../../contexts/SpotlightReaderContext';
import { getTranslation } from '../../utils/translations';
import { Volume2, Square, Globe } from 'lucide-react';

interface AudioControlProps {
  text?: string;
  showControls?: boolean;
  overrideLanguage?: Language;
  overrideSpeed?: number;
}

export function AudioControl({
  text = '',
  showControls = true,
  overrideLanguage,
  overrideSpeed,
}: AudioControlProps) {
  const context = useDyslexia();
  const {
    isActive,
    isPlaying,
    startPageReading,
    startTextReading,
    stopReading,
    setSpeed,
  } = useSpotlightReader();

  const language = overrideLanguage || context.language;
  const audioSpeed = overrideSpeed || context.audioSpeed;
  const t = getTranslation(language);

  const handlePlay = () => {
    if (isActive && isPlaying) {
      stopReading();
    } else {
      if (text && text.trim()) {
        startTextReading(text);
      } else {
        startPageReading();
      }
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (!overrideSpeed) {
      context.setAudioSpeed(newSpeed);
    }
    setSpeed(newSpeed);
  };

  const isReading = isActive && isPlaying;

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-2xs border border-blue-100/90 transition-all hover:border-blue-200"
      role="region"
      aria-label="Text to speech narration controls"
    >
      {/* Play/Stop Listen Button */}
      <button
        type="button"
        onClick={handlePlay}
        className={`group flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 ${
          isReading
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 animate-pulse'
            : 'bg-blue-50 text-[#2563EB] hover:bg-blue-100/80 border border-blue-200/80'
        }`}
        aria-label={isReading ? t.stop : t.listen}
      >
        {isReading ? (
          <>
            <Square size={13} className="fill-current" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 size={14} className="group-hover:scale-110 transition-transform" />
            <span>Listen</span>
          </>
        )}
      </button>

      {/* Speed Controls (Optional / Detailed mode) */}
      {showControls && (
        <>
          <div className="h-4 w-px bg-slate-200 mx-0.5" aria-hidden="true" />
          <div className="flex items-center bg-[#F8FAFC] rounded-xl p-0.5 border border-slate-200/80">
            {[0.5, 1.0, 1.5].map((speedVal) => (
              <button
                key={speedVal}
                type="button"
                onClick={() => handleSpeedChange(speedVal)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  audioSpeed === speedVal
                    ? 'bg-white text-[#2563EB] shadow-2xs border border-blue-100'
                    : 'text-[#64748B] hover:text-[#1A202C]'
                }`}
              >
                {speedVal}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5" aria-hidden="true" />
          <div className="flex items-center gap-1 px-1 text-[10px] font-extrabold text-[#64748B] uppercase">
            <Globe size={11} className="text-[#94A3B8]" />
            <span>{language}</span>
          </div>
        </>
      )}
    </div>
  );
}
