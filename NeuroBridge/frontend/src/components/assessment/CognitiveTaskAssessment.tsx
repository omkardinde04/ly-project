import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

interface CognitiveTaskProps {
  onComplete: (scores: { phonological: number; visual: number; workingMemory: number; processingSpeed: number; orthographic: number; executive: number }) => void;
}

export function CognitiveTaskAssessment({ onComplete }: CognitiveTaskProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
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
    { id: 'executive', name: 'Timed Reading', icon: '⏱️' },
  ];

  const handleTaskComplete = (taskId: string, score: number) => {
    if (isLoading) return; // Prevent double completion
    
    setIsLoading(true);
    setScores(prev => ({ ...prev, [taskId]: score }));
    
    // Small delay to ensure state updates before moving on
    setTimeout(() => {
      if (currentTask < tasks.length - 1) {
        setCurrentTask(currentTask + 1);
        setIsLoading(false);
      } else {
        // All tasks completed - pass scores to parent
        onComplete(scores);
      }
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
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
                  ? 'bg-blue-500 text-white scale-110'
                  : index < currentTask
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{task.icon}</span>
              <span className="text-xs font-medium hidden lg:block">{task.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading next task...</p>
        </div>
      )}

      {/* Current Task */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTask}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          {currentTask === 0 && <PhonologicalTask onComplete={(score) => handleTaskComplete('phonological', score)} />}
          {currentTask === 1 && <VisualAttentionTask onComplete={(score) => handleTaskComplete('visual', score)} />}
          {currentTask === 2 && <WorkingMemoryTask onComplete={(score) => handleTaskComplete('workingMemory', score)} />}
          {currentTask === 3 && <ProcessingSpeedTask onComplete={(score) => handleTaskComplete('processingSpeed', score)} />}
          {currentTask === 4 && <OrthographicTask onComplete={(score) => handleTaskComplete('orthographic', score)} />}
          {currentTask === 5 && <TimedReadingTask onComplete={(score) => handleTaskComplete('executive', score)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Task 1: Phonological Awareness (Sound Blending)
function PhonologicalTask({ onComplete }: { onComplete: (score: number) => void }) {
  const wordSets = [
    { word: 'cat', vowel: 'a' },
    { word: 'bat', vowel: 'a' },
    { word: 'mat', vowel: 'a' },
    { word: 'sit', vowel: 'i' },
    { word: 'hit', vowel: 'i' },
    { word: 'cup', vowel: 'u' },
    { word: 'mud', vowel: 'u' },
    { word: 'log', vowel: 'o' },
    { word: 'dog', vowel: 'o' },
    { word: 'bed', vowel: 'e' },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentSet = wordSets[currentIndex];
  const currentWord = currentSet.word;
  
  // Dynamic option generation - CRITICAL FIX
  const generateOptions = (word: string, vowel: string) => {
    // Create phonetically similar distractors by changing vowels
    const phoneticDistractors: Record<string, string[]> = {
      'cat': ['bat', 'mat', 'rat'],
      'bat': ['cat', 'mat', 'rat'],
      'mat': ['cat', 'bat', 'sat'],
      'sit': ['hit', 'bit', 'fit'],
      'hit': ['sit', 'bit', 'fit'],
      'cup': ['mud', 'bud', 'pup'],
      'mud': ['cup', 'bud', 'mum'],
      'log': ['dog', 'fog', 'bog'],
      'dog': ['log', 'fog', 'bog'],
      'bed': ['red', 'fed', 'bet'],
    };
    
    const distractors = phoneticDistractors[word] || [];
    const selectedDistractors = distractors.slice(0, 2); // Take 2 distractors
    const allOptions = [word, ...selectedDistractors];
    
    // Shuffle options randomly
    return allOptions.sort(() => Math.random() - 0.5);
  };

  const [options, setOptions] = useState(() => generateOptions(currentWord, currentSet.vowel));

  const playSound = () => {
    // Play individual phonemes with proper pronunciation
    const letters = currentWord.split('').join(' - ');
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letters);
      utterance.rate = 0.7; // Slower for clarity
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: string) => {
    if (attempted) return; // Prevent double-click
    
    setAttempted(true);
    setSelectedAnswer(selected);
    
    const isCorrect = selected === currentWord;
    if (isCorrect) {
      setCorrect(correct + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < wordSets.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        // Generate NEW options for next word
        setOptions(generateOptions(wordSets[nextIndex].word, wordSets[nextIndex].vowel));
        setAttempted(false);
        setSelectedAnswer(null);
      } else {
        const score = Math.round((correct / wordSets.length) * 100);
        onComplete(score);
      }
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sound Blending</h3>
        <p className="text-gray-600">Listen to the sounds and choose the correct word</p>
      </div>

      {/* Play Sound Button */}
      <button
        onClick={playSound}
        disabled={attempted}
        className="flex items-center gap-3 mx-auto bg-[#4A90E2] hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg mb-8 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        Play Sounds
      </button>

      {/* Answer Options */}
      <div className="grid grid-cols-3 gap-4">
        {options.map((word, idx) => {
          let buttonStyle = "bg-gray-100 hover:bg-blue-50 text-gray-800";
          
          if (attempted) {
            if (word === currentWord) {
              buttonStyle = "bg-green-500 text-white"; // Correct answer
            } else if (word === selectedAnswer) {
              buttonStyle = "bg-red-400 text-white"; // Wrong selection
            } else {
              buttonStyle = "bg-gray-100 text-gray-400";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(word)}
              disabled={attempted}
              className={`${buttonStyle} py-6 rounded-xl font-semibold text-xl transition-all disabled:cursor-not-allowed`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 text-sm text-gray-500">
        Question {currentIndex + 1} of {wordSets.length}
      </div>
    </div>
  );
}

// Task 2: Visual Attention Span
function VisualAttentionTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showing, setShowing] = useState(true);
  const letters = 'KTPRMNDFGH';

  useEffect(() => {
    // Generate random sequence
    const seq: string[] = [];
    for (let i = 0; i < 5; i++) {
      seq.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    setSequence(seq);

    // Show for 25 seconds then hide (accessible timing)
    const timer = setTimeout(() => {
      setShowing(false);
    }, 25000); // 25 seconds - plenty of time to memorize

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    let correct = 0;
    userInput.toUpperCase().split('').forEach((char, idx) => {
      if (char === sequence[idx]) correct++;
    });
    const score = Math.round((correct / sequence.length) * 100);
    onComplete(score);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">👁️</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Visual Attention</h3>
      
      {showing ? (
        <div className="text-6xl font-black tracking-widest mb-6">
          {sequence.join(' ')}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Which letters did you see?</p>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the letters you remember"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-2xl uppercase"
            maxLength={5}
          />
          <button
            onClick={handleSubmit}
            className="bg-[#4A90E2] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

// Task 3: Working Memory (Corsi Block)
function WorkingMemoryTask({ onComplete }: { onComplete: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [litUp, setLitUp] = useState<number | null>(null);
  const [level, setLevel] = useState(2);
  const [showingSequence, setShowingSequence] = useState(true);

  useEffect(() => {
    // Generate sequence
    const seq: number[] = [];
    for (let i = 0; i < level; i++) {
      seq.push(Math.floor(Math.random() * 9));
    }
    setSequence(seq);

    // Show sequence
    let currentIndex = 0;
    const showBlock = () => {
      if (currentIndex < seq.length) {
        setLitUp(seq[currentIndex]);
        setTimeout(() => {
          setLitUp(null);
          currentIndex++;
          setTimeout(showBlock, 300);
        }, 800);
      } else {
        setShowingSequence(false);
      }
    };
    setTimeout(showBlock, 1000);
  }, [level]);

  const handleBlockClick = (index: number) => {
    if (!showingSequence) {
      const newUserSeq = [...userSequence, index];
      setUserSequence(newUserSeq);

      if (newUserSeq.length === sequence.length) {
        // Check if correct
        const isCorrect = newUserSeq.every((val, idx) => val === sequence[idx]);
        if (isCorrect) {
          setLevel(level + 1);
          setUserSequence([]);
          setShowingSequence(true);
        } else {
          // Game over - calculate score based on highest level
          const score = Math.min(100, level * 15);
          onComplete(score);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">🧠</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Memory Game</h3>
      <p className="text-gray-600 mb-6">Watch the pattern, then repeat it</p>

      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <button
            key={index}
            onClick={() => handleBlockClick(index)}
            className={`w-20 h-20 rounded-xl font-bold text-2xl transition-all ${
              litUp === index
                ? 'bg-blue-500 scale-110'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {!showingSequence && (
        <p className="mt-6 text-blue-600 font-semibold">Your turn! Click the blocks in order</p>
      )}
    </div>
  );
}

// Task 4: Processing Speed
function ProcessingSpeedTask({ onComplete }: { onComplete: (score: number) => void }) {
  const patterns = ['◆■●▲★', '◆■●▲☆', '◇◆●▲★', '◆■●▲★'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; time: number }[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    setStartTime(new Date());
  }, [currentIndex]);

  const handleResponse = (same: boolean) => {
    const endTime = new Date();
    const time = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;
    
    const pattern1 = patterns[currentIndex];
    const pattern2 = patterns[currentIndex + 1] || patterns[0];
    const isActuallySame = pattern1 === pattern2;
    const correct = same === isActuallySame;

    setResponses([...responses, { correct, time }]);

    if (currentIndex < 19) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score based on speed and accuracy
      const accuracy = responses.filter(r => r.correct).length / 20;
      const avgTime = responses.reduce((sum, r) => sum + r.time, 0) / 20;
      const speedScore = Math.max(0, 100 - avgTime * 10);
      const score = Math.round(accuracy * 70 + speedScore * 0.3);
      onComplete(score);
    }
  };

  const pattern1 = patterns[currentIndex];
  const pattern2 = patterns[(currentIndex + 1) % patterns.length];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">⚡</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Pattern Match</h3>
      <p className="text-gray-600 mb-6">Are these patterns the SAME or DIFFERENT?</p>

      <div className="flex justify-center gap-8 mb-8">
        <div className="text-4xl tracking-widest bg-gray-50 p-6 rounded-xl">{pattern1}</div>
        <div className="text-4xl tracking-widest bg-gray-50 p-6 rounded-xl">{pattern2}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button
          onClick={() => handleResponse(true)}
          className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg"
        >
          SAME
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg"
        >
          DIFFERENT
        </button>
      </div>
    </div>
  );
}

// Task 5: Orthographic Processing
function OrthographicTask({ onComplete }: { onComplete: (score: number) => void }) {
  const wordPairs = [
    { correct: 'receive', incorrect: 'recieve' },
    { correct: 'brain', incorrect: 'brane' },
    { correct: 'friend', incorrect: 'freind' },
    { correct: 'believe', incorrect: 'beleive' },
    { correct: 'piece', incorrect: 'peice' },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const handleChoice = (isCorrect: boolean) => {
    if (isCorrect) setCorrect(correct + 1);

    if (currentIndex < wordPairs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const score = Math.round((correct / wordPairs.length) * 100);
      onComplete(score);
    }
  };

  const pair = wordPairs[currentIndex];
  const options = Math.random() > 0.5 ? [pair.correct, pair.incorrect] : [pair.incorrect, pair.correct];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <span className="text-6xl mb-4 block">📝</span>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Word Recognition</h3>
      <p className="text-gray-600 mb-6">Choose the correctly spelled word</p>

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {options.map((word, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(word === pair.correct)}
            className="bg-blue-50 hover:bg-blue-100 text-gray-800 py-6 px-8 rounded-xl font-semibold text-xl transition-all"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

// Task 6: Timed Reading
function TimedReadingTask({ onComplete }: { onComplete: (score: number) => void }) {
  const words = [
    'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
    'learning', 'platform', 'accessibility', 'dyslexia', 'support',
    'audio', 'visual', 'comprehension', 'reading', 'skills', 'development'
  ];
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleStart = () => {
    setStarted(true);
    setStartTime(new Date());
  };

  const handleClick = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const endTime = new Date();
      const minutes = (endTime.getTime() - (startTime?.getTime() || 0)) / 60000;
      const wpm = words.length / minutes;
      const score = Math.min(100, Math.round(wpm / 2)); // Normalize to 0-100
      onComplete(score);
    }
  };

  if (!started) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <span className="text-6xl mb-4 block">⏱️</span>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Timed Reading</h3>
        <p className="text-gray-600 mb-6">Click through all words as fast as you can while reading them</p>
        
        <button
          onClick={handleStart}
          className="bg-[#4A90E2] hover:bg-blue-600 text-white px-12 py-4 rounded-xl font-bold text-xl"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <span className="text-sm text-gray-500">Word {currentIndex + 1} of {words.length}</span>
      </div>

      <div
        onClick={handleClick}
        className="text-6xl font-bold text-gray-800 py-12 cursor-pointer hover:bg-blue-50 rounded-xl transition-all"
      >
        {words[currentIndex]}
      </div>

      <p className="text-gray-500 mt-6">Click to continue</p>
    </div>
  );
}
