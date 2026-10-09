import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowUp, ArrowDown, Sparkles, FastForward, ArrowRight, ThumbsUp } from 'lucide-react';

type Stage = 'tutorial' | 'assessment' | 'completion';

export function ReadingAssessmentQ1({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('tutorial');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isReading, setIsReading] = useState(false);
  
  // Silent tracking data
  const interactionData = useRef({
    mouseMovements: [] as { x: number; y: number; time: number }[],
    clicks: [] as { time: number; target: string }[],
    wordHovers: [] as { wordIndex: number; word: string; time: number }[],
    startTime: 0,
    endTime: 0
  });

  useEffect(() => {
    if (stage === 'tutorial' && tutorialStep === 0) {
      const timer = setTimeout(() => {
        setTutorialStep(1);
        interactionData.current.startTime = Date.now();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, tutorialStep]);

  const paragraphText = "The quick brown fox jumps over the lazy dog. Reading can be fun when you take your time and practice every day.";
  const words = paragraphText.split(' ');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (stage === 'assessment') {
      interactionData.current.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      });
    }
  };

  const handleWordHover = (wordIndex: number, word: string) => {
    if (stage === 'assessment') {
      interactionData.current.wordHovers.push({
        wordIndex,
        word,
        time: Date.now()
      });
    }
  };

  const handleClick = (targetName: string) => {
    if (stage === 'assessment') {
      interactionData.current.clicks.push({
        time: Date.now(),
        target: targetName
      });
    }
  };

  const handleNextTutorial = () => {
    if (tutorialStep < 3) {
      setTutorialStep(prev => prev + 1);
    } else {
      setStage('assessment');
    }
  };

  const handleStartReading = () => {
    handleClick('start_reading');
    setIsReading(true);
  };

  const handleFinishReading = () => {
    handleClick('finish_reading');
    setIsReading(false);
    setStage('completion');
    interactionData.current.endTime = Date.now();
  };

  return (
    <div 
      className="min-h-full w-full flex flex-col items-center p-4 font-sans h-full"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-4xl flex flex-col h-full gap-3">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="text-[#334155] font-bold text-xs tracking-wider uppercase">
              Question 1 of 10
            </span>
            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-full rounded-full"></div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-[#eef2ff] text-blue-600 px-3 py-1 rounded-lg font-bold text-sm border border-blue-100 shadow-sm">
              10%
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col flex-1 relative overflow-hidden">
          
          <div className="px-6 py-8 flex flex-col flex-1 relative items-center justify-center min-h-[420px]">
            
            {/* 1. Instructions */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl text-center mb-8 flex flex-col items-center"
            >
              <h2 className="text-[11px] sm:text-[12px] font-bold text-[#64748b] leading-relaxed tracking-wide">
                Read the paragraph at your own pace.<br />Take your time and read in whichever way feels comfortable to you.
              </h2>
              
              <AnimatePresence>
                {stage === 'tutorial' && tutorialStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-col items-center z-10 overflow-hidden"
                  >
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-2 drop-shadow-md">
                      <ArrowUp size={40} strokeWidth={2.5} />
                    </motion.div>
                    <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-4 border border-blue-500">
                      <span className="font-medium">Read instructions.</span>
                      <button onClick={handleNextTutorial} title="Got it" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0">
                        <ThumbsUp size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 2. Paragraph Container */}
            <AnimatePresence>
              {(stage !== 'tutorial' || tutorialStep >= 2) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-3xl mx-auto mb-6 flex flex-col items-center"
                >
                  <div className={`w-full px-6 py-6 sm:px-8 rounded-2xl border ${stage === 'tutorial' && tutorialStep === 2 ? 'border-blue-400 shadow-md ring-4 ring-blue-50 bg-blue-50/10' : 'border-gray-200 bg-white'} transition-all duration-300`}>
                    <p style={{ fontSize: '36px', lineHeight: '1.5' }} className="text-[var(--color-text)] font-normal tracking-wide text-center flex flex-wrap justify-center gap-x-4 gap-y-2">
                      {words.map((word, index) => (
                        <span 
                          key={index}
                          onMouseEnter={() => handleWordHover(index, word)}
                          className="hover:bg-blue-100 hover:text-blue-800 transition-colors duration-150 rounded px-1 cursor-text"
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <AnimatePresence>
                    {stage === 'tutorial' && tutorialStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex flex-col items-center z-10 overflow-hidden"
                      >
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-2 drop-shadow-md">
                          <ArrowUp size={40} strokeWidth={2.5} />
                        </motion.div>
                        <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-4 border border-blue-500">
                          <span className="font-medium">Read this paragraph.</span>
                          <button onClick={handleNextTutorial} title="Got it" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0">
                            <ThumbsUp size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Actions */}
            <AnimatePresence>
              {(stage !== 'tutorial' || tutorialStep >= 3) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center w-full z-10 mt-2"
                >
                  <AnimatePresence>
                    {stage === 'tutorial' && tutorialStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 flex flex-col items-center z-20 overflow-hidden"
                      >
                        <div className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-4 border border-blue-500">
                          <span className="font-medium">Click to start.</span>
                          <button onClick={handleNextTutorial} title="Ready to begin" className="bg-white/20 hover:bg-white/30 p-2.5 rounded-full transition-colors shrink-0">
                            <ThumbsUp size={18} />
                          </button>
                        </div>
                        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mt-2 drop-shadow-md">
                          <ArrowDown size={40} strokeWidth={2.5} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isReading ? (
                    <button 
                      onClick={handleStartReading}
                      className={`flex items-center gap-2 px-8 py-3 bg-[#2563eb] hover:bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200/50 transition-all text-[17px] ${stage === 'tutorial' ? 'pointer-events-none opacity-90' : ''}`}
                    >
                      Start Reading
                    </button>
                  ) : (
                    <button 
                      onClick={handleFinishReading}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-200/50 transition-all text-[17px]"
                    >
                      Finish Activity
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer inside card */}
          <div className="px-6 sm:px-8 py-5 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 mt-auto">
            <button 
              disabled 
              className="text-[#94a3b8] bg-[#f1f5f9] cursor-not-allowed flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>
            
            <div className={`hidden sm:flex items-center gap-2 text-[#64748b] font-medium text-sm ${stage === 'completion' ? 'invisible' : ''}`}>
              <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
              Take your time · No wrong answers
            </div>

            <div className="relative flex items-center gap-3">
              <button onClick={() => onComplete?.()} className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium transition-colors text-sm border border-orange-200 text-orange-600 hover:bg-orange-50 bg-white">
                <FastForward size={16} /> Force next
              </button>
              
              {stage === 'completion' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-[115%] flex items-center whitespace-nowrap"
                >
                  <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm mr-2 font-medium border border-emerald-500">
                    Great job! Click Next.
                  </div>
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-emerald-600 mr-2">
                    <ArrowRight size={24} />
                  </motion.div>
                </motion.div>
              )}

              <button 
                onClick={() => onComplete?.()}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full font-bold transition-colors text-sm ${
                  stage === 'completion' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md ring-2 ring-blue-600 ring-offset-2' 
                    : 'bg-[#e2e8f0] text-[#64748b] cursor-not-allowed'
                }`}
                disabled={stage !== 'completion'}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
