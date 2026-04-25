import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioControl } from '../ui/AudioControl';

// Mock Quiz Database
const QUIZZES = [
  {
    id: 'visual-patterns',
    title: 'Visual Pattern Recognition',
    description: 'Test your ability to recognize and predict visual sequences.',
    icon: '👁️',
    questions: [
      {
        question: 'Which shape comes next in the pattern: Circle, Square, Triangle, Circle, Square...?',
        options: ['Circle', 'Square', 'Triangle', 'Hexagon'],
        correct: 2, // Index of 'Triangle'
      },
      {
        question: 'If you rotate a lowercase "b" 180 degrees, what letter does it look like?',
        options: ['d', 'q', 'p', 'b'],
        correct: 1, // 'q'
      },
    ]
  },
  {
    id: 'reading-comp',
    title: 'Reading Comprehension',
    description: 'A short story quiz to test fundamental reading retention.',
    icon: '📖',
    questions: [
      {
        question: 'The quick brown fox jumps over the lazy dog. What color was the fox?',
        options: ['Red', 'Brown', 'Black', 'White'],
        correct: 1,
      },
      {
        question: 'In the previous sentence, what was the dog doing?',
        options: ['Sleeping', 'Running', 'Being lazy', 'Barking'],
        correct: 2,
      },
    ]
  }
];

export function Quizzes() {
  const [activeQuiz, setActiveQuiz] = useState<typeof QUIZZES[0] | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleStart = (quiz: typeof QUIZZES[0]) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
  };

  const handleNext = () => {
    if (selectedAnswer === activeQuiz?.questions[currentQuestionIdx].correct) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestionIdx < (activeQuiz?.questions.length ?? 0) - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Finish Quiz — just set finished state
      setIsFinished(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Tests & Quizzes</h1>
          <p className="text-gray-600 font-medium">Challenge yourself and practice your skills</p>
        </div>
        <AudioControl 
          text="Tests and Quizzes section. Select a quiz to practice your skills and track your progress." 
          showControls={false} 
        />
      </div>

      <AnimatePresence mode="wait">
        {!activeQuiz ? (
          /* Quiz List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8"
          >
            {QUIZZES.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white p-8 rounded-[32px] shadow-sm border-2 border-transparent hover:border-blue-100 hover:shadow-md transition-all group flex flex-col md:flex-row items-start gap-6"
              >
                <div className="w-20 h-20 shrink-0 bg-[#F4F9FD] rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                  {quiz.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 font-medium mb-6">{quiz.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {quiz.questions.length} Questions
                    </span>
                    <button 
                      onClick={() => handleStart(quiz)}
                      className="bg-[#1D64D8] text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      Start Test
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : isFinished ? (
          /* Results View */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] shadow-lg text-center max-w-3xl border-2 border-blue-50 relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-4 bg-linear-to-r from-blue-400 to-green-400"></div>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
              🎉
            </div>
            <h2 className="text-4xl font-black text-gray-800 mb-4">Quiz Completed!</h2>
            <p className="text-xl text-gray-600 font-medium mb-8">
              Great job on completing <span className="text-blue-600 font-bold">{activeQuiz.title}</span>.
            </p>
            <div className="inline-block bg-[#F4F9FD] border border-blue-100 rounded-3xl p-6 mb-10 w-full max-w-sm">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Your Score</div>
              <div className="text-6xl font-black text-[#1D64D8]">
                {Math.round(((score + (selectedAnswer === activeQuiz.questions[currentQuestionIdx].correct ? 1 : 0)) / activeQuiz.questions.length) * 100)}%
              </div>
            </div>
            <div>
              <button 
                onClick={() => setActiveQuiz(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Return to Quizzes
              </button>
            </div>
          </motion.div>
        ) : (
          /* Active Quiz View */
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm max-w-4xl border border-blue-50"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveQuiz(null)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  &larr;
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{activeQuiz.title}</h2>
              </div>
              <div className="bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm">
                Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <h3 className="text-2xl font-black text-[#2D3748] leading-tight flex-1">
                  {activeQuiz.questions[currentQuestionIdx].question}
                </h3>
                <AudioControl text={activeQuiz.questions[currentQuestionIdx].question} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedAnswer(optIdx)}
                    className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all duration-200 ${
                      selectedAnswer === optIdx 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-[#F4F9FD]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedAnswer === optIdx ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedAnswer === optIdx && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                disabled={selectedAnswer === null}
                onClick={handleNext}
                className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${
                  selectedAnswer !== null 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentQuestionIdx === activeQuiz.questions.length - 1 ? 'Submit Answers' : 'Next Question'} &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
