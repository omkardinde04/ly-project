import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onNavigate }: SidebarProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'learning', label: 'My Learning', icon: '📚' },
    { id: 'progress', label: 'Track Progress', icon: '📊' },
    { id: 'opportunities', label: 'Opportunities', icon: '🚀' },
    { id: 'notebook', label: 'Notebook LLM', icon: '🧠' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: '⚙️' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-blue-100 shadow-sm overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-blue-50">
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
      <nav className="p-4 space-y-2">
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
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile Snippet */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">U</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">User</div>
            <div className="text-xs text-gray-500">View Profile</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
