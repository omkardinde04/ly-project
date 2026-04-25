import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';
import { getTranslation } from '../../utils/translations';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onNavigate }: SidebarProps) {
  const { language, resetTest } = useDyslexia();
  const navigate = useNavigate();
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
    { id: 'home', label: t.navHome, icon: '🏠' },
    { id: 'learning', label: t.navLearning, icon: '📚' },
    { id: 'progress', label: t.navProgress, icon: '📊' },
    { id: 'opportunities', label: 'Opportunities', icon: '💼' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { id: 'notebook', label: 'Notebook LLM', icon: '🤖' },
    { id: 'brain', label: 'Research Brain', icon: '🧠' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'accessibility', label: t.navSettings, icon: '⚙️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-blue-100 shadow-sm flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-blue-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#4A90E2] p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-800">NeuroBridge</div>
            <div className="text-xs text-gray-500">Learning Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-[#4A90E2] text-white shadow-md'
                : 'text-gray-700 hover:bg-blue-50'
            }`}
          >
            {item.icon === 'linkedin' ? (
              <svg viewBox="0 0 24 24" className={`w-5 h-5 flex-shrink-0 ${
                activeTab === item.id ? 'fill-white' : 'fill-[#0077B5]'
              }`}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            ) : (
              <span className="text-xl">{item.icon}</span>
            )}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Quick Dyslexia Toggle */}
      <div className="shrink-0 px-4 py-3 bg-[#F4F9FD] border-t border-blue-50">
        <DyslexiaToggle className="shadow-none! border-none! bg-transparent! p-0! w-full! justify-between" />
      </div>

      {/* User Profile Snippet */}
      <div className="shrink-0 p-4 border-t border-blue-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">👤</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">Demo User</div>
            <div className="text-xs text-gray-500">Student Account</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
