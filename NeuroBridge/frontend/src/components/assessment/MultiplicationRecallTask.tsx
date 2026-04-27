import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiplicationQuestion {
  id: string;
  display: string;
  options: number[];
  correctAnswer: number;
}

export interface MultiplicationMetrics {
  question_id: string;
  time_taken_ms: number;
  is_correct: boolean;
}

interface MultiplicationRecallTaskProps {
  onComplete: (metrics: MultiplicationMetrics[]) => void;
}

const QUESTIONS: MultiplicationQuestion[] = [
  { id: 'q1', display: '6 × 7 = ?', options: [42, 36, 48, 40], correctAnswer: 42 },
  { id: 'q2', display: '5 × __ = 25', options: [3, 5, 6, 4], correctAnswer: 5 },
  { id: 'q3', display: '8 × 3 = ?', options: [24, 18, 32, 21], correctAnswer: 24 },
  { id: 'q4', display: '__ × 4 = 16', options: [2, 4, 6, 8], correctAnswer: 4 },
  { id: 'q5', display: '3, 6, 9, __, 15', options: [10, 12, 18, 21], correctAnswer: 12 },
];

export function MultiplicationRecallTask({ onComplete }: MultiplicationRecallTaskProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [allMetrics, setAllMetrics] = useState<MultiplicationMetrics[]>([]);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, [currentIdx]);

  const handleSelect = (option: number) => {
    const now = Date.now();
    const metric: MultiplicationMetrics = {
      question_id: QUESTIONS[currentIdx].id,
      time_taken_ms: now - startTime.current,
      is_correct: option === QUESTIONS[currentIdx].correctAnswer
    };

    const updatedMetrics = [...allMetrics, metric];
    setAllMetrics(updatedMetrics);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(updatedMetrics);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl p-8 border border-blue-50 shadow-sm font-sans flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Pop Quiz Activity</h2>
        <p className="text-sm text-gray-500">Tap the correct answer</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="w-full flex flex-col items-center"
        >
          <div className="text-5xl font-black text-[#4DA6FF] mb-12 tracking-tight">
            {QUESTIONS[currentIdx].display}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {QUESTIONS[currentIdx].options.map((option, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, backgroundColor: '#F0F7FF' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(option)}
                className="py-6 bg-[#F8FBFF] border-2 border-[#EBF4FF] rounded-2xl text-2xl font-bold text-gray-700 hover:border-[#4DA6FF] hover:text-[#4DA6FF] transition-all shadow-sm"
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex gap-2">
        {QUESTIONS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'w-8 bg-[#4DA6FF]' : i < currentIdx ? 'w-2 bg-blue-200' : 'w-2 bg-gray-100'}`} 
          />
        ))}
      </div>
    </div>
  );
}
