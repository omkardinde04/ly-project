import { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MyLearning } from '../dashboard/MyLearning';
import { ProgressTracking } from '../dashboard/ProgressTracking';
import { Quizzes } from '../dashboard/Quizzes';
import { Profile } from '../dashboard/Profile';
import { AccessibilitySettings } from '../dashboard/AccessibilitySettings';

export function Dashboard() {
  const { testScore, isTestCompleted } = useDyslexia();
  const [activeTab, setActiveTab] = useState('home');

  // Redirect to assessment if not completed
  useEffect(() => {
    if (!isTestCompleted) {
      window.location.href = '/assessment';
    }
  }, [isTestCompleted]);

  if (!isTestCompleted || testScore === null) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard onNavigate={setActiveTab} />;
      case 'learning':
        return <MyLearning />;
      case 'progress':
        return <ProgressTracking />;
      case 'quizzes':
        return <Quizzes />;
      case 'profile':
        return <Profile />;
      case 'accessibility':
        return <AccessibilitySettings />;
      default:
        return <HomeDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#DBEAF5]">
      {/* Left Sidebar */}
      <DashboardSidebar activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
}

function HomeDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { dyslexiaLevel, testScore, language } = useDyslexia();
  const t = getTranslation(language);

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-blue-600 mb-2">Your Level</div>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${getLevelColor(dyslexiaLevel)}`}>
              {dyslexiaLevel === 'none' ? 'Standard' : dyslexiaLevel === 'mild' ? 'Mild Support' : dyslexiaLevel === 'moderate' ? 'Moderate Support' : 'Enhanced Support'}
            </div>
          </div>
          
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-green-600 mb-2">Assessment Score</div>
            <div className="text-3xl font-black text-green-700">{testScore}</div>
          </div>
          
          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-purple-600 mb-2">Accessibility Mode</div>
            <div className="text-lg font-bold text-purple-700">Active ✓</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'learning', icon: '📚', title: 'My Learning', desc: 'Personalized courses' },
          { id: 'quizzes', icon: '📝', title: 'Tests & Quizzes', desc: 'Interactive practice' },
          { id: 'progress', icon: '📊', title: 'Track Progress', desc: 'See your growth' },
          { id: 'accessibility', icon: '⚙️', title: 'Accessibility', desc: 'Customize experience' },
        ].map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onNavigate(item.id)}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
