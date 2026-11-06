import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoIcon } from '../ui/LogoIcon';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { AudioControl } from '../ui/AudioControl';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';
import { FunModeMenu } from '../ui/FunModeMenu';
import { Menu, X, ArrowRight } from 'lucide-react';

/**
 * Responsive layout (nothing ever overflows the row):
 *   < sm   : logo · Get Started · ☰                (everything else in the drawer)
 *   sm–lg  : logo · 🌙 · Log in · Get Started · ☰
 *   lg–xl  : logo · nav links · 🌙 · Log in · Get Started · ☰  (Listen / Fun mode in the drawer)
 *   xl+    : logo · nav links · Listen · 🌙 · Fun mode · Log in · Get Started
 *   2xl+   : + tagline under the logo
 *
 * Visually the bar has no box: it is transparent with a frosted blur of the
 * page behind it, fading out at the bottom edge.
 */
export function Navbar({
  links = ['Home', 'Games', 'Courses', 'Assessment', 'Community', 'About'],
  showLogin = true,
}: {
  links?: string[];
  showLogin?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const { isDarkMode } = useDyslexia();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (link: string) => {
    setMobileMenuOpen(false);
    const routeMap: Record<string, string> = {
      Home: '/',
      Learn: '/learn',
      'Chrome Extension': '/chrome-extension',
      Games: '/learn',
      Courses: '/courses',
      Assessment: '/assessment',
      Community: '/community',
      About: '/about',
    };
    if (routeMap[link]) {
      navigate(routeMap[link]);
    }
  };

  const isActiveLink = (link: string) =>
    (link === 'Home' && location.pathname === '/') ||
    (link === 'Chrome Extension' && location.pathname.startsWith('/chrome-extension')) ||
    ((link === 'Games' || link === 'Learn') && location.pathname.startsWith('/learn')) ||
    (link === 'Courses' && location.pathname.startsWith('/courses')) ||
    (link === 'Assessment' && location.pathname.startsWith('/assessment')) ||
    (link === 'Community' && location.pathname.startsWith('/community')) ||
    (link === 'About' && location.pathname.startsWith('/about'));

  const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40';

  return (
    <header
      className={`sticky top-0 z-40 isolate transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Frosted-glass backdrop: no border, no shadow, no solid box. It extends a
          little below the bar and fades out, so the bar melts into the page. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -bottom-6 -z-10 backdrop-blur-xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,black_calc(100%_-_1.5rem),transparent)] ${
          mobileMenuOpen
            ? isDarkMode
              ? 'bg-[#0B1120]/85'
              : 'bg-white/85'
            : isDarkMode
              ? 'bg-[#0B1120]/45'
              : 'bg-white/45'
        }`}
      />
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 gap-3 lg:gap-4">
          {/* 1. Brand */}
          <div className="flex items-center min-w-0 shrink-0">
            <Link to="/" className={`flex items-center gap-2.5 sm:gap-3 group rounded-xl ${focusRing}`}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <LogoIcon className="w-full h-full" />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-black text-lg sm:text-xl tracking-tight transition-colors leading-none whitespace-nowrap ${
                    isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-[#2563EB]'
                  }`}
                >
                  NeuroBridge
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase hidden 2xl:block mt-1 whitespace-nowrap ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Accessible learning for every brain
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Navigation links (lg+) */}
          {!isLoginPage && (
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0" aria-label="Main">
              {links.map((link) => {
                const isActive = isActiveLink(link);
                return (
                  <button
                    key={link}
                    type="button"
                    data-jarvis-id={`nav-${link.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleNavigation(link)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${focusRing} ${
                      isActive
                        ? isDarkMode
                          ? 'bg-blue-950/80 text-blue-300 shadow-2xs'
                          : 'bg-blue-50 text-[#2563EB] shadow-2xs'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link}
                  </button>
                );
              })}
            </nav>
          )}

          {/* 3. Utilities + auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Full utility cluster only where there is room for it */}
            <div className="hidden xl:flex items-center gap-2">
              <AudioControl showControls={false} />
              <DarkModeToggle />
              <DyslexiaToggle />
            </div>
            {/* Theme toggle stays one tap away on smaller screens */}
            <span className="hidden sm:inline-flex xl:hidden">
              <DarkModeToggle />
            </span>

            {isLoginPage ? (
              <Link
                to="/"
                data-jarvis-id="nav-go-back"
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors shadow-2xs ${focusRing} ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}
              >
                Go Back
              </Link>
            ) : (
              showLogin && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login"
                    data-jarvis-id="nav-login"
                    className={`hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${focusRing} ${
                      isDarkMode
                        ? 'text-slate-200 hover:text-white hover:bg-slate-800'
                        : 'text-slate-700 hover:text-[#2563EB] hover:bg-slate-50'
                    }`}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/assessment"
                    data-jarvis-id="get-started"
                    className={`px-3.5 sm:px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${focusRing}`}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )
            )}

            {/* Menu button: shown until every control fits in the bar (xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-2 rounded-xl transition-colors cursor-pointer ${focusRing} ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer (below xl) */}
      {mobileMenuOpen && (
        <div
          className={`xl:hidden px-4 sm:px-6 pt-2 pb-6 space-y-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        >
          {/* Links already sit in the bar from lg up */}
          <div className="space-y-1 lg:hidden">
            {links.map((link) => {
              const isActive = isActiveLink(link);
              return (
                <button
                  key={link}
                  type="button"
                  onClick={() => handleNavigation(link)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${focusRing} ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-950/80 text-blue-300'
                        : 'bg-blue-50 text-[#2563EB]'
                      : isDarkMode
                        ? 'text-slate-200 hover:bg-slate-800'
                        : 'text-[#1A202C] hover:bg-blue-50 hover:text-[#2563EB]'
                  }`}
                >
                  {link}
                </button>
              );
            })}
          </div>

          <div className={`pt-3 border-t lg:border-t-0 lg:pt-0 flex flex-col gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {/* Accessibility & reading tools */}
            <div className="flex flex-wrap items-center gap-2">
              <AudioControl showControls={false} />
              <span className="inline-flex sm:hidden">
                <DarkModeToggle />
              </span>
            </div>

            <div className={`max-w-sm rounded-2xl border p-4 ${isDarkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
              <FunModeMenu variant="inline" />
            </div>

            {!isLoginPage && showLogin && (
              <div className="flex gap-2 pt-1 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-bold ${
                    isDarkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-[#1A202C] hover:bg-slate-50'
                  }`}
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
