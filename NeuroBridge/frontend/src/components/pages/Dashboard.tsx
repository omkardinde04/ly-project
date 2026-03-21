import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function Dashboard() {
  const { dyslexiaLevel, testScore, isTestCompleted, language } = useDyslexia();
  const t = getTranslation(language);

  // Redirect to assessment if not completed
  useEffect(() => {
    if (!isTestCompleted) {
      window.location.href = '/assessment';
    }
  }, [isTestCompleted]);

  if (!isTestCompleted || testScore === null) {
    return null;
  }

  const getLevelColor = (level: DyslexiaLevel) => {
    switch (level) {
      case 'none': return 'bg-green-100 text-green-700';
      case 'mild': return 'bg-yellow-100 text-yellow-700';
      case 'moderate': return 'bg-orange-100 text-orange-700';
      case 'severe': return 'bg-red-100 text-red-700';
    }
  };

  const getDashboardMessage = (level: DyslexiaLevel) => {
    const messages = {
      none: {
        title: 'Your learning profile is ready!',
        subtitle: 'You show minimal dyslexic indicators. Standard learning tools will work well for you.',
        icon: '🎯',
      },
      mild: {
        title: 'Your personalized dashboard is ready!',
        subtitle: 'You have mild dyslexic indicators. We\'ve optimized the interface slightly for your needs.',
        icon: '✨',
      },
      moderate: {
        title: 'Welcome to your customized workspace!',
        subtitle: 'You have moderate dyslexic indicators. We\'ve enabled enhanced accessibility features for you.',
        icon: '🌟',
      },
      severe: {
        title: 'Your optimized learning environment is ready!',
        subtitle: 'You have significant dyslexic indicators. We\'ve activated maximum accessibility support.',
        icon: '⭐',
      },
    };
    return messages[level];
  };

  const message = getDashboardMessage(dyslexiaLevel);

  const dashboardText = `${message.title} ${message.subtitle}`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-5xl">{message.icon}</span>
              {t.welcomeBack}
            </h1>
            <p className="text-lg text-gray-600 font-medium">{t.yourPersonalizedDashboard}</p>
          </div>
          <AudioControl text={dashboardText} />
        </div>

        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-blue-600 mb-2">Your Level</div>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${getLevelColor(dyslexiaLevel)}`}>
              {dyslexiaLevel === 'none' ? 'Standard' : dyslexiaLevel === 'mild' ? 'Mild Support' : dyslexiaLevel === 'moderate' ? 'Moderate Support' : 'Enhanced Support'}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-green-600 mb-2">Assessment Score</div>
            <div className="text-3xl font-black text-green-700">{testScore}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-purple-600 mb-2">Accessibility Mode</div>
            <div className="text-lg font-bold text-purple-700">Active ✓</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Start Learning */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.startLearning}</h3>
          <p className="text-gray-600 text-sm">Browse courses tailored to your learning style</p>
        </motion.div>

        {/* Track Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.trackProgress}</h3>
          <p className="text-gray-600 text-sm">View your learning analytics and achievements</p>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Settings</h3>
          <p className="text-gray-600 text-sm">Customize your accessibility preferences</p>
        </motion.div>
      </div>

      {/* Personalized Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Recommended For You
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">📖</span>
              Reading Tools
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Text-to-speech enabled</li>
              <li>• Dyslexia-friendly fonts active</li>
              <li>• Increased line spacing</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">🎧</span>
              Audio Support
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Listen to content in your language</li>
              <li>• Adjustable playback speed</li>
              <li>• Multi-language support</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              Visual Aids
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• High contrast mode available</li>
              <li>• Reduced visual clutter</li>
              <li>• Focus indicators on hover</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Productivity
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Break tasks into smaller steps</li>
              <li>• Use timers for focus sessions</li>
              <li>• Take regular breaks</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-3xl font-black text-blue-600 mb-1">0</div>
          <div className="text-xs font-semibold text-gray-600">Courses Started</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-3xl font-black text-green-600 mb-1">0</div>
          <div className="text-xs font-semibold text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-3xl font-black text-purple-600 mb-1">0</div>
          <div className="text-xs font-semibold text-gray-600">Hours Learned</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-3xl font-black text-orange-600 mb-1">0</div>
          <div className="text-xs font-semibold text-gray-600">Achievements</div>
        </div>
      </div>
    </div>
  );
}
