import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Settings,
  MapPin,
  RotateCcw,
  Home,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useRetakeAssessment } from '../../hooks/useRetakeAssessment';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = getTranslation(language);

  const { learningStreak } = useDashboardData();
  const { retakeAssessment, isRetaking } = useRetakeAssessment();

  // Sign out fully: clear the login session so public pages show "Log in" again
  // Leave the protected dashboard first, otherwise clearing the session makes
  // the route guard bounce to /login instead of the homepage.
  const handleLogout = () => {
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
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
      label: t.navGameZone || 'Game Zone',
      tooltipDescription: learningStreak > 0 ? `Game Zone · ${learningStreak} day streak` : 'Practice games and challenge peers',
      icon: Gamepad2,
      badge: learningStreak > 0 ? `🔥 ${learningStreak}d` : undefined,
    },
    {
      id: 'community',
      label: t.community || 'Community',
      tooltipDescription: 'Peer Study Community',
      icon: Users,
    },
    {
      id: 'nearby',
      label: 'Nearby Care',
      tooltipDescription: 'Hospitals, psychiatrists & support near you',
      icon: MapPin,
    },
    {
      id: 'settings',
      label: t.navSettings || 'Settings',
      tooltipDescription: 'Profile & accessibility preferences',
      icon: Settings,
    },
  ];

  // Actions that leave the dashboard
  const extraItems = [
    {
      id: 'retake-test',
      label: isRetaking ? 'Resetting…' : 'Retake test',
      tooltipDescription: 'Take the assessment again',
      icon: RotateCcw,
    },
    {
      id: 'homepage',
      label: 'Homepage',
      tooltipDescription: 'Go to the homepage',
      icon: Home,
    },
  ];

  const handleExtraClick = (id: string) => {
    if (isMobileOpen) onCloseMobile();
    if (id === 'homepage') {
      navigate('/');
      return;
    }
    if (id === 'retake-test' && !isRetaking) {
      const ok = window.confirm('Retake the test? Your current result will be replaced by the new one.');
      if (ok) void retakeAssessment();
    }
  };

  const handleItemClick = (id: string) => {
    if (id === 'assessment') {
      navigate('/assessment');
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

          {!isCollapsed && (
            <div className="px-3.5 pt-4 pb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              More
            </div>
          )}
          <ul className={`space-y-1 p-0 m-0 ${isCollapsed ? 'pt-3 mt-2 border-t border-slate-100' : ''}`}>
            {extraItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                tooltipDescription={item.tooltipDescription}
                icon={item.icon}
                isActive={false}
                isCollapsed={isCollapsed}
                onClick={() => handleExtraClick(item.id)}
              />
            ))}
          </ul>
        </nav>

        {/* Pinned Bottom Account Card */}
        <SidebarUserCard
          user={user}
          isCollapsed={isCollapsed}
          onNavigateProfile={() => onNavigate('settings')}
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

              <div className="px-3.5 pt-4 pb-1.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                More
              </div>
              <ul className="space-y-1.5 p-0 m-0">
                {extraItems.map((item) => (
                  <SidebarNavItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    tooltipDescription={item.tooltipDescription}
                    icon={item.icon}
                    isActive={false}
                    isCollapsed={false}
                    onClick={() => handleExtraClick(item.id)}
                  />
                ))}
              </ul>
            </nav>

            <SidebarUserCard
              user={user}
              isCollapsed={false}
              onNavigateProfile={() => {
                onNavigate('settings');
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
