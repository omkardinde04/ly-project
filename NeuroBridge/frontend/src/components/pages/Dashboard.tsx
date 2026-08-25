import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardTextTranslations, getTranslation } from '../../utils/translations';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MyLearning } from '../dashboard/MyLearning';
import { ProgressTracking } from '../dashboard/ProgressTracking';
import { Opportunities } from '../dashboard/Opportunities';
import { NotebookLLM } from '../dashboard/NotebookLLM';
import { Community } from '../dashboard/Community';
import { Profile } from '../dashboard/Profile';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { AudioControl } from '../ui/AudioControl';
import { AccessibilitySettings } from '../dashboard/AccessibilitySettings';
import { LinkedInConnect } from '../dashboard/LinkedInConnect';
import { Brain } from '../dashboard/Brain';
import { ResumeBuilder } from '../resume-builder/ResumeBuilder';
import { TrendingUp, FileText, Bot, Users, Briefcase, Settings } from 'lucide-react';

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
      <div className="flex min-h-screen bg-bg">
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-text mb-4">Mock Dashboard (Testing)</h1>
          <p className="text-text-muted mb-4">Please log in to access the full dashboard.</p>
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
    <div className="dashboard-shell flex min-h-screen bg-bg">
      <DashboardLanguageBridge />
      {/* Left Sidebar */}
      <DashboardSidebar activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Main Content Area */}
      <main className="dashboard-main flex-1 ml-64 p-8 flex flex-col h-screen overflow-y-auto">
        {/* Global Accessibility Top Bar */}
        <div className="flex items-center justify-end gap-4 mb-6 shrink-0">
          <AudioControl showControls={false} />
          <LanguageSelector />
          <DyslexiaToggle />
        </div>

        {/* Page Content */}
        <div className="dashboard-content flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function DashboardLanguageBridge() {
  const { language } = useDyslexia();

  useEffect(() => {
    const dashboard = document.querySelector('.dashboard-shell');
    if (!dashboard) return;

    const dictionary = getDashboardTextTranslations(language);
    const hindiDictionary = getDashboardTextTranslations('hi');
    const marathiDictionary = getDashboardTextTranslations('mr');
    const originals = new Map<Text, string>();
    const translatedAttributes = new Map<Element, Map<string, string>>();
    let observer: MutationObserver;
    const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    const translatedPhrases = Object.keys({ ...hindiDictionary, ...marathiDictionary })
      .map((key) => hindiDictionary[key] || marathiDictionary[key])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    const restoreEnglish = (value: string) => {
      let restored = value;
      for (const phrase of translatedPhrases) {
        const english = Object.keys(hindiDictionary).find((key) => hindiDictionary[key] === phrase)
          || Object.keys(marathiDictionary).find((key) => marathiDictionary[key] === phrase);
        if (english) restored = restored.split(phrase).join(english);
      }
      return restored;
    };
    const translateValue = (value: string) => {
      const normalized = restoreEnglish(value);
      const trimmed = normalized.trim();
      if (!trimmed) return value;
      if (dictionary[trimmed]) return normalized.replace(trimmed, dictionary[trimmed]);
      return phrases.reduce((result, phrase) => result.split(phrase).join(dictionary[phrase]), normalized);
    };

    const translate = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);

      for (const textNode of textNodes) {
        const value = originals.get(textNode) ?? textNode.nodeValue ?? '';
        if (!originals.has(textNode)) originals.set(textNode, value);
        textNode.nodeValue = translateValue(value);
      }

      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll('*'))] : [];
      for (const element of elements) {
        for (const attribute of ['placeholder', 'title', 'aria-label']) {
          const value = element.getAttribute(attribute);
          if (!value) continue;
          const translated = translateValue(value);
          if (translated === value) continue;
          let saved = translatedAttributes.get(element);
          if (!saved) {
            saved = new Map();
            translatedAttributes.set(element, saved);
          }
          if (!saved.has(attribute)) saved.set(attribute, value);
          element.setAttribute(attribute, translated);
        }
      }
    };

    translate(dashboard);
    observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((addedNode) => translate(addedNode));
      }
      observer.observe(dashboard, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(dashboard, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      originals.forEach((value, textNode) => { textNode.nodeValue = value; });
      translatedAttributes.forEach((attributes, element) => {
        attributes.forEach((value, attribute) => element.setAttribute(attribute, value));
      });
    };
  }, [language]);

  return null;
}



function HomeDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { dyslexiaLevel, testScore, language } = useDyslexia();
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const t = getTranslation(language);
  const [isRetaking, setIsRetaking] = useState(false);

  useEffect(() => {
    if (!user?.assessment_completed || !token) return;
    fetch('http://localhost:4000/api/auth/google/ml/init-adaptive-params', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
  }, [user?.assessment_completed, token]);

  const handleRetakeAssessment = async () => {
    if (!token || !user) return;
    
    setIsRetaking(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/google/assessment/retake', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
        className="bg-surface rounded-3xl shadow-xl p-8 border-2 border-blue-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-text mb-2">
              {t.welcomeBack}
            </h1>
            <p className="text-lg text-text-muted font-medium">{t.yourPersonalizedDashboard}</p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-blue-600 mb-2">{t.yourLevel}</div>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${getLevelColor(dyslexiaLevel)}`}>
              {dyslexiaLevel === 'none' ? t.standard : dyslexiaLevel === 'mild' ? t.levelMild : dyslexiaLevel === 'moderate' ? t.levelModerate : t.levelSevere}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-green-600 mb-2">{t.assessmentScore}</div>
            <div className="text-3xl font-black text-green-700">{testScore}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="text-sm font-semibold text-purple-600 mb-2">{t.accessibilityMode}</div>
            <div className="text-lg font-bold text-purple-700">{t.active} ✓</div>
          </div>
        </div>
      </motion.div>


      {/* Dashboard Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <DashboardCard
          icon={<TrendingUp size={28} className="text-[#4A90E2]" />}
          title={t.trackProgress}
          description={t.yourPersonalizedDashboard}
          buttonLabel={`${t.viewProgress} →`}
          onClick={() => onNavigate('progress')}
          delay={0.1}
        />
        
        <DashboardCard
          icon={<FileText size={28} className="text-[#4A90E2]" />}
          title={t.resumeBuilder}
          description={t.resumeDescription}
          buttonLabel={`${t.openResumeBuilder} →`}
          onClick={() => navigate('/dashboard/resume-builder')}
          delay={0.15}
        />
      </motion.div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {[
          { id: 'notebook', icon: <Bot size={24} className="text-[#4A90E2]" />, title: t.aiNotebook, desc: t.smartLearningAssistant },
          { id: 'community', icon: <Users size={24} className="text-[#4A90E2]" />, title: t.community, desc: t.connectWithPeers },
          { id: 'opportunities', icon: <Briefcase size={24} className="text-[#4A90E2]" />, title: t.opportunities, desc: t.jobsAndScholarships },
          { id: 'accessibility', icon: <Settings size={24} className="text-[#4A90E2]" />, title: t.navSettings, desc: t.customiseExperience },
        ].map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => onNavigate(item.id)}
            className="bg-surface rounded-2xl shadow-sm p-5 border border-border hover:border-[#4A90E2] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-text mb-1">{item.title}</h3>
            <p className="text-text-muted text-xs font-medium">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Reusable Dashboard Card Component
function DashboardCard({
  icon, title, description, buttonLabel, onClick, badge, badgeColor, buttonColor, delay = 0,
}: {
  icon: React.ReactNode; title: string; description: string; buttonLabel: string;
  onClick: () => void; badge?: string; badgeColor?: string; buttonColor?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface rounded-2xl shadow-sm p-6 border border-border hover:border-blue-200 transition-all flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl border border-blue-100">
          {icon}
        </div>
        {badge && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-text mb-1">{title}</h3>
        <p className="text-text-muted text-sm font-medium leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`mt-auto w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-sm ${
          buttonColor || 'bg-[#4A90E2] hover:bg-[#3A80D2]'
        }`}
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
        className="max-w-2xl w-full bg-surface rounded-3xl shadow-2xl p-12 text-center"
      >
        <div className="text-8xl mb-6">🧠</div>
        <h1 className="text-5xl font-black text-text mb-4">
          Welcome to NeuroBridge!
        </h1>
        <p className="text-xl text-text-muted mb-8 leading-relaxed">
          Personalize your learning experience by taking our interactive assessment.
          <br />
          <span className="text-sm text-text-muted">It only takes 5-10 minutes and helps us customize everything for you.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-text mb-2">Personalized</h3>
            <p className="text-sm text-text-muted">Tailored to your learning style</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="font-bold text-text mb-2">Interactive</h3>
            <p className="text-sm text-text-muted">Fun activities, not boring tests</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-text mb-2">Quick</h3>
            <p className="text-sm text-text-muted">Complete in just 5-10 minutes</p>
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
            className="px-10 py-4 bg-gray-200 text-text rounded-full font-bold text-lg hover:bg-gray-300 transition-all"
          >
            Explore First
          </button>
        </div>

        <p className="mt-8 text-sm text-text-muted">
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

