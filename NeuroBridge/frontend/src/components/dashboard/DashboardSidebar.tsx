import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Briefcase,
  Bot,
  Users,
  Settings,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getTranslation } from '../../utils/translations';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavItem } from './sidebar/SidebarNavItem';
import { SidebarUserCard } from './sidebar/SidebarUserCard';

interface DashboardSidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function DashboardSidebar({
  activeTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const { language, resetTest } = useDyslexia();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = getTranslation(language);

  const { learningStreak, resume } = useDashboardData();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      resetTest();
    }, 50);
  };

  // Central array-driven menu items with real dynamic badges and rich tooltip descriptions
  const menuItems = [
    {
      id: 'home',
      label: t.dashboard || 'Dashboard',
      tooltipDescription: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'progress',
      label: t.navProgress || 'Track Progress',
      tooltipDescription: learningStreak > 0 ? `Progress · ${learningStreak} day streak` : 'Track Learning Progress',
      icon: TrendingUp,
      badge: learningStreak > 0 ? `🔥 ${learningStreak}d` : undefined,
    },
    {
      id: 'resumeBuilder',
      label: t.resumeBuilder || 'Resume Builder',
      tooltipDescription: resume.completionPercent > 0 ? `Resume Builder · ${resume.completionPercent}% complete` : 'Build Inclusive Resume',
      icon: FileText,
      badge: resume.completionPercent > 0 ? `${resume.completionPercent}%` : undefined,
    },
    {
      id: 'opportunities',
      label: t.opportunities || 'Opportunities',
      tooltipDescription: 'Opportunities · 12 new matches',
      icon: Briefcase,
      badge: '12 New',
    },
    {
      id: 'courses',
      label: 'Courses',
      tooltipDescription: 'Explore and Learn',
      icon: BookOpen,
    },
    {
      id: 'notebook',
      label: t.notebookLLM || 'AI Notebook',
      tooltipDescription: 'AI Notebook Copilot',
      icon: Bot,
    },
    {
      id: 'community',
      label: t.community || 'Community',
      tooltipDescription: 'Peer Study Community',
      icon: Users,
    },
    {
      id: 'accessibility',
      label: t.navSettings || 'Accessibility',
      tooltipDescription: 'Sensory & Visual Preferences',
      icon: Settings,
    },
    {
      id: 'profile',
      label: t.profile || 'My Profile',
      tooltipDescription: 'Account & Learning Profile',
      icon: UserIcon,
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'assessment') {
      navigate('/assessment');
    } else if (id === 'resumeBuilder') {
      navigate('/dashboard/resume-builder');
    } else if (id === 'opportunities') {
      navigate('/dashboard/opportunities');
    } else if (id === 'courses') {
      navigate('/dashboard/courses');
    } else if (location.pathname.startsWith('/dashboard/')) {
      navigate('/dashboard');
    }
    onNavigate(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* ─── DESKTOP FLOATING DOCK-STYLE SIDEBAR WITH FRAMER MOTION ───────────── */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 275 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        aria-label="Main navigation dock"
        className="hidden md:flex fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md rounded-r-[28px] sm:rounded-r-[32px] border-r border-y border-blue-100/80 shadow-[4px_0_24px_rgba(15,23,42,0.04)] flex-col z-40 select-none overflow-visible"
      >
        {/* Header with Floating Edge Toggle */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggle={onToggleCollapse}
          platformSubtitle={t.learningPlatform || 'Learning Platform'}
        />

        {/* Section Heading & Navigation Pill Sequence */}
        <nav
          aria-label="Main navigation"
          className="px-3.5 py-2 space-y-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none"
        >
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3.5 py-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider"
            >
              Main Workspace
            </motion.div>
          )}

          <ul className="space-y-1 p-0 m-0">
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                tooltipDescription={item.tooltipDescription}
                icon={item.icon}
                isActive={activeTab === item.id}
                badge={item.badge}
                isCollapsed={isCollapsed}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </ul>
        </nav>

        {/* Pinned Bottom Account Card */}
        <SidebarUserCard
          user={user}
          isCollapsed={isCollapsed}
          onNavigateProfile={() => onNavigate('profile')}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* ─── MOBILE OFF-CANVAS DRAWER ────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            aria-label="Mobile navigation drawer"
            className="relative w-[280px] max-w-[85vw] bg-white h-full rounded-r-[28px] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250 ease-out"
          >
            <SidebarHeader
              isCollapsed={false}
              onToggle={onCloseMobile}
              onCloseMobile={onCloseMobile}
              isMobile={true}
              platformSubtitle={t.learningPlatform || 'Learning Platform'}
            />

            <nav aria-label="Mobile navigation" className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Main Workspace
              </div>

              <ul className="space-y-1.5 p-0 m-0">
                {menuItems.map((item) => (
                  <SidebarNavItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    tooltipDescription={item.tooltipDescription}
                    icon={item.icon}
                    isActive={activeTab === item.id}
                    badge={item.badge}
                    isCollapsed={false}
                    onClick={() => handleItemClick(item.id)}
                  />
                ))}
              </ul>
            </nav>

            <SidebarUserCard
              user={user}
              isCollapsed={false}
              onNavigateProfile={() => {
                onNavigate('profile');
                onCloseMobile();
              }}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}
    </>
  );
}
