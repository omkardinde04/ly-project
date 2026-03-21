import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { getTranslation, type Translation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

interface ReportGeneratorProps {
  score: number;
  onRetake: () => void;
  onContinue: () => void;
}

export function ReportGenerator({ score, onRetake, onContinue }: ReportGeneratorProps) {
  const { language, setDyslexiaLevel, markTestCompleted } = useDyslexia();
  const t = getTranslation(language);

  useEffect(() => {
    markTestCompleted(score);
  }, [score]);

  const getLevel = (score: number): DyslexiaLevel => {
    if (score < 45) return 'none';
    if (score <= 60) return 'mild';
    if (score <= 80) return 'moderate';
    return 'severe';
  };

  const level = getLevel(score);

  const getLevelText = (level: DyslexiaLevel): string => {
    const levelMap: Record<DyslexiaLevel, keyof Translation> = {
      none: 'levelNone',
      mild: 'levelMild',
      moderate: 'levelModerate',
      severe: 'levelSevere',
    };
    return t[levelMap[level]] || level;
  };

  const getLevelColor = (level: DyslexiaLevel) => {
    switch (level) {
      case 'none': return 'text-green-600 bg-green-100';
      case 'mild': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'severe': return 'text-red-600 bg-red-100';
    }
  };

  const getRecommendations = (level: DyslexiaLevel) => {
    const recommendations = {
      none: {
        fontSize: 'Standard font size is comfortable for you',
        contrast: 'Normal contrast works well',
        audio: 'Optional audio support available',
        spacing: 'Standard line spacing',
      },
      mild: {
        fontSize: 'Consider slightly larger text (17px)',
        contrast: 'Soft background colors reduce strain',
        audio: 'Audio summaries can help with longer texts',
        spacing: 'Increased line spacing (1.8x)',
      },
      moderate: {
        fontSize: 'Larger text recommended (18px+)',
        contrast: 'High contrast mode suggested',
        audio: 'Regular use of audio support recommended',
        spacing: 'Wide line spacing (2x)',
      },
      severe: {
        fontSize: 'Extra large text strongly recommended',
        contrast: 'High contrast essential',
        audio: 'Audio-first interface recommended',
        spacing: 'Maximum line spacing for clarity',
      },
    };
    return recommendations[level];
  };

  const getLearningStyle = () => {
    // Simple heuristic based on score patterns
    if (score > 60) {
      return {
        primary: 'Visual-Auditory',
        description: 'You likely learn best through visuals combined with audio explanations',
        tips: [
          'Use diagrams and charts',
          'Listen to audio summaries',
          'Watch video tutorials',
          'Use mind maps',
        ],
      };
    } else if (score > 45) {
      return {
        primary: 'Multimodal',
        description: 'You benefit from multiple learning approaches',
        tips: [
          'Combine reading with audio',
          'Use color coding',
          'Break tasks into smaller steps',
          'Practice hands-on activities',
        ],
      };
    } else {
      return {
        primary: 'Flexible',
        description: 'You can adapt to various learning styles',
        tips: [
          'Traditional reading works well',
          'Supplement with visuals when needed',
          'Audio support available for longer texts',
          'Experiment with different methods',
        ],
      };
    }
  };

  const learningStyle = getLearningStyle();
  const recommendations = getRecommendations(level);

  const reportText = `
    Your dyslexia level is ${getLevelText(level)}. 
    Score: ${score}. 
    Learning style: ${learningStyle.primary}. 
    ${learningStyle.description}
  `;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
          📊 {t.reportTitle}
        </h1>
        <AudioControl text={reportText} />
      </motion.div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-100"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">{t.yourLevel}</h2>
            <div className={`inline-block px-6 py-3 rounded-full font-bold text-xl ${getLevelColor(level)}`}>
              {getLevelText(level)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-black text-blue-600 mb-2">{score}</div>
            <div className="text-gray-500 font-medium">Total Score</div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* UI Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{t.recommendedSettings}</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-green-500 mt-1">✓</span>
              {recommendations.fontSize}
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-green-500 mt-1">✓</span>
              {recommendations.contrast}
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-green-500 mt-1">✓</span>
              {recommendations.audio}
            </li>
            <li className="flex items-start gap-2 text-gray-700">
              <span className="text-green-500 mt-1">✓</span>
              {recommendations.spacing}
            </li>
          </ul>
        </motion.div>

        {/* Learning Style */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{t.learningStyle}</h3>
          </div>
          <div className="mb-4">
            <div className="font-bold text-lg text-blue-600 mb-2">{learningStyle.primary}</div>
            <p className="text-gray-700">{learningStyle.description}</p>
          </div>
          <ul className="space-y-2">
            {learningStyle.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Additional Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6 border border-blue-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{t.recommendations}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">📖 Reading</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use text-to-speech regularly</li>
              <li>• Take breaks every 20 minutes</li>
              <li>• Use a reading guide or ruler</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">✍️ Writing</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use spell-check tools</li>
              <li>• Dictate before writing</li>
              <li>• Break writing into steps</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">🎯 Focus</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Minimize visual clutter</li>
              <li>• Use focus timers</li>
              <li>• Work in quiet spaces</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">💡 Memory</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use mnemonics</li>
              <li>• Create visual associations</li>
              <li>• Practice active recall</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-700 font-medium">{t.disclaimer}</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t.retakeTest}
        </button>
        
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#4A90E2] text-white font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {t.goToDashboard}
        </button>
      </motion.div>
    </div>
  );
}
