import { useLocation, useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, TrendingUp, FileText, Briefcase, Bot, Users, Settings, User, LogOut } from 'lucide-react';

import { getTranslation } from '../../utils/translations';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onNavigate }: SidebarProps) {
  const { language, resetTest } = useDyslexia();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = getTranslation(language);

  const handleLogout = () => {
    // Navigate strictly to Home *first* so Dashboard unmounts
    navigate('/');
    
    // Clear assessment state afterwards to prevent Dashboard's rogue redirect intercept from triggering
    setTimeout(() => {
      resetTest();
    }, 50);
  };

  const menuItems = [
    { id: 'home', label: t.dashboard, icon: LayoutDashboard },
    { id: 'progress', label: t.navProgress, icon: TrendingUp },
    { id: 'resumeBuilder', label: t.resumeBuilder, icon: FileText },
    { id: 'opportunities', label: t.opportunities, icon: Briefcase },
    { id: 'notebook', label: t.notebookLLM, icon: Bot },
    { id: 'community', label: t.community, icon: Users },
    { id: 'accessibility', label: t.navSettings, icon: Settings },
    { id: 'profile', label: t.profile, icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-blue-100 shadow-sm flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#4A90E2] p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-text">NeuroBridge</div>
            <div className="text-xs text-text-muted">{t.learningPlatform}</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'assessment') {
                navigate('/assessment');
              } else if (item.id === 'resumeBuilder') {
                navigate('/dashboard/resume-builder');
              } else if (item.id === 'opportunities') {
                navigate('/dashboard/opportunities');
              } else if (location.pathname.startsWith('/dashboard/resume-builder')) {
                navigate('/dashboard');
              }
              onNavigate(item.id);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-[#4A90E2] text-white shadow-md'
                : 'text-text hover:bg-blue-50'
            }`}
          >
            <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-[#4A90E2]'}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>


      {/* User Profile Snippet */}
      <div 
        className="shrink-0 p-4 border-t border-border bg-surface cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onNavigate('profile')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-50 overflow-hidden">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-[#4A90E2]">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-text text-sm truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-text-muted truncate">Student Account</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Log Out"
            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
