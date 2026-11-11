import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpeechService } from '../../services/speechService';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useSpeechCapture, micStatusText } from './useSpeechCapture';
import { MicButton, LevelBars, TimeBar, MicErrorBox } from './MicControls';
import { calculatePercentCorrect, type MeasuredCognitiveProfile } from '../../utils/assessmentScoring';

interface CognitiveTaskProps {
  /** A task that couldn't be measured (e.g. no microphone) is left out of the profile. */
  onComplete: (scores: MeasuredCognitiveProfile) => void;
}

export function CognitiveTaskAssessment({ onComplete }: CognitiveTaskProps) {
  const [currentTask, setCurrentTask] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<MeasuredCognitiveProfile>({});

  const tasks = [
    { id: 'phonological', name: 'Sound Blending', icon: '🔊' },
    { id: 'visual', name: 'Visual Attention', icon: '👁️' },
    { id: 'workingMemory', name: 'Memory Game', icon: '🧠' },
    { id: 'processingSpeed', name: 'Pattern Match', icon: '⚡' },
    { id: 'orthographic', name: 'Word Recognition', icon: '📝' },
    { id: 'executive', name: 'Time Reading', icon: '🕐' },
  ];

  const handleTaskComplete = (taskId: keyof MeasuredCognitiveProfile, score: number | null, taskIndex = currentTask) => {
    if (taskIndex !== currentTask) return;
    if (isLoading) return;
    setIsLoading(true);
    const updatedScores: MeasuredCognitiveProfile = { ...scores };
    if (score === null) delete updatedScores[taskId]; // not measured: leave it out
    else updatedScores[taskId] = score;
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text">Cognitive Tasks</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-600">
              Task {currentTask + 1} of {tasks.length}
            </span>
          </div>
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
                  : 'bg-gray-100 text-text-muted'
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
          <p className="mt-4 text-text-muted text-lg font-medium">Loading next task…</p>
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
            {currentTask === 0 && <PhonologicalTask onComplete={(score) => handleTaskComplete('phonological', score, 0)} />}
            {currentTask === 1 && <VisualAttentionTask onComplete={(score) => handleTaskComplete('visual', score, 1)} />}
            {currentTask === 2 && <WorkingMemoryTask onComplete={(score) => handleTaskComplete('workingMemory', score, 2)} />}
            {currentTask === 3 && <ProcessingSpeedTask onComplete={(score) => handleTaskComplete('processingSpeed', score, 3)} />}
            {currentTask === 4 && <OrthographicTask onComplete={(score) => handleTaskComplete('orthographic', score, 4)} />}
            {currentTask === 5 && <TimedReadingTask onComplete={(score) => handleTaskComplete('executive', score, 5)} />}
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

  const playSound = async () => {
    // Add spaces and periods to make it pronounce individual letters distinctively
    const letters = currentSet.word.split('').join(' . ');
    const speech = getSpeechService();
    try {
      await speech.speak(letters, { speed: 0.65 });
    } catch (e) {
      console.error('Speech synthesis failed:', e);
    }
  };

  const handleAnswer = (selected: string) => {
    if (attempted) return;
    const speech = getSpeechService();
    speech.stopSpeaking(); // Stop any currently playing sounds
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
        onComplete(calculatePercentCorrect(newCorrect, wordSets.length));
      }
    }, 900);
  };

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-border">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl mb-3">🔊</div>
        <h3 className="text-2xl font-bold text-text mb-2">Sound Blending</h3>
        <p className="text-text-muted text-base font-medium">Listen to the sounds and choose the correct word.</p>
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
          let style = 'bg-gray-100 hover:bg-blue-50 text-text border-2 border-border hover:border-blue-300';
          if (attempted) {
            if (word === currentSet.word) style = 'bg-green-500 text-white border-2 border-green-500';
            else if (word === selectedAnswer) style = 'bg-red-400 text-white border-2 border-red-400';
            else style = 'bg-gray-100 text-text-muted border-2 border-border';
          }
          return (
            <button key={idx} onClick={() => handleAnswer(word)} disabled={attempted}
              className={`${style} py-6 rounded-2xl font-bold text-xl transition-all disabled:cursor-not-allowed`}>
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-text-muted font-medium">
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

type VisualPhase = 'showing' | 'answering';

function VisualAttentionTask({ onComplete }: { onComplete: (score: number) => void }) {
  const TOTAL_QUESTIONS = 6;
  const TIME_PER_QUESTION = 15;
  const TARGET_DISPLAY_MS = 5000;

  const [questions] = useState<VisualQuestion[]>(() => generateVisualQuestions(TOTAL_QUESTIONS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [phase, setPhase] = useState<VisualPhase>('showing');
  const [correctCount, setCorrectCount] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(TIME_PER_QUESTION);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const goNext = useCallback((newCorrect: number) => {
    if (currentIdx < TOTAL_QUESTIONS - 1) {
      setCurrentIdx(prev => prev + 1);
      timeLeftRef.current = TIME_PER_QUESTION;
      setTimeLeft(TIME_PER_QUESTION);
      setPhase('showing');
      setShowSkipConfirm(false);
    } else {
      onComplete(calculatePercentCorrect(newCorrect, TOTAL_QUESTIONS));
    }
  }, [currentIdx, TOTAL_QUESTIONS, onComplete]);

  useEffect(() => {
    if (phase !== 'showing') return;
    const timeout = setTimeout(() => setPhase('answering'), TARGET_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [currentIdx, phase]);

  // Timer tick
  useEffect(() => {
    if (phase !== 'answering') return;
    timerRef.current = setInterval(() => {
      const nextTime = Math.max(0, timeLeftRef.current - 1);
      timeLeftRef.current = nextTime;
      setTimeLeft(nextTime);
      if (nextTime === 0) {
        stopTimer();
        goNext(correctCount);
      }
    }, 1000);
    return () => stopTimer();
  }, [currentIdx, phase, correctCount, goNext]);

  const handleAnswer = (word: string) => {
    if (phase !== 'answering') return;
    stopTimer();
    const isCorrect = word === questions[currentIdx].answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);
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
      timeLeftRef.current = TIME_PER_QUESTION;
      setTimeLeft(TIME_PER_QUESTION);
      setPhase('showing');
    } else {
      onComplete(calculatePercentCorrect(correctCount, TOTAL_QUESTIONS));
    }
  };

  const cancelSkip = () => setShowSkipConfirm(false);

  const q = questions[currentIdx];
  const timerColor = timeLeft > 10 ? 'bg-blue-500' : timeLeft > 5 ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-border relative min-h-[420px]">
      {/* Timer — Top Right */}
      {phase === 'answering' && (
        <div className={`absolute top-5 right-5 ${timerColor} text-white px-4 py-2 rounded-full font-black text-base shadow-md transition-colors duration-300`}>
          ⏱ {timeLeft}s
        </div>
      )}

      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">👁️</div>
        <h3 className="text-2xl font-bold text-text mb-1">Visual Attention</h3>
        <p className="text-text-muted text-sm font-medium">Remember the word, then select its match. Skipped or timed-out answers count as incorrect.</p>
      </div>

      {/* Show the target for 5 seconds before flashing options */}
      {phase === 'showing' && (
        <motion.div
          key={`showing-${currentIdx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center py-6 gap-4"
          aria-live="polite"
        >
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold">Study this word carefully</p>
          <div className="inline-flex items-center justify-center px-12 py-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-blue-700 tracking-widest">{q.target}</span>
          </div>

          {/* 5-second countdown progress bar */}
          <div className="w-48 h-2 bg-blue-100 rounded-full overflow-hidden mt-3 shadow-inner">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <span className="text-xs font-semibold text-text-muted">Options will appear in 5s</span>
        </motion.div>
      )}

      {/* Phase: Answering — Flashes options after 5s */}
      {phase === 'answering' && (
        <motion.div
          key={`answering-${currentIdx}`}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3 mt-4">Which word did you see?</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8 mt-6">
            {q.options.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(word)}
                className="py-4 px-6 rounded-2xl bg-gray-50 hover:bg-blue-50 active:scale-95 border-2 border-border hover:border-blue-400 text-xl font-black text-text transition-all shadow-sm hover:scale-105 cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="text-xs text-text-muted font-medium mb-2">
            Question {currentIdx + 1} of {TOTAL_QUESTIONS}
          </div>

          {/* Skip — Bottom Right */}
          {!showSkipConfirm ? (
            <button
              onClick={handleSkip}
              className="absolute bottom-5 right-5 bg-gray-100 hover:bg-gray-200 text-text-muted px-5 py-2 rounded-full font-semibold text-sm transition-all"
            >
              Skip →
            </button>
          ) : (
            <div className="absolute bottom-4 right-4 bg-surface border-2 border-orange-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col items-center gap-3 min-w-[200px]">
              <p className="text-text font-semibold text-sm text-center">Skip this question?</p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={cancelSkip}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-text-muted py-2 rounded-xl font-semibold text-sm transition-all"
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
        </motion.div>
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
    const roundPct = calculatePercentCorrect(correctCount, SHOW_COUNT);
    const newTotal = totalScore + roundPct;

    setPhase('result');
    setTimeout(() => {
      if (round < ROUND_COUNT - 1) {
        setTotalScore(newTotal);
        setRound(prev => prev + 1);
      } else {
        onComplete(Math.round(newTotal / ROUND_COUNT));
      }
    }, 1500);
  };

  const handleSubmit = () => submitAnswer(selected);

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-purple-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-4">
        <div className="text-4xl mb-3">🧠</div>
        <h3 className="text-2xl font-bold text-text mb-1">Memory Game</h3>
        <p className="text-text-muted text-sm font-medium">Round {round + 1} of {ROUND_COUNT}</p>
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
          <div className="bg-gray-50 border border-border rounded-2xl px-6 py-3 mb-5 inline-block">
            <p className="text-text-muted font-bold text-sm">🫙 Items hidden — get ready…</p>
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
                      ? 'bg-gray-50 border-border opacity-40 cursor-not-allowed'
                      : 'bg-gray-100 border-border hover:border-blue-300'
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
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-text-muted text-white px-10 py-3 rounded-2xl font-bold text-base transition-all shadow-md"
          >
            {selected.length === SHOW_COUNT ? 'Submit ✓' : `Select ${SHOW_COUNT - selected.length} more…`}
          </button>
        </div>
      )}

      {/* Phase: Result */}
      {phase === 'result' && (
        <div className="flex flex-col items-center py-6">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-lg font-bold text-text">Nice work! Keep it up!</p>
          <p className="text-sm text-text-muted mt-1">Loading next round…</p>
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
  const [responses, setResponses] = useState<{ correct: boolean }[]>([]);

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
    const correct = userSaidSame === pairs[currentIdx].isSame;
    const newResponses = [...responses, { correct }];

    if (currentIdx < TOTAL - 1) {
      setResponses(newResponses);
      setCurrentIdx(prev => prev + 1);
    } else {
      const correctCount = newResponses.filter(response => response.correct).length;
      onComplete(calculatePercentCorrect(correctCount, TOTAL));
    }
  };

  if (!loaded) {
    return (
      <div className="bg-surface rounded-3xl shadow-xl p-12 text-center max-w-2xl mx-auto border-2 border-yellow-50">
        <div className="text-4xl mb-4">⚡</div>
        <h3 className="text-2xl font-bold text-text mb-3">Pattern Match</h3>
        <div className="animate-pulse text-text-muted font-medium">Loading patterns…</div>
        <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  const pair = pairs[currentIdx];

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-yellow-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">⚡</div>
        <h3 className="text-2xl font-bold text-text mb-1">Pattern Match</h3>
        <p className="text-text-muted text-sm font-medium">Are these patterns the SAME or DIFFERENT?</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-border flex-1">
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-3">Pattern A</p>
          <PatternDisplay pattern={pair.a} />
        </div>
        <div className="flex items-center justify-center text-2xl font-black text-text-muted">vs</div>
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-border flex-1">
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-3">Pattern B</p>
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

      <div className="mt-5 text-xs text-text-muted font-medium">
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
        onComplete(calculatePercentCorrect(newCorrect, HOMOPHONE_QUESTIONS.length));
      }
    }, 900);
  };

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border-2 border-pink-50">
      {/* Centered header */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-2xl font-bold text-text mb-1">Word Recognition</h3>
        <p className="text-text-muted text-sm font-medium">Look at the image and choose the correct word.</p>
      </div>

      {/* Emoji Image */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-50 to-orange-50 border-2 border-pink-100 flex items-center justify-center text-7xl shadow-inner">
          {q.emoji}
        </div>
        <p className="text-text font-bold text-lg">{q.prompt}</p>
        {q.hint && <p className="text-xs text-text-muted italic">({q.hint})</p>}
      </div>

      {/* Two Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {options.map((word, idx) => {
          let style = 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-text';
          if (answered) {
            if (word === q.correct) style = 'bg-green-500 border-2 border-green-500 text-white';
            else if (word === selected) style = 'bg-red-400 border-2 border-red-400 text-white';
            else style = 'bg-gray-100 border-2 border-border text-text-muted';
          }
          return (
            <button key={idx} onClick={() => handleChoice(word)} disabled={answered}
              className={`${style} py-6 rounded-2xl font-black text-2xl transition-all disabled:cursor-not-allowed shadow-sm`}>
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-text-muted font-medium">
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

// Read-aloud uses the shared mic hook (same as Q9/Q10): it pauses "Hey Jarvis",
// shows a live level meter, explains mic errors and falls back to typing.
type WordResult = 'none' | 'correct' | 'wrong' | 'silent';

const normaliseWord = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

function heardWord(transcript: string, accepted: string[]): boolean {
  const targets = accepted.map(normaliseWord);
  const tokens = transcript.split(/\s+/).map(normaliseWord).filter(Boolean);
  const joined = normaliseWord(transcript);
  return targets.some((t) => t === joined || tokens.includes(t) || (t.length > 5 && joined.includes(t)));
}

/**
 * onComplete(score) = % of words read correctly, out of the words where the mic worked.
 * onComplete(null) = couldn't be measured (no mic support, or the mic failed on every word),
 * so the task is left out of the cognitive average instead of counting as 0 or 100.
 */
function TimedReadingTask({ onComplete }: { onComplete: (score: number | null) => void }) {
  const { reduceMotion } = useDyslexia();
  const mic = useSpeechCapture({ maxMs: 7000 });
  const [currentIdx, setCurrentIdx] = useState(0);
  const correctRef = useRef(0);
  const measuredRef = useRef(0);

  const q = READING_WORDS[currentIdx];
  const matched = heardWord(mic.transcript, q.accepted);

  // Stop listening as soon as the word is heard
  const { status, stop } = mic;
  useEffect(() => {
    if (status === 'listening' && matched) stop();
  }, [status, matched, stop]);

  // Heard something else: finish 1.5 s after they stop talking (no 7 s wait)
  const { transcript } = mic;
  useEffect(() => {
    if (status !== 'listening' || matched || !transcript) return;
    const t = window.setTimeout(stop, 1500);
    return () => window.clearTimeout(t);
  }, [status, matched, transcript, stop]);

  const result: WordResult =
    mic.status !== 'stopped' ? 'none' : matched ? 'correct' : mic.transcript ? 'wrong' : 'silent';

  const { reset } = mic;
  /** 'unmeasured' = the mic failed on this word, so it doesn't count either way */
  const goNext = useCallback(
    (outcome: 'correct' | 'wrong' | 'unmeasured') => {
      if (outcome !== 'unmeasured') measuredRef.current += 1;
      if (outcome === 'correct') correctRef.current += 1;
      reset();
      if (currentIdx < READING_WORDS.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        onComplete(
          measuredRef.current > 0 ? calculatePercentCorrect(correctRef.current, measuredRef.current) : null,
        );
      }
    },
    [currentIdx, reset, onComplete],
  );

  // Show the result for a moment, then move on by itself
  useEffect(() => {
    if (result !== 'correct' && result !== 'wrong') return;
    const t = window.setTimeout(() => goNext(result), result === 'correct' ? 1100 : 1600);
    return () => window.clearTimeout(t);
  }, [result, goNext]);

  // No speech recognition in this browser: typing would just copy the word on screen,
  // so this task can't be measured here and is left out.
  if (!mic.supported) {
    return (
      <div className="bg-surface rounded-3xl shadow-xl p-6 sm:p-8 text-center max-w-2xl mx-auto border-2 border-border">
        <div className="text-5xl mb-3" aria-hidden>
          📖
        </div>
        <h3 className="text-2xl font-bold text-text mb-2">Word Reading</h3>
        <p className="text-text-muted text-base font-medium mb-6 max-w-md mx-auto">
          This activity needs you to read words out loud, and this browser can't use the microphone for that.
          It won't count against you. For the full test, use Chrome or Edge.
        </p>
        <button
          type="button"
          onClick={() => onComplete(null)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md cursor-pointer"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl shadow-xl p-6 sm:p-8 text-center max-w-2xl mx-auto border-2 border-border">
      {/* Header — same layout as the other tasks */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-5xl mb-3" aria-hidden>
          📖
        </div>
        <h3 className="text-2xl font-bold text-text mb-2">Word Reading</h3>
        <p className="text-text-muted text-base font-medium">
          Tap the mic and read the word out loud.
        </p>
      </div>

      {/* The word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.word}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          className="flex flex-col items-center gap-2 mb-6"
        >
          <div
            className={`rounded-3xl border-2 px-8 sm:px-12 py-6 transition-colors ${
              result === 'correct'
                ? 'bg-emerald-50 border-emerald-300'
                : result === 'wrong'
                  ? 'bg-violet-50 border-violet-200'
                  : 'bg-blue-50 border-blue-100'
            }`}
          >
            <p className="font-black text-[#1E3A8A] select-none" style={{ fontSize: 'clamp(2.25rem, 6vw, 3.25rem)', letterSpacing: '0.02em' }}>
              {q.word}
            </p>
          </div>
          <p className="text-sm text-text-muted font-medium">{q.hint}</p>
        </motion.div>
      </AnimatePresence>

      {/* Answer area */}
      <div className="flex flex-col items-center gap-3 min-h-[13rem] justify-center">
        {result === 'correct' && (
          <div className="flex flex-col items-center gap-1" role="status">
            <span className="text-4xl" aria-hidden>
              ✅
            </span>
            <p className="text-emerald-700 font-bold text-lg">Well read!</p>
          </div>
        )}

        {result === 'wrong' && (
          <div className="flex flex-col items-center gap-1" role="status">
            <span className="text-4xl" aria-hidden>
              💙
            </span>
            <p className="text-violet-700 font-bold text-lg">No worries! Next word…</p>
            {mic.transcript && (
              <p className="text-xs text-text-muted">{`We heard: "${mic.transcript}"`}</p>
            )}
          </div>
        )}

        {result === 'silent' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-slate-600">
              {mic.heardSound ? 'We heard you, but could not catch the word.' : 'We did not hear anything.'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={mic.start}
                className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all shadow-md cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => goNext('wrong')}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-text font-bold transition-all cursor-pointer"
              >
                Skip word
              </button>
            </div>
          </div>
        )}

        {result === 'none' && (
          mic.error ? (
            // A broken/blocked mic is not the reader's fault: skip without counting the word
            <MicErrorBox error={mic.error} onRetry={mic.start} onSkip={() => goNext('unmeasured')} />
          ) : (
            <>
              <MicButton status={mic.status} level={mic.level} onStart={mic.start} onStop={mic.stop} reduceMotion={reduceMotion} />
              <LevelBars level={mic.level} active={mic.status === 'listening'} />
              <p className="text-sm font-semibold text-slate-600" aria-live="polite">
                {micStatusText(mic.status, mic.heardSound, mic.supported)}
              </p>
              {mic.status === 'listening' && <TimeBar elapsedMs={mic.elapsedMs} maxMs={mic.maxMs} />}
            </>
          )
        )}

      </div>

      <div className="mt-6 text-sm text-text-muted font-medium">
        Word {currentIdx + 1} of {READING_WORDS.length}
      </div>
    </div>
  );
}
