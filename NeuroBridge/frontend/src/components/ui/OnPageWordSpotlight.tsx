import { motion, AnimatePresence } from 'framer-motion';
import { useSpotlightReader } from '../../contexts/SpotlightReaderContext';

export function OnPageWordSpotlight() {
  const {
    isActive,
    isPlaying,
    currentParagraphIndex,
    totalParagraphs,
    currentWordIndex,
    totalWords,
    activeWordText,
    speed,
    pauseReading,
    resumeReading,
    stopReading,
    restartReading,
    nextWord,
    prevWord,
    nextParagraph,
    prevParagraph,
    setSpeed,
  } = useSpotlightReader();

  if (!isActive) return null;

  const currentNum = Math.min(currentParagraphIndex + 1, totalParagraphs);
  const currentWordNum = Math.min(currentWordIndex + 1, totalWords);
  const progressPercent = totalWords > 0 ? Math.round((currentWordNum / totalWords) * 100) : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-x-0 bottom-6 z-[9998] pointer-events-none flex justify-center px-4">
          {/* Floating Interactive Word-by-Word Control Dock */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-[0_15px_35px_rgba(0,0,0,0.5)] rounded-2xl p-2.5 sm:px-4 sm:py-2 flex flex-wrap items-center gap-2 text-white max-w-3xl"
          >
            {/* Live Audio Equalizer Wave */}
            <div className="flex items-center gap-0.5 h-4 pr-1">
              <span
                className={`w-1 bg-amber-400 rounded-full transition-all duration-200 ${
                  isPlaying ? 'animate-[bounce_0.6s_infinite_100ms] h-3.5' : 'h-1.5 opacity-50'
                }`}
              />
              <span
                className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${
                  isPlaying ? 'animate-[bounce_0.6s_infinite_300ms] h-4' : 'h-1.5 opacity-50'
                }`}
              />
              <span
                className={`w-1 bg-amber-400 rounded-full transition-all duration-200 ${
                  isPlaying ? 'animate-[bounce_0.6s_infinite_200ms] h-3' : 'h-1.5 opacity-50'
                }`}
              />
            </div>

            {/* Word Spotlight Preview Chip */}
            <div className="flex items-center gap-2 min-w-0 pr-1">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Spotlight • Word {currentWordNum}/{totalWords || 1}
                </span>
                <span className="text-xs font-extrabold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {activeWordText ? `"${activeWordText}"` : `Paragraph ${currentNum}/${totalParagraphs}`}
                </span>
              </div>
            </div>

            {/* Previous Word Button */}
            <button
              onClick={prevWord}
              disabled={currentWordIndex <= 0 && currentParagraphIndex <= 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous word"
              aria-label="Previous word"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={isPlaying ? pauseReading : resumeReading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
              title={isPlaying ? 'Pause reading' : 'Resume reading'}
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
                  <span>Resume</span>
                </>
              )}
            </button>

            {/* Next Word Button */}
            <button
              onClick={nextWord}
              disabled={
                currentWordIndex >= totalWords - 1 && currentParagraphIndex >= totalParagraphs - 1
              }
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next word"
              aria-label="Next word"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>

            {/* Previous Paragraph */}
            <button
              onClick={prevParagraph}
              disabled={currentParagraphIndex <= 0}
              className="hidden sm:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous paragraph"
              aria-label="Previous paragraph"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Next Paragraph */}
            <button
              onClick={nextParagraph}
              disabled={currentParagraphIndex >= totalParagraphs - 1}
              className="hidden sm:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next paragraph"
              aria-label="Next paragraph"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Restart Button */}
            <button
              onClick={restartReading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Restart reading from beginning"
              aria-label="Restart reading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            {/* Stop Button */}
            <button
              onClick={stopReading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition cursor-pointer"
              title="Stop reading (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              <span>Stop</span>
            </button>

            {/* Speed Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 ml-1">
              {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    speed === spd ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-16 bg-slate-800 rounded-full h-1 overflow-hidden mt-1 sm:mt-0">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
