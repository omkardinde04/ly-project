import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { partAQuestions } from './assessmentQuestions';
import { speakText } from '../../utils/textToSpeech';
import { questionIllustrations } from './AssessmentIllustrations';

interface AssessmentTestProps {
  onComplete: (score: number, metrics: AssessmentMetrics) => void;
}

interface AssessmentMetrics {
  totalTime: number;
  averageTimePerQuestion: number;
  confusionCount: number;
  backtrackCount: number;
  audioReplayCount: number;
  questionMetrics: QuestionMetric[];
}

interface QuestionMetric {
  questionId: number;
  timeTaken: number;
  selectedOption: number;
  isCorrect: boolean;
  optionChanges: number;
  audioReplays: number;
}

export function AssessmentTest({ onComplete }: AssessmentTestProps) {
  const { language } = useDyslexia();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(partAQuestions.length).fill(-1));
  const [startTime] = useState(Date.now());
  const [optionChanges, setOptionChanges] = useState<number[]>(Array(partAQuestions.length).fill(0));
  const [audioReplays, setAudioReplays] = useState<number[]>(Array(partAQuestions.length).fill(0));
  const [backtrackCount, setBacktrackCount] = useState(0);
  const previousQuestionRef = useRef(0);

  const currentQ = partAQuestions[currentQuestion];
  const IllustrationComponent = questionIllustrations[currentQ.id];

  useEffect(() => {
    if (currentQuestion !== previousQuestionRef.current) {
      if (currentQuestion < previousQuestionRef.current) {
        setBacktrackCount(prev => prev + 1);
      }
      previousQuestionRef.current = currentQuestion;
    }
  }, [currentQuestion]);

  const handleAudioPlay = () => {
    speakText(currentQ.audioInstruction || currentQ.instruction, language);
    setAudioReplays(prev => {
      const n = [...prev];
      n[currentQuestion] = (n[currentQuestion] || 0) + 1;
      return n;
    });
  };

  const handleAnswer = (optionIndex: number) => {
    const previousAnswer = answers[currentQuestion];
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
    if (previousAnswer !== -1 && previousAnswer !== optionIndex) {
      setOptionChanges(prev => {
        const n = [...prev];
        n[currentQuestion] = (n[currentQuestion] || 0) + 1;
        return n;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < partAQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;

      const questionMetrics: QuestionMetric[] = answers.map((answer, index) => ({
        questionId: partAQuestions[index].id,
        timeTaken: 10,
        selectedOption: answer,
        isCorrect: answer === (partAQuestions[index] as any).correctAnswer,
        optionChanges: optionChanges[index] || 0,
        audioReplays: audioReplays[index] || 0,
      }));

      const confusionCount = optionChanges.reduce((s, c) => s + (c || 0), 0);
      const totalAudioReplays = audioReplays.reduce((s, r) => s + (r || 0), 0);

      const metrics: AssessmentMetrics = {
        totalTime,
        averageTimePerQuestion: totalTime / partAQuestions.length,
        confusionCount,
        backtrackCount,
        audioReplayCount: totalAudioReplays,
        questionMetrics,
      };

      // Score based on frequency weights (higher weight = more difficulty indicators)
      // Max weight per question = 3; total possible = 15 * 3 = 45
      const totalPossibleScore = partAQuestions.length * 3;
      const userWeightTotal = answers.reduce((acc, answer, index) => {
        const weight = partAQuestions[index].options[answer]?.weight ?? 0;
        return acc + weight;
      }, 0);
      // Invert: lower frequency (lower weight) = higher performance score
      const score = Math.round(((totalPossibleScore - userWeightTotal) / totalPossibleScore) * 100);

      onComplete(score, metrics);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const progress = Math.round(((currentQuestion + 1) / partAQuestions.length) * 100);
  const isAnswered = answers[currentQuestion] !== -1;

  return (
    // Outer shell: fixed viewport height, no scroll
    <div
      className="w-full max-w-3xl mx-auto flex flex-col overflow-hidden"
      style={{ height: '88vh', maxHeight: '860px', minHeight: '500px' }}
    >
      {/* TOP BAR: progress */}
      <div className="flex-none pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
            Q {currentQuestion + 1} of {partAQuestions.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioPlay}
              title="Listen to question"
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            >
              <span className="text-sm">🔊</span>
              <span className="hidden sm:inline">Listen</span>
            </button>
            <span className="text-sm font-bold text-blue-600 tabular-nums">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ANIMATED CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
        >
          {/* QUESTION TEXT */}
          <div className="flex-none px-5 pt-4 pb-3 border-b border-slate-100">
            <p
              className="font-semibold text-gray-800"
              style={{
                fontSize: 'clamp(0.875rem, 1.6vw, 1.05rem)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {currentQ.instruction}
            </p>
            {currentQ.example && (
              <div className="mt-2 inline-block bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-bold font-mono tracking-widest">
                {currentQ.example}
              </div>
            )}
          </div>

          {/* ILLUSTRATION */}
          <div className="flex-1 min-h-0 relative bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center overflow-hidden">
            {/* Difficulty badge */}
            <span className={`absolute top-2 right-2 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              currentQ.difficulty === 'easy'
                ? 'bg-emerald-100 text-emerald-700'
                : currentQ.difficulty === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {currentQ.difficulty === 'easy' ? '★ Easy' : currentQ.difficulty === 'medium' ? '★★ Medium' : '★★★ Hard'}
            </span>

            {IllustrationComponent ? (
              <div className="w-full h-full p-3 flex items-center justify-center">
                <IllustrationComponent />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
                <span className="text-4xl">🎯</span>
                <span className="text-xs font-medium">Visual Context</span>
              </div>
            )}
          </div>

          {/* ANSWER OPTIONS — 4 frequency buttons */}
          <div className="flex-none px-4 pt-3 pb-2 border-t border-slate-100 bg-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswer(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative py-3 px-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-500 shadow-md'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {option.text}
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow text-green-500 text-xs font-black border border-green-200"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex-none px-4 py-3 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <p className="text-xs text-gray-400 font-medium hidden sm:block">
              🌟 No right or wrong answers
            </p>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex items-center gap-1 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                !isAnswered
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95 shadow-blue-400/30'
              }`}
            >
              {currentQuestion === partAQuestions.length - 1 ? 'Finish ✓' : 'Next'}
              {currentQuestion < partAQuestions.length - 1 && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
