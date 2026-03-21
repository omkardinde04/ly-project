import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

interface Question {
  id: number;
  text: string;
  type: 'frequency' | 'difficulty';
  image?: string;
}

interface AssessmentTestProps {
  onComplete: (score: number) => void;
}

export function AssessmentTest({ onComplete }: AssessmentTestProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(0));

  const questions: Question[] = [
    // Section 1 - Frequency Questions
    { id: 1, text: t.q1, type: 'frequency', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop' },
    { id: 2, text: t.q2, type: 'frequency', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop' },
    { id: 3, text: t.q3, type: 'frequency', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=300&fit=crop' },
    { id: 4, text: t.q4, type: 'frequency', image: 'https://images.unsplash.com/photo-1496307653780-12ee5e26b02d?w=400&h=300&fit=crop' },
    { id: 5, text: t.q5, type: 'frequency', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop' },
    { id: 6, text: t.q6, type: 'frequency', image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop' },
    { id: 7, text: t.q7, type: 'frequency', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop' },
    { id: 8, text: t.q8, type: 'frequency', image: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400&h=300&fit=crop' },
    { id: 9, text: t.q9, type: 'frequency', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop' },
    { id: 10, text: t.q10, type: 'frequency', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
    
    // Section 2 - Difficulty Questions
    { id: 11, text: t.q11, type: 'difficulty', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
    { id: 12, text: t.q12, type: 'difficulty', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop' },
    { id: 13, text: t.q13, type: 'difficulty', image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop' },
    { id: 14, text: t.q14, type: 'difficulty', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
    { id: 15, text: t.q15, type: 'difficulty', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop' },
  ];

  const calculateScore = (questionId: number, answerIndex: number): number => {
    // Section 1 scoring (Q1-Q10)
    if (questionId <= 10) {
      const scores = questionId <= 6 
        ? [3, 6, 9, 12]  // Q1-Q6
        : [1, 2, 3, 4];  // Q7-Q10
      return scores[answerIndex] || 0;
    }
    // Section 2 scoring (Q11-Q15)
    else {
      const scores = [
        [3, 6, 9, 12],  // Q11
        [2, 4, 6, 8],   // Q12
        [2, 4, 6, 8],   // Q13
        [1, 2, 3, 4],   // Q14
        [1, 2, 3, 4],   // Q15
      ];
      return scores[questionId - 11][answerIndex] || 0;
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate total score
      const totalScore = answers.reduce((sum, answer, index) => {
        return sum + calculateScore(index + 1, answer);
      }, 0);
      onComplete(totalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getOptions = () => {
    return questions[currentQuestion].type === 'frequency'
      ? [t.rarely, t.occasionally, t.often, t.mostOfTheTime]
      : [t.easy, t.challenging, t.difficult, t.veryDifficult];
  };

  const currentQ = questions[currentQuestion];
  const options = getOptions();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            {t.questionProgress} {currentQuestion + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
        >
          {/* Audio Control for Question */}
          <div className="mb-6">
            <AudioControl text={currentQ.text} showControls={true} />
          </div>

          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
            {currentQ.text}
          </h2>

          {/* Visual Example */}
          {currentQ.image && (
            <div className="mb-6 rounded-2xl overflow-hidden border-2 border-gray-200">
              <img
                src={currentQ.image}
                alt={`Visual aid for question ${currentQuestion + 1}`}
                className="w-full h-48 md:h-64 object-cover"
              />
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-xl font-semibold text-left transition-all border-2 ${
                  answers[currentQuestion] === index
                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-white bg-white/20'
                      : 'border-gray-400'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  {option}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.previous}
            </button>

            <button
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md ${
                answers[currentQuestion] === undefined
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#4A90E2] text-white hover:bg-blue-600 shadow-blue-500/30'
              }`}
            >
              {currentQuestion === questions.length - 1 ? t.submit : t.next}
              {currentQuestion !== questions.length - 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Take your time. There are no right or wrong answers.
        </p>
      </div>
    </div>
  );
}
