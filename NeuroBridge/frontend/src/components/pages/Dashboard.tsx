import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MyLearning } from '../dashboard/MyLearning';
import { ProgressTracking } from '../dashboard/ProgressTracking';
import { Opportunities } from '../dashboard/Opportunities';
import { NotebookLLM } from '../dashboard/NotebookLLM';
import { Community } from '../dashboard/Community';
import { Profile } from '../dashboard/Profile';
import { AccessibilitySettings } from '../dashboard/AccessibilitySettings';
import { LinkedInConnect } from '../dashboard/LinkedInConnect';
import { Brain } from '../dashboard/Brain';
import { ResumeBuilder } from '../resume-builder/ResumeBuilder';

export function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  // Auto-navigate to linkedin tab if returning from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin_connected') || params.get('linkedin_error')) {
      setActiveTab('linkedin');
    }
  }, []);

  // Support dashboard sub-routes like /dashboard/resume-builder
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/resume-builder')) {
      setActiveTab('resumeBuilder');
    } else if (location.pathname.startsWith('/dashboard/opportunities')) {
      setActiveTab('opportunities');
    }
  }, [location.pathname]);

  // Check if user is authenticated
  if (!user || !token) {
    console.log('Dashboard: No user or token found, showing mock dashboard for testing');
    // Temporarily show mock dashboard for testing
    return (
      <div className="flex min-h-screen bg-[#DBEAF5]">
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Mock Dashboard (Testing)</h1>
          <p className="text-gray-600 mb-4">Please log in to access the full dashboard.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if assessment is completed
  if (!user.assessment_completed) {
    return <DashboardWelcome onStartAssessment={() => navigate('/assessment')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard onNavigate={setActiveTab} />;
      case 'assessment':
        return <HomeDashboard onNavigate={setActiveTab} />;
      case 'cognitive':
        return <Brain />;
      case 'learning':
        return <MyLearning />;
      case 'progress':
        return <ProgressTracking />;
      case 'opportunities':
        return <Opportunities />;
      case 'resumeBuilder':
        return <ResumeBuilder />;
      case 'linkedin':
        return <LinkedInConnect />;
      case 'brain':
        return <Brain />;
      case 'notebook':
        return <NotebookLLM />;
      case 'community':
        return <Community />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'profile':
        return <Profile />;
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
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const t = getTranslation(language);
  const [isRetaking, setIsRetaking] = useState(false);

  const handleRetakeAssessment = async () => {
    if (!token || !user) return;
    
    setIsRetaking(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/google/assessment/retake', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local user state
        updateUser({
          assessment_completed: false,
          assessment_score: undefined
        });
        
        // Navigate to assessment
        navigate('/assessment');
      } else {
        console.error('Failed to retake assessment');
      }
    } catch (error) {
      console.error('Error retaking assessment:', error);
    } finally {
      setIsRetaking(false);
    }
  };

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
        </div>

        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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


      {/* Cognitive Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100"
      >
        <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-4xl">🧠</span>
          Your Cognitive Strengths
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Phonological', icon: '🔊', level: 75 },
            { name: 'Visual Attention', icon: '👁️', level: 85 },
            { name: 'Working Memory', icon: '🧠', level: 70 },
            { name: 'Processing Speed', icon: '⚡', level: 80 },
            { name: 'Word Recognition', icon: '📝', level: 65 },
            { name: 'Executive Function', icon: '⏱️', level: 90 },
          ].map((dim, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{dim.icon}</span>
                <span className="font-bold text-gray-800 text-sm">{dim.name}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
                  style={{ width: `${dim.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>


      {/* Dashboard Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Assessment Card */}
        <DashboardCard
          icon="🧠"
          title="Assessment"
          description={user?.assessment_completed ? "Retake the assessment to update your learning profile." : "Take a short cognitive assessment to personalise your learning experience."}
          buttonLabel={user?.assessment_completed ? (isRetaking ? "Retaking..." : "Retake Assessment →") : "Start Assessment →"}
          buttonColor={user?.assessment_completed ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"}
          onClick={user?.assessment_completed ? (isRetaking ? () => {} : handleRetakeAssessment) : () => navigate('/assessment')}
          badge={user?.assessment_score ? `Score: ${user.assessment_score}` : 'Not taken yet'}
          badgeColor={user?.assessment_score ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
          delay={0.1}
        />

        {/* Continue Learning Card */}
        <DashboardCard
          icon="📚"
          title="Continue Learning"
          description="Pick up where you left off with your personalised learning modules."
          buttonLabel="Go to Learning →"
          buttonColor="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          onClick={() => onNavigate('learning')}
          delay={0.15}
        />

        {/* View Progress Card */}
        <DashboardCard
          icon="📊"
          title="View Progress"
          description="See how far you've come and celebrate your achievements."
          buttonLabel="View Progress →"
          buttonColor="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
          onClick={() => onNavigate('progress')}
          delay={0.2}
        />

        {/* LinkedIn Promo Card */}
        <LinkedInPromoCard onNavigate={onNavigate} />
      </motion.div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'notebook', icon: '📓', title: 'AI Notebook', desc: 'Smart learning assistant' },
          { id: 'community', icon: '🌍', title: 'Community', desc: 'Connect with peers' },
          { id: 'opportunities', icon: '🚀', title: 'Opportunities', desc: 'Jobs & scholarships' },
          { id: 'accessibility', icon: '⚙️', title: 'Accessibility', desc: 'Customise experience' },
        ].map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => onNavigate(item.id)}
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">{item.icon}</span>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Career Section (last module): Resume Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-3xl border border-blue-100">
              📝
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">Resume Builder</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Build a clean, dyslexia-friendly resume with live preview.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/resume-builder')}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Open Resume Builder →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Dashboard Card Component
function DashboardCard({
  icon, title, description, buttonLabel, buttonColor, onClick, badge, badgeColor, delay = 0,
}: {
  icon: string; title: string; description: string; buttonLabel: string;
  buttonColor: string; onClick: () => void; badge?: string; badgeColor?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50 hover:shadow-xl transition-all flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-3xl border border-blue-100">
          {icon}
        </div>
        {badge && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`mt-auto w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${buttonColor}`}
      >
        {buttonLabel}
      </button>
    </motion.div>
  );
}



// Welcome screen for users who haven't taken assessment yet
function DashboardWelcome({ onStartAssessment }: { onStartAssessment: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center"
      >
        <div className="text-8xl mb-6">🧠</div>
        <h1 className="text-5xl font-black text-gray-800 mb-4">
          Welcome to NeuroBridge!
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Personalize your learning experience by taking our interactive assessment.
          <br />
          <span className="text-sm text-gray-500">It only takes 5-10 minutes and helps us customize everything for you.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-800 mb-2">Personalized</h3>
            <p className="text-sm text-gray-600">Tailored to your learning style</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="font-bold text-gray-800 mb-2">Interactive</h3>
            <p className="text-sm text-gray-600">Fun activities, not boring tests</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-800 mb-2">Quick</h3>
            <p className="text-sm text-gray-600">Complete in just 5-10 minutes</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStartAssessment}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Start Assessment →
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-10 py-4 bg-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-300 transition-all"
          >
            Explore First
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          💡 You can also take the assessment later from the dashboard
        </p>
      </motion.div>
    </div>
  );
}

function LinkedInPromoCard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('linkedin_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setProfile(p);
        setIsConnected(true);
      } catch (e) {
        console.error('Failed to parse linkedin profile', e);
      }
    }
  }, []);

  if (isConnected && profile) {
    return (
      <DashboardCard
        icon="🚀"
        title="LinkedIn Integrated"
        description={`Connected as ${profile.name}. Explore your AI-generated career paths and learning roadmap.`}
        buttonLabel="Open My Plan →"
        buttonColor="bg-gradient-to-r from-[#0077B5] to-[#00a0dc] hover:from-[#005fa3] hover:to-[#0088cc]"
        onClick={() => onNavigate('linkedin')}
        delay={0.25}
        badge="Active"
        badgeColor="bg-blue-100 text-[#0077B5]"
      />
    );
  }

  return (
    <DashboardCard
      icon="💼"
      title="Connect LinkedIn"
      description="Sync your career profile to unlock personalized opportunity matching and skill roadmaps."
      buttonLabel="Connect LinkedIn →"
      buttonColor="bg-[#0077B5] hover:bg-[#005fa3]"
      onClick={() => onNavigate('linkedin')}
      delay={0.25}
    />
  );
}

