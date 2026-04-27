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
  readingTrackingCount?: number;
}

interface QuestionMetric {
  questionId: number;
  timeTaken: number;
  selectedOption: number;
  isCorrect: boolean;
  optionChanges: number;
  audioReplays: number;
}

function ReadingTrackingTask({ paragraph, onComplete }: { paragraph: string; onComplete: (trackCount: number) => void }) {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'done'>('idle');
  const [words] = useState(paragraph.split(' '));
  const [hoveredWordIdx, setHoveredWordIdx] = useState<number>(-1);
  const [wordStatuses, setWordStatuses] = useState<('idle' | 'correct' | 'wrong')[]>(Array(words.length).fill('idle'));
  const [trackCount, setTrackCount] = useState(0);
  const [transcript, setTranscript] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
       alert("Speech recognition not supported in this browser. Please click stop to continue.");
       setPhase('listening'); // to allow them to stop
       return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    recogRef.current = rec;

    rec.onresult = (e: any) => {
      let currentTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        currentTranscript += e.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    rec.start();
    setPhase('listening');
  };

  const stopListening = () => {
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch (e) { /* ignore */ }
    }
    setPhase('done');
    onComplete(trackCount);
  };

  const handleMouseEnter = (idx: number) => {
    setHoveredWordIdx(idx);
    setTrackCount(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setHoveredWordIdx(-1);
  };

  useEffect(() => {
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    if (spokenWords.length === 0) return;

    setWordStatuses(() => {
      const newStatuses = Array(words.length).fill('idle');
      let spokenCursor = 0;

      for (let i = 0; i < words.length; i++) {
        if (spokenCursor >= spokenWords.length) break;

        const expectedWord = words[i].toLowerCase().replace(/[^a-z0-9]/g, '');
        const currentSpoken = spokenWords[spokenCursor].replace(/[^a-z0-9]/g, '');

        if (currentSpoken === expectedWord) {
          newStatuses[i] = 'correct';
          spokenCursor++;
        } else {
          // Check if user skipped a word in the text
          let isSkipped = false;
          if (i + 1 < words.length) {
            const nextExpected = words[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '');
            if (currentSpoken === nextExpected) {
              isSkipped = true;
            }
          }

          // Check if user inserted a filler word
          let isFiller = false;
          if (spokenCursor + 1 < spokenWords.length) {
            const nextSpoken = spokenWords[spokenCursor + 1].replace(/[^a-z0-9]/g, '');
            if (nextSpoken === expectedWord) {
              isFiller = true;
            }
          }

          if (isSkipped && !isFiller) {
            newStatuses[i] = 'wrong';
            // Do not advance spokenCursor so the next text word can match this spoken word
          } else if (isFiller && !isSkipped) {
            spokenCursor++;
            i--; // Retry matching this same text word with the next spoken word
          } else {
            // Complete mismatch or ambiguous
            newStatuses[i] = 'wrong';
            spokenCursor++;
          }
        }
      }

      return newStatuses;
    });
  }, [transcript, words]);

  useEffect(() => {
    if (phase === 'listening' && wordStatuses.every(s => s !== 'idle')) {
      stopListening();
    }
  }, [wordStatuses, phase]);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full">
       {phase === 'idle' && (
         <button onClick={startListening} className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 transition-all">
           🎤 Start Mic & Read
         </button>
       )}
       {phase === 'listening' && (
         <div className="flex flex-col items-center mb-6">
           <button onClick={stopListening} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 animate-pulse transition-all">
             🛑 Stop & Finish
           </button>
           <p className="text-sm text-gray-500 mt-2 font-medium">Recording... read the paragraph aloud.</p>
         </div>
       )}
       {phase === 'done' && (
         <div className="mb-6 bg-green-100 text-green-700 px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2">
           ✅ Completed! You tracked words {trackCount} times. Click Next to proceed.
         </div>
       )}

       <div className="text-2xl leading-relaxed max-w-lg text-left p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-inner" style={{ lineHeight: '2.5' }}>
         {words.map((word, idx) => {
           let statusClass = 'text-gray-700';
           if (wordStatuses[idx] === 'correct') statusClass = 'text-green-600 bg-green-100 font-bold';
           if (wordStatuses[idx] === 'wrong') statusClass = 'text-red-600 bg-red-100 font-bold';

           return (
             <span 
               key={idx} 
               onMouseEnter={() => handleMouseEnter(idx)}
               onMouseLeave={handleMouseLeave}
               className={`inline-block px-1 rounded transition-colors duration-200 cursor-default ${
                 hoveredWordIdx === idx ? 'scale-110 shadow-sm border border-yellow-300 bg-yellow-50' : ''
               } ${statusClass}`}
             >
               {word}{' '}
             </span>
           );
         })}
       </div>
    </div>
  );
}

export function AssessmentTest({ onComplete }: AssessmentTestProps) {
  const { language } = useDyslexia();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(partAQuestions.length).fill(-1));
  const [startTime] = useState(Date.now());
  const [optionChanges, setOptionChanges] = useState<number[]>(Array(partAQuestions.length).fill(0));
  const [audioReplays, setAudioReplays] = useState<number[]>(Array(partAQuestions.length).fill(0));
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [trackingMetrics, setTrackingMetrics] = useState({ trackCount: 0 });
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
        readingTrackingCount: trackingMetrics.trackCount,
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

          {currentQ.type === 'reading_tracking' ? (
            <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-auto bg-slate-50 border-b border-slate-100">
               <ReadingTrackingTask paragraph={currentQ.paragraph || ''} onComplete={(tCount) => {
                 setTrackingMetrics({ trackCount: tCount });
                 handleAnswer(0);
               }} />
            </div>
          ) : (
            <>
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
            </>
          )}

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
