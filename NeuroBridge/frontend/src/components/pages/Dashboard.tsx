import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getDashboardTextTranslations, getTranslation } from '../../utils/translations';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { DashboardStatusCards } from '../dashboard/DashboardStatusCards';
import { LearningProgressCard } from '../dashboard/LearningProgressCard';
import { CoursesWidget } from '../dashboard/CoursesWidget';
import { ResumeBuilderWidget } from '../dashboard/ResumeBuilderWidget';
import { OpportunitiesWidget } from '../dashboard/OpportunitiesWidget';
import { AINotebookWidget } from '../dashboard/AINotebookWidget';
import { CommunityWidget } from '../dashboard/CommunityWidget';
import { AccessibilityQuickActions } from '../dashboard/AccessibilityQuickActions';

import { MyLearning } from '../dashboard/MyLearning';
import { ProgressTracking } from '../dashboard/ProgressTracking';
import { Opportunities } from '../dashboard/Opportunities';
import { NotebookLLM } from '../dashboard/NotebookLLM';
import { Community } from '../dashboard/Community';
import { Profile } from '../dashboard/Profile';
import { CoursesDashboard } from '../pages/CoursesDashboard';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { AudioControl } from '../ui/AudioControl';
import { AccessibilitySettings } from '../dashboard/AccessibilitySettings';
import { LinkedInConnect } from '../dashboard/LinkedInConnect';
import { Brain } from '../dashboard/Brain';
import { ResumeBuilder } from '../resume-builder/ResumeBuilder';

export function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  // Sidebar collapse state with localStorage persistence and tablet default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('neurobridge.sidebarCollapsed');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return true;
    } catch {}
    return false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('neurobridge.sidebarCollapsed', String(next));
      } catch {}
      return next;
    });
  };

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
    } else if (location.pathname.startsWith('/dashboard/courses')) {
      setActiveTab('courses');
    }
  }, [location.pathname]);

  // Check if user is authenticated
  if (!user || !token) {
    return (
      <div className="flex min-h-screen bg-[#F0F7FA]">
        <div className="flex-1 p-8 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-[#1A202C] mb-2">Session Required</h1>
          <p className="text-sm text-[#64748B] mb-5">Please log in to access your student dashboard.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1D4ED8] transition-colors"
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
      case 'courses':
        return <div className="-m-5 sm:-m-7 lg:-m-8"><CoursesDashboard /></div>;
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
    <div className="dashboard-shell flex min-h-screen bg-[#F0F7FA]">
      {/* Redesigned Fixed Desktop Sidebar & Mobile Drawer */}
      <DashboardSidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area with synchronous Framer Motion margin animation */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: isSidebarCollapsed ? 80 : 275,
        }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="dashboard-main flex-1 p-5 sm:p-7 lg:p-8 flex flex-col h-screen overflow-y-auto max-md:!ml-0"
      >
        {/* Global Accessibility & Utility Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar menu"
              className="md:hidden p-2 rounded-xl text-[#1A202C] bg-white border border-blue-100 shadow-xs hover:bg-blue-50 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            <div className="hidden sm:block text-xs font-bold text-[#64748B] uppercase tracking-wider">
              NeuroBridge SaaS · Student Workspace
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <AudioControl showControls={false} />
            <LanguageSelector />
            <DyslexiaToggle />
          </div>
        </div>

        {/* Page Content */}
        <div className="dashboard-content flex-1">
          {renderContent()}
        </div>
      </motion.main>
    </div>
  );
}

function HomeDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isRetaking, setIsRetaking] = useState(false);
  const dashboardData = useDashboardData();

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7 pb-12">
      {/* Header Area */}
      <DashboardHeader onNavigate={onNavigate} />

      {/* Row 1: 3 Compact Status Cards */}
      <DashboardStatusCards
        onNavigate={onNavigate}
        onRetakeAssessment={handleRetakeAssessment}
        isRetaking={isRetaking}
      />

      {/* Row 2: Learning Progress (Wider Left) & Continue Learning (Right) */}
      {/* Responsive layout: mobile shows Recommended Next Step first, Track Progress second */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col">
          <LearningProgressCard onNavigate={onNavigate} dashboardData={dashboardData} />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col">
          <CoursesWidget onNavigate={onNavigate} />
        </div>
      </div>

      {/* Row 3: Modular Workspace Cards (Resume Builder, Opportunities, AI Notebook) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <ResumeBuilderWidget onNavigate={onNavigate} dashboardData={dashboardData} />
        <OpportunitiesWidget onNavigate={onNavigate} />
        <AINotebookWidget onNavigate={onNavigate} />
      </div>

      {/* Row 4: Community & Accessibility Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <CommunityWidget onNavigate={onNavigate} />
        <AccessibilityQuickActions onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// Welcome screen for users who haven't taken assessment yet
function DashboardWelcome({ onStartAssessment }: { onStartAssessment: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center border border-blue-100"
      >
        <div className="text-7xl mb-6">🧠</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A202C] mb-3">
          Welcome to NeuroBridge!
        </h1>
        <p className="text-base sm:text-lg text-[#64748B] mb-8 leading-relaxed">
          Personalize your learning experience by taking our quick interactive assessment.
          <br />
          <span className="text-xs sm:text-sm text-[#94A3B8]">
            It only takes 5-10 minutes and calibrates your cognitive strengths & reading supports.
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-extrabold text-sm text-[#1A202C] mb-1">Personalized</h3>
            <p className="text-xs text-[#64748B]">Tailored to your learning style</p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="font-extrabold text-sm text-[#1A202C] mb-1">Interactive</h3>
            <p className="text-xs text-[#64748B]">Fun activities, not boring tests</p>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-extrabold text-sm text-[#1A202C] mb-1">Fast & Calm</h3>
            <p className="text-xs text-[#64748B]">Complete in just 5 minutes</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
          <button
            onClick={onStartAssessment}
            className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-base shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Start Assessment →
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#475569] rounded-2xl font-bold text-base transition-all"
          >
            Explore First
          </button>
        </div>

        <p className="mt-6 text-xs text-[#94A3B8]">
          💡 You can also take the assessment later from the dashboard profile
        </p>
      </motion.div>
    </div>
  );
}
