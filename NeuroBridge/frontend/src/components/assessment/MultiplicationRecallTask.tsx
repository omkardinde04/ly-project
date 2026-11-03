import { useState, useRef, useEffect } from 'react';
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
  const startTime = useRef<number>(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, [currentIdx]);

  // Students can change their mind before pressing Next
  const handleSelect = (option: number) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const now = Date.now();
    const metric: MultiplicationMetrics = {
      question_id: QUESTIONS[currentIdx].id,
      time_taken_ms: now - startTime.current,
      is_correct: selectedOption === QUESTIONS[currentIdx].correctAnswer
    };

    const updatedMetrics = [...allMetrics, metric];
    setAllMetrics(updatedMetrics);
    setSelectedOption(null);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(updatedMetrics);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-surface rounded-2xl p-8 border border-border shadow-sm font-sans flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold text-text mb-2">Pop Quiz Activity</h2>
        <p className="text-sm text-text-muted">Tap your answer, then press Next</p>
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
          <div className="text-5xl font-black text-[#1E3A8A] mb-12 tracking-tight">
            {QUESTIONS[currentIdx].display}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {QUESTIONS[currentIdx].options.map((option, i) => {
              const isSelected = selectedOption === option;
              return (
                <motion.button
                  key={i}
                  type="button"
                  // No inline hover colours: framer-motion leaves them behind when the
                  // button is selected under the pointer, hiding the white number.
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(option)}
                  aria-pressed={isSelected}
                  className={`relative py-6 border-2 rounded-2xl text-2xl font-black transition-colors shadow-sm cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
                    isSelected
                      ? 'bg-[#2563EB] border-[#1D4ED8] text-white ring-4 ring-blue-200'
                      : selectedOption !== null
                        ? 'bg-white border-slate-200 text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB]'
                        : 'bg-white border-blue-100 text-[#1A202C] hover:border-[#2563EB] hover:bg-blue-50 hover:text-[#2563EB]'
                  }`}
                >
                  {option}
                  {isSelected && (
                    <span className="absolute top-1.5 right-2 text-sm font-black text-white" aria-hidden>
                      ✓
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedOption !== null && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleNext}
                className="mt-8 flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md transition-all"
              >
                Next <span>→</span>
              </motion.button>
            )}
          </AnimatePresence>
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
