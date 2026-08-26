import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoIcon } from '../ui/LogoIcon';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { AudioControl } from '../ui/AudioControl';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Navbar({
  links = ['Home', 'Learn', 'Opportunities', 'Community', 'About'],
  showLogin = true,
}: {
  links?: string[];
  showLogin?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const { isDyslexiaMode, toggleDyslexiaMode } = useDyslexia();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (link: string) => {
    setMobileMenuOpen(false);
    const routeMap: Record<string, string> = {
      Home: '/',
      Learn: '/learn',
      Opportunities: '/opportunities',
      Community: '/community',
      About: '/about',
    };
    if (routeMap[link]) {
      navigate(routeMap[link]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100/80 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex justify-between items-center h-18 gap-4">
          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <LogoIcon className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-[#1A202C] tracking-tight group-hover:text-[#2563EB] transition-colors leading-none">
                  NeuroBridge
                </span>
                <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase hidden sm:block mt-1">
                  Learning & careers for every brain
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Center: Navigation Links (Desktop) */}
          {!isLoginPage && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {links.map((link) => {
                const isActive =
                  (link === 'Home' && location.pathname === '/') ||
                  (link === 'Learn' && location.pathname.startsWith('/learn')) ||
                  (link === 'Opportunities' && location.pathname.startsWith('/opportunities')) ||
                  (link === 'Community' && location.pathname.startsWith('/community')) ||
                  (link === 'About' && location.pathname.startsWith('/about'));

                return (
                  <button
                    key={link}
                    type="button"
                    onClick={() => handleNavigation(link)}
                    className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-[#2563EB] shadow-2xs'
                        : 'text-[#64748B] hover:text-[#1A202C] hover:bg-slate-50'
                    }`}
                  >
                    {link}
                  </button>
                );
              })}
            </nav>
          )}

          {/* 3. Right: Utility Controls & CTAs with generous spacing */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pr-1">
            <div className="hidden md:flex items-center gap-2">
              <AudioControl showControls={false} />
              <DarkModeToggle />
              <LanguageSelector />
              <DyslexiaToggle />
            </div>

            {/* Auth Buttons */}
            {isLoginPage ? (
              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[#1A202C] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Go Back
              </Link>
            ) : (
              showLogin && (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#1A202C] hover:text-[#2563EB] hover:bg-slate-50 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/assessment"
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#1A202C] hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {links.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => handleNavigation(link)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-[#1A202C] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
              >
                {link}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A202C]">Dyslexia Font</span>
              <button
                type="button"
                onClick={toggleDyslexiaMode}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  isDyslexiaMode ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    isDyslexiaMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-[#1A202C] hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/assessment"
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-center text-xs font-bold text-white shadow-xs"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
