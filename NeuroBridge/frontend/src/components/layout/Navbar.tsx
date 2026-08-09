import { Link, useLocation, useNavigate } from 'react-router-dom';
import brain from "../assets/brain.png";
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { AudioControl } from '../ui/AudioControl';

export function Navbar({ links = [], showLogin = true }: { links?: string[], showLogin?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const { isDyslexiaMode, toggleDyslexiaMode, language, setLanguage } = useDyslexia();

  const handleNavigation = (link: string) => {
    const routeMap: Record<string, string> = {
      'Home': '/',
      'Learn': '/learn',
      'Opportunities': '/opportunities',
      'Community': '/community',
      'About': '/about',
    };
    if (routeMap[link]) {
      navigate(routeMap[link]);
    }
  };

  return (
    <nav className={`${isLoginPage ? 'bg-surface' : 'bg-surface'} shadow`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-[#4A90E2] p-2.5 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img src={brain} alt="NeuroBridge Logo" className="w-7 h-7" />
              </div>
              <span className="flex flex-col">
                <span className="font-black text-2xl text-text tracking-tight group-hover:text-black transition-colors">
                  NeuroBridge
                </span>
                <span className="text-[11px] font-bold text-text-muted tracking-wide uppercase hidden xl:block">
                  Learning & careers for every brain
                </span>
              </span>
            </Link>
          </div>

          {/* Dynamic Links (Only on main layout) */}
          {!isLoginPage && (
            <div className={`hidden lg:flex flex-1 justify-center items-center mx-2 min-w-0 ${
              isDyslexiaMode ? 'gap-2 xl:gap-5' : 'gap-4 xl:gap-8'
            }`}>
              {links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(link)}
                  className={`text-text hover:text-black font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isDyslexiaMode ? 'text-[13px] xl:text-base' : 'text-base'
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          )}

          {/* Right Section / Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Accessibility Bar */}
            <div className="hidden lg:flex items-center gap-3 mr-1">
              <AudioControl text="Welcome to NeuroBridge. Navigate through our learning platform, assessments, and community features." showControls={false} />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as 'en'|'hi'|'mr');
                  if (location.pathname === '/') window.location.reload();
                }}
                className="bg-surface border-2 border-border text-text px-3 py-1.5 rounded-lg text-sm font-medium focus:border-blue-400 focus:outline-none transition-colors cursor-pointer"
                aria-label="Select language"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="hi">🇮🇳 HI</option>
                <option value="mr">🇮🇳 MR</option>
              </select>

              <div className="flex items-center gap-2 xl:gap-3 bg-surface-2 px-3 py-1.5 rounded-full border border-border">
                <span className="text-text font-bold text-sm flex items-center gap-1.5 whitespace-nowrap">
                  <span className="hidden xl:inline">Dyslexia Mode</span><span className="xl:hidden">Dyslexia</span>
                </span>
                <button
                  onClick={toggleDyslexiaMode}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${isDyslexiaMode ? 'bg-blue-600' : 'bg-[#CBD5E1]'
                    }`}
                  aria-label="Toggle dyslexia mode"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDyslexiaMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>

            {isLoginPage ? (
              <Link to="/" className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-blue-700 transition-colors shadow-sm">
                Go Back
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            ) : (
              showLogin && (
                <Link to="/login" className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Login
                </Link>
              )
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
