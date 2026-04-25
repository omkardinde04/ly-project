import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CognitiveTaskProps {
  onComplete: (scores: { phonological: number; visual: number; workingMemory: number; processingSpeed: number; orthographic: number; executive: number }) => void;
}

export function CognitiveTaskAssessment({ onComplete }: CognitiveTaskProps) {
  const [currentTask, setCurrentTask] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState({
    phonological: 0,
    visual: 0,
    workingMemory: 0,
    processingSpeed: 0,
    orthographic: 0,
    executive: 0,
  });

  const tasks = [
    { id: 'phonological', name: 'Sound Blending', icon: '🔊' },
    { id: 'visual', name: 'Visual Attention', icon: '👁️' },
    { id: 'workingMemory', name: 'Memory Game', icon: '🧠' },
    { id: 'processingSpeed', name: 'Pattern Match', icon: '⚡' },
    { id: 'orthographic', name: 'Word Recognition', icon: '📝' },
    { id: 'executive', name: 'Time Reading', icon: '🕐' },
  ];

  const handleTaskComplete = (taskId: string, score: number) => {
    if (isLoading) return;
    setIsLoading(true);
    const updatedScores = { ...scores, [taskId]: score };
    setScores(updatedScores);

    setTimeout(() => {
      if (currentTask < tasks.length - 1) {
        setCurrentTask(currentTask + 1);
        setIsLoading(false);
      } else {
        onComplete(updatedScores);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Cognitive Tasks</h2>
          <span className="text-sm font-semibold text-blue-600">
            Task {currentTask + 1} of {tasks.length}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                index === currentTask
                  ? 'bg-blue-500 text-white scale-110 shadow-lg'
                  : index < currentTask
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{task.icon}</span>
              <span className="text-xs font-medium hidden lg:block text-center leading-tight">{task.name}</span>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentTask) / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading next task…</p>
        </div>
      )}

      {/* Current Task */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={currentTask}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentTask === 0 && <PhonologicalTask onComplete={(score) => handleTaskComplete('phonological', score)} />}
            {currentTask === 1 && <VisualAttentionTask onComplete={(score) => handleTaskComplete('visual', score)} />}
            {currentTask === 2 && <WorkingMemoryTask onComplete={(score) => handleTaskComplete('workingMemory', score)} />}
            {currentTask === 3 && <ProcessingSpeedTask onComplete={(score) => handleTaskComplete('processingSpeed', score)} />}
            {currentTask === 4 && <OrthographicTask onComplete={(score) => handleTaskComplete('orthographic', score)} />}
            {currentTask === 5 && <TimedReadingTask onComplete={(score) => handleTaskComplete('executive', score)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: Phonological Awareness (Sound Blending) — unchanged core logic
// ─────────────────────────────────────────────────────────────────────────────
function PhonologicalTask({ onComplete }: { onComplete: (score: number) => void }) {
  const wordSets = [
    { word: 'cat', vowel: 'a' },
    { word: 'bat', vowel: 'a' },
    { word: 'sit', vowel: 'i' },
    { word: 'cup', vowel: 'u' },
    { word: 'log', vowel: 'o' },
    { word: 'bed', vowel: 'e' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const phoneticDistractors: Record<string, string[]> = {
    'cat': ['bat', 'mat'], 'bat': ['cat', 'rat'], 'sit': ['hit', 'fit'],
    'cup': ['mud', 'pup'], 'log': ['dog', 'fog'], 'bed': ['red', 'fed'],
  };

  const generateOptions = (word: string) => {
    const distractors = phoneticDistractors[word] || ['pin', 'tin'];
    return [word, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
  };

  const currentSet = wordSets[currentIndex];
  const [options, setOptions] = useState(() => generateOptions(currentSet.word));

  const playSound = () => {
    if ('speechSynthesis' in window) {
      const letters = currentSet.word.split('').join(' – ');
      const utterance = new SpeechSynthesisUtterance(letters);
      utterance.rate = 0.65;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: string) => {
    if (attempted) return;
    setAttempted(true);
    setSelectedAnswer(selected);
    const isCorrect = selected === currentSet.word;
    const newCorrect = isCorrect ? correct + 1 : correct;

    setTimeout(() => {
      if (currentIndex < wordSets.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        setOptions(generateOptions(wordSets[next].word));
        setAttempted(false);
        setSelectedAnswer(null);
        if (isCorrect) setCorrect(newCorrect);
      } else {
        onComplete(Math.round((newCorrect / wordSets.length) * 100));
      }
    }, 900);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-blue-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl mb-3">🔊</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sound Blending</h3>
        <p className="text-gray-500 text-base font-medium">Listen to the sounds and choose the correct word.</p>
      </div>

      {/* Centered Play button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={playSound}
          disabled={attempted}
          className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-md"
        >
          <span className="text-2xl">▶</span>
          Play Sounds
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {options.map((word, idx) => {
          let style = 'bg-gray-100 hover:bg-blue-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300';
          if (attempted) {
            if (word === currentSet.word) style = 'bg-green-500 text-white border-2 border-green-500';
            else if (word === selectedAnswer) style = 'bg-red-400 text-white border-2 border-red-400';
            else style = 'bg-gray-100 text-gray-400 border-2 border-gray-200';
          }
          return (
            <button key={idx} onClick={() => handleAnswer(word)} disabled={attempted}
              className={`${style} py-6 rounded-2xl font-bold text-xl transition-all disabled:cursor-not-allowed`}>
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-gray-400 font-medium">
        Question {currentIndex + 1} of {wordSets.length}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 2: Visual Attention — Word Match (dyslexia-relevant similar words)
// ─────────────────────────────────────────────────────────────────────────────

interface VisualQuestion {
  id: number;
  target: string;
  options: string[];
  answer: string;
}

// Pre-defined word sets: each has a target + 3 visually confusable distractors
const WORD_SETS: { target: string; distractors: string[] }[] = [
  { target: 'bad',   distractors: ['dad', 'pad', 'bed'] },
  { target: 'was',   distractors: ['saw', 'war', 'has'] },
  { target: 'dog',   distractors: ['bog', 'fog', 'log'] },
  { target: 'on',    distractors: ['no', 'of', 'or'] },
  { target: 'felt',  distractors: ['left', 'melt', 'belt'] },
  { target: 'bun',   distractors: ['dun', 'nun', 'pun'] },
  { target: 'now',   distractors: ['how', 'wow', 'low'] },
  { target: 'pit',   distractors: ['bit', 'sit', 'kit'] },
  { target: 'spot',  distractors: ['stop', 'shop', 'shot'] },
  { target: 'clam',  distractors: ['clan', 'clap', 'clad'] },
];

function generateVisualQuestions(count: number): VisualQuestion[] {
  const shuffled = [...WORD_SETS].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((set, i) => {
    const options = [set.target, ...set.distractors].sort(() => Math.random() - 0.5);
    return { id: i, target: set.target, options, answer: set.target };
  });
}

type VisualPhase = 'answering' | 'correct' | 'wrong' | 'timesup';

function VisualAttentionTask({ onComplete }: { onComplete: (score: number) => void }) {
  const TOTAL_QUESTIONS = 6;
  const TIME_PER_QUESTION = 15;

  const [questions] = useState<VisualQuestion[]>(() => generateVisualQuestions(TOTAL_QUESTIONS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [phase, setPhase] = useState<VisualPhase>('answering');
  const [correctCount, setCorrectCount] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const goNext = useCallback((newCorrect: number) => {
    setTimeout(() => {
      if (currentIdx < TOTAL_QUESTIONS - 1) {
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setPhase('answering');
        setShowSkipConfirm(false);
      } else {
        onComplete(Math.round((newCorrect / TOTAL_QUESTIONS) * 100));
      }
    }, 1500);
  }, [currentIdx, TOTAL_QUESTIONS, onComplete]);

  // Timer tick
  useEffect(() => {
    if (phase !== 'answering') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          setPhase('timesup');
          goNext(correctCount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [currentIdx, phase]);

  const handleAnswer = (word: string) => {
    if (phase !== 'answering') return;
    stopTimer();
    const isCorrect = word === questions[currentIdx].answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);
    setPhase(isCorrect ? 'correct' : 'wrong');
    goNext(newCorrect);
  };

  const handleSkip = () => {
    if (phase !== 'answering') return;
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    stopTimer();
    setShowSkipConfirm(false);
    // Go directly to next question — no 'timesup' phase shown
    if (currentIdx < TOTAL_QUESTIONS - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setPhase('answering');
    } else {
      onComplete(Math.round((correctCount / TOTAL_QUESTIONS) * 100));
    }
  };

  const cancelSkip = () => setShowSkipConfirm(false);

  const q = questions[currentIdx];
  const timerColor = timeLeft > 10 ? 'bg-blue-500' : timeLeft > 5 ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-blue-50 relative min-h-[420px]">
      {/* Timer — Top Right */}
      {phase === 'answering' && (
        <div className={`absolute top-5 right-5 ${timerColor} text-white px-4 py-2 rounded-full font-black text-base shadow-md transition-colors duration-300`}>
          ⏱ {timeLeft}s
        </div>
      )}

      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">👁️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Visual Attention</h3>
        <p className="text-gray-500 text-sm font-medium">Find the word that exactly matches the target.</p>
      </div>

      {/* Phase: Answering */}
      {phase === 'answering' && (
        <>
          {/* Target Word */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Match this word</p>
            <div className="inline-flex items-center justify-center px-10 py-5 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-inner">
              <span className="text-4xl font-black text-blue-700 tracking-widest">{q.target}</span>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8">
            {q.options.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(word)}
                className="py-4 px-6 rounded-2xl bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 text-xl font-black text-gray-700 transition-all shadow-sm hover:scale-105"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-400 font-medium mb-2">
            Question {currentIdx + 1} of {TOTAL_QUESTIONS}
          </div>

          {/* Skip — Bottom Right */}
          {!showSkipConfirm ? (
            <button
              onClick={handleSkip}
              className="absolute bottom-5 right-5 bg-gray-100 hover:bg-gray-200 text-gray-500 px-5 py-2 rounded-full font-semibold text-sm transition-all"
            >
              Skip →
            </button>
          ) : (
            <div className="absolute bottom-4 right-4 bg-white border-2 border-orange-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col items-center gap-3 min-w-[200px]">
              <p className="text-gray-700 font-semibold text-sm text-center">Skip this question?</p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl font-semibold text-sm transition-all"
                >
                  No, stay
                </button>
                <button
                  onClick={confirmSkip}
                  className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 rounded-xl font-bold text-sm transition-all"
                >
                  Yes, skip
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Phase: Correct */}
      {phase === 'correct' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="text-5xl">✅</div>
          <p className="text-green-600 font-black text-2xl">Correct!</p>
          <p className="text-gray-400 text-sm font-medium">Loading next word…</p>
        </div>
      )}

      {/* Phase: Wrong */}
      {phase === 'wrong' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="text-5xl">💙</div>
          <p className="text-purple-600 font-black text-2xl">No worries!</p>
          <p className="text-gray-500 text-sm font-medium">
            The correct answer was: <span className="font-black text-blue-600">"{q.target}"</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">Loading next word…</p>
        </div>
      )}

      {/* Phase: Time's Up */}
      {phase === 'timesup' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="text-5xl">⏰</div>
          <p className="text-orange-500 font-black text-2xl">Time's Up!</p>
          <p className="text-gray-500 text-sm font-medium">Moving to the next word…</p>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// TASK 3: Working Memory — Emoji Grid (Show → Hide → Select)
// ─────────────────────────────────────────────────────────────────────────────
const MEMORY_EMOJIS = ['🍎', '🚗', '🐶', '🌙', '🌸', '⭐', '🍕', '🎈', '🐱', '🍌', '🎸', '🏆'];

type MemoryPhase = 'showing' | 'hidden' | 'selecting' | 'result';

function WorkingMemoryTask({ onComplete }: { onComplete: (score: number) => void }) {
  const SHOW_COUNT = 4;
  const ROUND_COUNT = 3;

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<MemoryPhase>('showing');
  const [targetItems, setTargetItems] = useState<string[]>([]);
  const [optionItems, setOptionItems] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const startRound = useCallback(() => {
    const shuffled = [...MEMORY_EMOJIS].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, SHOW_COUNT);
    // Distractors are emojis NOT in targets
    const distractors = shuffled.slice(SHOW_COUNT, SHOW_COUNT + 4);
    const options = [...targets, ...distractors].sort(() => Math.random() - 0.5);
    setTargetItems(targets);
    setOptionItems(options);
    setSelected([]);
    setPhase('showing');
    setCountdown(3);
  }, []);

  useEffect(() => { startRound(); }, [round]);

  // Countdown while showing
  useEffect(() => {
    if (phase !== 'showing') return;
    if (countdown <= 0) {
      setPhase('hidden');
      setTimeout(() => setPhase('selecting'), 600);
      return;
    }
    const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const toggleSelect = (emoji: string) => {
    if (phase !== 'selecting') return;
    setSelected(prev => {
      if (prev.includes(emoji)) {
        // deselect
        return prev.filter(e => e !== emoji);
      }
      // Cap at SHOW_COUNT selections
      if (prev.length >= SHOW_COUNT) return prev;
      const next = [...prev, emoji];
      // Auto-submit when exactly SHOW_COUNT selected
      if (next.length === SHOW_COUNT) {
        setTimeout(() => submitAnswer(next), 300);
      }
      return next;
    });
  };

  const submitAnswer = (sel: string[]) => {
    // Exact correct matches only (no penalty for unselected)
    const correctCount = sel.filter(e => targetItems.includes(e)).length;
    const roundPct = correctCount / SHOW_COUNT;
    const newTotal = totalScore + roundPct;

    setPhase('result');
    setTimeout(() => {
      if (round < ROUND_COUNT - 1) {
        setTotalScore(newTotal);
        setRound(prev => prev + 1);
      } else {
        onComplete(Math.round((newTotal / ROUND_COUNT) * 100));
      }
    }, 1500);
  };

  const handleSubmit = () => submitAnswer(selected);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-purple-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-4">
        <div className="text-4xl mb-3">🧠</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Memory Game</h3>
        <p className="text-gray-500 text-sm font-medium">Round {round + 1} of {ROUND_COUNT}</p>
      </div>

      {/* Phase: Showing */}
      {phase === 'showing' && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 mb-5 inline-block">
            <p className="text-green-700 font-bold text-sm">
              🟢 Remember these items! Hiding in {countdown}s…
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
            {targetItems.map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200 flex items-center justify-center text-3xl shadow-sm"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Hidden */}
      {phase === 'hidden' && (
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-3 mb-5 inline-block">
            <p className="text-gray-600 font-bold text-sm">🫙 Items hidden — get ready…</p>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
            {targetItems.map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-2xl">
                ❓
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Selecting */}
      {phase === 'selecting' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-3 mb-5 inline-block">
            <p className="text-blue-700 font-bold text-sm">
              👆 Select exactly {SHOW_COUNT} items you remember
              <span className="ml-2 text-purple-600 font-black">{selected.length}/{SHOW_COUNT}</span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
            {optionItems.map((emoji, i) => {
              const isSelected = selected.includes(emoji);
              const isFull = selected.length >= SHOW_COUNT && !isSelected;
              return (
                <button
                  key={i}
                  onClick={() => toggleSelect(emoji)}
                  disabled={isFull}
                  className={`w-16 h-16 rounded-2xl border-2 text-3xl flex items-center justify-center transition-all font-medium ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500 scale-105 shadow-md'
                      : isFull
                      ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          {/* Manual submit still available (e.g. if 4 not reached due to deselect) */}
          <button
            onClick={handleSubmit}
            disabled={selected.length !== SHOW_COUNT}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-10 py-3 rounded-2xl font-bold text-base transition-all shadow-md"
          >
            {selected.length === SHOW_COUNT ? 'Submit ✓' : `Select ${SHOW_COUNT - selected.length} more…`}
          </button>
        </div>
      )}

      {/* Phase: Result */}
      {phase === 'result' && (
        <div className="flex flex-col items-center py-6">
          <div className="text-5xl mb-3">
            {selected.filter(e => targetItems.includes(e)).length === SHOW_COUNT ? '🎉' : selected.filter(e => targetItems.includes(e)).length >= Math.ceil(SHOW_COUNT / 2) ? '👍' : '💪'}
          </div>
          <p className="text-lg font-bold text-gray-800">
            {selected.filter(e => targetItems.includes(e)).length} of {SHOW_COUNT} correct
          </p>
          <p className="text-sm text-gray-500 mt-1">Loading next round…</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 4: Processing Speed — SVG Pattern Match (no blank symbol issues)
// ─────────────────────────────────────────────────────────────────────────────
type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';

interface Pattern {
  shapes: { type: ShapeType; color: string }[];
}

const SHAPE_COLORS = ['#4A90E2', '#E24A4A', '#4AE27A', '#E2A74A', '#9B4AE2'];

function SvgShape({ type, color, size = 40 }: { type: ShapeType; color: string; size?: number }) {
  const s = size;
  if (type === 'circle') return <svg width={s} height={s}><circle cx={s/2} cy={s/2} r={s/2 - 2} fill={color} /></svg>;
  if (type === 'square') return <svg width={s} height={s}><rect x={2} y={2} width={s-4} height={s-4} fill={color} rx={4} /></svg>;
  if (type === 'triangle') return <svg width={s} height={s}><polygon points={`${s/2},2 ${s-2},${s-2} 2,${s-2}`} fill={color} /></svg>;
  if (type === 'diamond') return <svg width={s} height={s}><polygon points={`${s/2},2 ${s-2},${s/2} ${s/2},${s-2} 2,${s/2}`} fill={color} /></svg>;
  // star
  const outerR = s/2 - 2, innerR = s/4;
  const cx = s/2, cy = s/2;
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
  return <svg width={s} height={s}><polygon points={points} fill={color} /></svg>;
}

function generatePattern(): Pattern {
  const types: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'star'];
  const count = 3 + Math.floor(Math.random() * 2); // 3 or 4 shapes
  return {
    shapes: Array.from({ length: count }, () => ({
      type: types[Math.floor(Math.random() * types.length)],
      color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
    })),
  };
}

// Note: patternsMatch retained for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _patternsMatch(a: Pattern, b: Pattern): boolean {
  if (a.shapes.length !== b.shapes.length) return false;
  return a.shapes.every((s, i) => s.type === b.shapes[i].type && s.color === b.shapes[i].color);
}

function PatternDisplay({ pattern }: { pattern: Pattern }) {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {pattern.shapes.map((s, i) => (
        <SvgShape key={i} type={s.type} color={s.color} size={44} />
      ))}
    </div>
  );
}

function ProcessingSpeedTask({ onComplete }: { onComplete: (score: number) => void }) {
  const TOTAL = 8;
  const [loaded, setLoaded] = useState(false);
  const [pairs, setPairs] = useState<{ a: Pattern; b: Pattern; isSame: boolean }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; time: number }[]>([]);
  const startRef = useRef(Date.now());

  // Preload / pre-generate all patterns before starting
  useEffect(() => {
    const generated = Array.from({ length: TOTAL }, () => {
      const a = generatePattern();
      const useSame = Math.random() > 0.5;
      const b = useSame ? { ...a, shapes: [...a.shapes] } : generatePattern();
      return { a, b, isSame: useSame };
    });
    setPairs(generated);
    setTimeout(() => setLoaded(true), 400); // Brief artificial preload
  }, []);

  const handleResponse = (userSaidSame: boolean) => {
    const time = (Date.now() - startRef.current) / 1000;
    const correct = userSaidSame === pairs[currentIdx].isSame;
    const newResponses = [...responses, { correct, time }];

    if (currentIdx < TOTAL - 1) {
      setResponses(newResponses);
      setCurrentIdx(prev => prev + 1);
      startRef.current = Date.now();
    } else {
      const accuracy = newResponses.filter(r => r.correct).length / TOTAL;
      const avgTime = newResponses.reduce((s, r) => s + r.time, 0) / TOTAL;
      const speedBonus = Math.max(0, 30 - avgTime * 3) / 30 * 30;
      onComplete(Math.round(accuracy * 70 + speedBonus));
    }
  };

  if (!loaded) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-2xl mx-auto border-2 border-yellow-50">
        <div className="text-4xl mb-4">⚡</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Pattern Match</h3>
        <div className="animate-pulse text-gray-500 font-medium">Loading patterns…</div>
        <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  const pair = pairs[currentIdx];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-yellow-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">⚡</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Pattern Match</h3>
        <p className="text-gray-500 text-sm font-medium">Are these patterns the SAME or DIFFERENT?</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 flex-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Pattern A</p>
          <PatternDisplay pattern={pair.a} />
        </div>
        <div className="flex items-center justify-center text-2xl font-black text-gray-400">vs</div>
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 flex-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Pattern B</p>
          <PatternDisplay pattern={pair.b} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <button onClick={() => handleResponse(true)}
          className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-md">
          ✓ SAME
        </button>
        <button onClick={() => handleResponse(false)}
          className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-md">
          ✗ DIFFERENT
        </button>
      </div>

      <div className="mt-5 text-xs text-gray-400 font-medium">
        {currentIdx + 1} / {TOTAL}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 5: Orthographic / Word Recognition — Image-Based Homophones
// ─────────────────────────────────────────────────────────────────────────────
interface HomophoneQuestion {
  emoji: string;
  prompt: string;
  correct: string;
  wrong: string;
  hint?: string;
}

const HOMOPHONE_QUESTIONS: HomophoneQuestion[] = [
  { emoji: '🌊', prompt: 'This is the…', correct: 'sea', wrong: 'see', hint: 'the ocean' },
  { emoji: '👁️', prompt: 'This is an…', correct: 'eye', wrong: 'I', hint: 'part of your face' },
  { emoji: '🌸', prompt: 'This is a…', correct: 'flower', wrong: 'flour', hint: 'grows in a garden' },
  { emoji: '🌞', prompt: 'This is the…', correct: 'sun', wrong: 'son', hint: 'shines in the sky' },
  { emoji: '🐝', prompt: 'This is a…', correct: 'bee', wrong: 'be', hint: 'makes honey' },
  { emoji: '🦌', prompt: 'This is a…', correct: 'deer', wrong: 'dear', hint: 'lives in the forest' },
];

function OrthographicTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const q = HOMOPHONE_QUESTIONS[currentIdx];
  const options = Math.random() > 0.5 ? [q.correct, q.wrong] : [q.wrong, q.correct];

  const handleChoice = (word: string) => {
    if (answered) return;
    setAnswered(true);
    setSelected(word);
    const isCorrect = word === q.correct;
    const newCorrect = isCorrect ? correct + 1 : correct;

    setTimeout(() => {
      if (currentIdx < HOMOPHONE_QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setAnswered(false);
        setSelected(null);
        if (isCorrect) setCorrect(newCorrect);
        startRef.current = Date.now();
      } else {
        onComplete(Math.round((newCorrect / HOMOPHONE_QUESTIONS.length) * 100));
      }
    }, 900);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-pink-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Word Recognition</h3>
        <p className="text-gray-500 text-sm font-medium">Look at the image and choose the correct word.</p>
      </div>

      {/* Emoji Image */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-50 to-orange-50 border-2 border-pink-100 flex items-center justify-center text-7xl shadow-inner">
          {q.emoji}
        </div>
        <p className="text-gray-700 font-bold text-lg">{q.prompt}</p>
        {q.hint && <p className="text-xs text-gray-400 italic">({q.hint})</p>}
      </div>

      {/* Two Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {options.map((word, idx) => {
          let style = 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-gray-800';
          if (answered) {
            if (word === q.correct) style = 'bg-green-500 border-2 border-green-500 text-white';
            else if (word === selected) style = 'bg-red-400 border-2 border-red-400 text-white';
            else style = 'bg-gray-100 border-2 border-gray-200 text-gray-400';
          }
          return (
            <button key={idx} onClick={() => handleChoice(word)} disabled={answered}
              className={`${style} py-6 rounded-2xl font-black text-2xl transition-all disabled:cursor-not-allowed shadow-sm`}>
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-gray-400 font-medium">
        Question {currentIdx + 1} of {HOMOPHONE_QUESTIONS.length}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 6: Word Reading Aloud — word shown on screen, voice input checked
// ─────────────────────────────────────────────────────────────────────────────
interface ReadingWord {
  word: string;
  hint: string; // category / helper
  accepted: string[]; // all valid spoken forms
}

const READING_WORDS: ReadingWord[] = [
  { word: 'elephant',     hint: 'Large animal 🐘',       accepted: ['elephant'] },
  { word: 'beautiful',   hint: 'Describing something lovely ✨', accepted: ['beautiful', 'beauty full'] },
  { word: 'necessary',   hint: 'Something that is needed 📌', accepted: ['necessary'] },
  { word: 'rhythm',      hint: 'Beat in music 🎵',        accepted: ['rhythm', 'rithm'] },
  { word: 'Wednesday',   hint: 'Day of the week 📅',      accepted: ['wednesday', 'wensday'] },
  { word: 'library',     hint: 'Place with books 📚',     accepted: ['library', 'libary'] },
  { word: 'February',    hint: 'Month of the year 🗓️',   accepted: ['february', 'febuary'] },
];

// Browser SpeechRecognition — not fully typed in TS lib by default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

type VoicePhase = 'idle' | 'listening' | 'processing' | 'correct' | 'wrong' | 'error';

function TimedReadingTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [speechSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  // Use refs for values read inside setTimeout/callbacks to avoid stale closures
  const correctRef = useRef(0);
  const currentIdxRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);

  const q = READING_WORDS[currentIdx];

  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^a-z]/g, '').trim();

  const checkAnswer = (raw: string): boolean => {
    const norm = normalise(raw);
    // q is looked up from currentIdxRef to avoid stale closure
    return READING_WORDS[currentIdxRef.current].accepted.some(a => normalise(a) === norm);
  };

  const abortRecognition = () => {
    try { recogRef.current?.abort(); } catch (_) { /* ignore */ }
    recogRef.current = null;
  };

  const goNext = (newCorrect: number) => {
    abortRecognition();
    const idx = currentIdxRef.current;
    if (idx < READING_WORDS.length - 1) {
      correctRef.current = newCorrect;
      currentIdxRef.current = idx + 1;
      setCurrentIdx(idx + 1);
      setPhase('idle');
      setTranscript('');
      setFallbackInput('');
    } else {
      onComplete(Math.round((newCorrect / READING_WORDS.length) * 100));
    }
  };

  const handleResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setPhase('correct');
      const newCorrect = correctRef.current + 1;
      setTimeout(() => goNext(newCorrect), 1200);
    } else {
      setPhase('wrong');
      setTimeout(() => goNext(correctRef.current), 1800);
    }
  };

  const startListening = () => {
    abortRecognition();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    recogRef.current = rec;
    setPhase('listening');
    setTranscript('');
    setErrorMsg('');

    let resultReceived = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      resultReceived = true;
      const text = e.results[0][0].transcript as string;
      setTranscript(text);
      setPhase('processing');
      handleResult(checkAnswer(text));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      resultReceived = true; // prevent onend from double-triggering
      const errorCode = e?.error || 'unknown';
      let msg = 'Microphone error. Please try again.';
      if (errorCode === 'not-allowed' || errorCode === 'permission-denied') {
        msg = '🔒 Mic access denied. Please allow microphone in your browser settings.';
      } else if (errorCode === 'no-speech') {
        msg = '🔇 No speech detected. Speak louder or closer to the mic.';
      } else if (errorCode === 'network') {
        msg = '🌐 Network error. Check your connection and try again.';
      }
      setErrorMsg(msg);
      setPhase('error');
    };

    // onend fires when recognition session closes — if no result was captured, reset to idle
    rec.onend = () => {
      if (!resultReceived) {
        setPhase('idle');
      }
      recogRef.current = null;
    };

    try {
      rec.start();
    } catch (err) {
      setErrorMsg('Could not start microphone. Please try again.');
      setPhase('error');
    }
  };

  const handleFallbackSubmit = () => {
    if (!fallbackInput.trim()) return;
    setTranscript(fallbackInput);
    setPhase('processing');
    handleResult(checkAnswer(fallbackInput));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-teal-50">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">📖</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Word Reading</h3>
        <p className="text-gray-500 text-sm font-medium">
          {speechSupported ? 'Read the word aloud — speak clearly into your mic.' : 'Type the word shown below.'}
        </p>
      </div>

      {/* Word Display — big, centered */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-3xl px-10 py-8 shadow-inner">
          <p className="text-5xl font-black text-teal-700 tracking-widest select-none">
            {q.word}
          </p>
        </div>
        <p className="text-sm text-gray-400 font-medium italic">{q.hint}</p>
      </div>

      {/* Voice UI */}
      {speechSupported ? (
        <div className="flex flex-col items-center gap-4">
          {(phase === 'idle' || phase === 'error') && (
            <div className="flex flex-col items-center gap-3">
              {phase === 'error' && errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 max-w-xs text-center">
                  <p className="text-red-600 font-semibold text-sm">{errorMsg}</p>
                </div>
              )}
              <button
                onClick={startListening}
                className="flex items-center gap-3 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-md transition-all"
              >
                <span className="text-2xl">🎤</span>
                {phase === 'error' ? 'Try Again' : 'Tap to Read Aloud'}
              </button>
              {phase === 'idle' && (
                <p className="text-xs text-gray-400 font-medium">Make sure your browser allows microphone access</p>
              )}
            </div>
          )}

          {phase === 'listening' && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl animate-pulse shadow-lg">🎤</div>
                <div className="absolute inset-0 rounded-full bg-teal-300 opacity-40 animate-ping" />
              </div>
              <p className="text-teal-600 font-bold text-sm">Listening — speak now…</p>
              <p className="text-xs text-gray-400">Say the word clearly into your microphone</p>
            </div>
          )}

          {phase === 'processing' && (
            <div className="text-gray-500 font-medium animate-pulse">Checking…</div>
          )}

          {phase === 'correct' && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">✅</div>
              <p className="text-green-600 font-bold text-lg">Correct!</p>
              {transcript && <p className="text-sm text-gray-500 italic">You said: &ldquo;{transcript}&rdquo;</p>}
            </div>
          )}

          {phase === 'wrong' && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">💙</div>
              <p className="text-purple-600 font-bold text-lg">No worries!</p>
              <p className="text-gray-500 text-sm">Moving to the next word…</p>
              {transcript && <p className="text-xs text-gray-400 italic mt-1">You said: &ldquo;{transcript}&rdquo;</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm font-medium">
            ⚠️ Voice not supported — type the word instead.
          </p>
          <input
            type="text"
            value={fallbackInput}
            onChange={e => setFallbackInput(e.target.value)}
            placeholder="Type the word above…"
            className="w-full max-w-xs px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-teal-400 focus:outline-none text-lg font-medium text-center"
            onKeyDown={e => e.key === 'Enter' && handleFallbackSubmit()}
          />
          <button onClick={handleFallbackSubmit}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md">
            Submit
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 font-medium">
        Word {currentIdx + 1} of {READING_WORDS.length}
      </div>
    </div>
  );
}
