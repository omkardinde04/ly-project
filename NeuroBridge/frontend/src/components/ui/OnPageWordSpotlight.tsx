import { motion, AnimatePresence } from 'framer-motion';
import { useSpotlightReader } from '../../contexts/SpotlightReaderContext';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function OnPageWordSpotlight() {
  const {
    isActive,
    isPlaying,
    isPaused,
    words,
    currentWordIndex,
    activeRect,
    activeWordText,
    speed,
    pauseReading,
    resumeReading,
    stopReading,
    setSpeed,
  } = useSpotlightReader();

  const { isDyslexiaMode } = useDyslexia();

  if (!isActive) return null;

  const totalWords = words.length;
  const progressPercent = totalWords > 0 ? Math.round(((currentWordIndex + 1) / totalWords) * 100) : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
          {/* Active Word Spotlight Box with Full-Screen Darkening Shadow */}
          {activeRect && (
            <motion.div
              initial={false}
              animate={{
                top: Math.max(0, activeRect.top - 4),
                left: Math.max(0, activeRect.left - 6),
                width: Math.max(20, activeRect.width + 12),
                height: Math.max(16, activeRect.height + 8),
              }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 36,
                mass: 0.6,
              }}
              className="fixed rounded-lg z-[9999] flex items-center justify-center pointer-events-none"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow:
                  '0 0 0 9999px rgba(0, 0, 0, 0.78), 0 0 35px 4px rgba(255, 255, 255, 0.95), 0 0 15px rgba(59, 130, 246, 0.6)',
                border: '2px solid #3B82F6',
              }}
            >
              <span
                className={`text-slate-950 font-black tracking-normal select-none leading-none ${
                  isDyslexiaMode ? 'font-dyslexic' : ''
                }`}
                style={{
                  fontSize: activeRect.fontSize || '16px',
                  fontWeight: 900,
                  fontFamily: activeRect.fontFamily || 'inherit',
                }}
              >
                {activeWordText}
              </span>
            </motion.div>
          )}

          {/* Floating Interactive Control Dock at Bottom */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-auto">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-full px-5 py-2.5 flex items-center gap-3 text-white"
            >
              {/* Live Audio Equalizer Wave */}
              <div className="flex items-center gap-1 h-4 pr-1">
                <span
                  className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${
                    isPlaying ? 'animate-[bounce_0.6s_infinite_100ms] h-3.5' : 'h-1.5 opacity-50'
                  }`}
                />
                <span
                  className={`w-1 bg-indigo-400 rounded-full transition-all duration-200 ${
                    isPlaying ? 'animate-[bounce_0.6s_infinite_300ms] h-4' : 'h-1.5 opacity-50'
                  }`}
                />
                <span
                  className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${
                    isPlaying ? 'animate-[bounce_0.6s_infinite_200ms] h-3' : 'h-1.5 opacity-50'
                  }`}
                />
              </div>

              {/* Play / Pause Toggle */}
              <button
                onClick={isPlaying ? pauseReading : resumeReading}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-blue-500 hover:bg-blue-400 text-white'
                }`}
                title={isPlaying ? 'Pause reading (Space)' : 'Resume reading (Space)'}
              >
                {isPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{isPaused ? 'Resume' : 'Play'}</span>
                  </>
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopReading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition cursor-pointer"
                title="Stop reading (Esc)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
                <span>Stop</span>
              </button>

              {/* Vertical Divider */}
              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Speed Controls */}
              <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      speed === spd ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Vertical Divider */}
              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              {/* Word Counter & Progress */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {Math.min(currentWordIndex + 1, totalWords)} / {totalWords}
                </span>
                <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
