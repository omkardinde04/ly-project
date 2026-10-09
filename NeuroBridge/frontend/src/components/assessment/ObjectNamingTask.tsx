import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ThumbsUp } from 'lucide-react';
import { questionIllustrations } from './AssessmentIllustrations';

export function ObjectNamingTask({ question, currentAnswer, onComplete }: { question: any, currentAnswer?: number, onComplete: (answerIndex: number) => void }) {
  const [stage, setStage] = useState<'tutorial' | 'assessment'>('tutorial');
  const [tutorialStep, setTutorialStep] = useState(1);
  const IllustrationComponent = questionIllustrations[question.id];

  const handleNextTutorial = () => {
    if (tutorialStep < 3) {
      setTutorialStep(prev => prev + 1);
    } else {
      setStage('assessment');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-white relative p-4 h-full overflow-hidden w-full">
      <div className="w-full max-w-2xl flex flex-col items-center h-full gap-4 pt-4 sm:pt-8">
        
        {/* 1. Instruction */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center flex flex-col items-center"
        >
          <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1A202C] leading-snug tracking-wide">
            {question.instruction}
          </h2>
          
          <AnimatePresence>
            {stage === 'tutorial' && tutorialStep === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex flex-col items-center z-10 overflow-hidden"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-1.5 drop-shadow-md">
                  <ArrowUp size={36} strokeWidth={2.5} />
                </motion.div>
                <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-3 border border-blue-500">
                  <span className="font-medium">Read instructions.</span>
                  <button onClick={handleNextTutorial} title="Got it" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0">
                    <ThumbsUp size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 2. Image */}
        <AnimatePresence>
          {(stage !== 'tutorial' || tutorialStep >= 2) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div 
                className={`w-full max-w-xl bg-gradient-to-br from-[#F8FAFC] to-blue-50/40 rounded-2xl border ${stage === 'tutorial' && tutorialStep === 2 ? 'border-blue-400 shadow-md ring-4 ring-blue-50 bg-blue-50/10' : 'border-blue-100'} overflow-hidden flex items-center justify-center p-2 transition-all duration-300`}
                style={{ height: '220px', minHeight: '220px' }}
              >
                {IllustrationComponent && <IllustrationComponent question={question} />}
              </div>
              
              <AnimatePresence>
                {stage === 'tutorial' && tutorialStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-col items-center z-10 overflow-hidden"
                  >
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-1.5 drop-shadow-md">
                      <ArrowUp size={36} strokeWidth={2.5} />
                    </motion.div>
                    <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-3 border border-blue-500">
                      <span className="font-medium">Look at the image.</span>
                      <button onClick={handleNextTutorial} title="Got it" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0">
                        <ThumbsUp size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Options */}
        <AnimatePresence>
          {(stage !== 'tutorial' || tutorialStep >= 3) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <AnimatePresence>
                {stage === 'tutorial' && tutorialStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 flex flex-col items-center z-20 overflow-hidden"
                  >
                    <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-3 border border-blue-500">
                      <span className="font-medium">Select your answer.</span>
                      <button onClick={handleNextTutorial} title="Ready" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0">
                        <ThumbsUp size={18} />
                      </button>
                    </div>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mt-1.5 drop-shadow-md">
                      <ArrowDown size={36} strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {question.options.map((option: any, index: number) => {
                  const isSelected = stage === 'assessment' && currentAnswer === index;
                  return (
                  <motion.button
                    key={option.id}
                    type="button"
                    disabled={stage === 'tutorial'}
                    onClick={() => stage === 'assessment' && onComplete(index)}
                    whileHover={stage === 'assessment' && !isSelected ? { scale: 1.02 } : {}}
                    whileTap={stage === 'assessment' && !isSelected ? { scale: 0.98 } : {}}
                    className={`relative py-4 px-4 rounded-2xl text-[14px] sm:text-[15px] font-bold transition-all border text-center ${
                      stage === 'tutorial' 
                        ? 'opacity-90 cursor-not-allowed bg-[#F8FAFC] text-[#1A202C] border-slate-200' 
                        : isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs cursor-default'
                        : 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 bg-[#F8FAFC] text-[#1A202C] border-slate-200'
                    }`}
                  >
                    <span>{option.text}</span>
                  </motion.button>
                )})}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
