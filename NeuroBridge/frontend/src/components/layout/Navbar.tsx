import { Link, useLocation } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import brain from "../assets/brain.png";

export function Navbar({ links = [], showLogin = true }: { links?: string[], showLogin?: boolean }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { isDyslexiaMode, toggleDyslexiaMode, language } = useDyslexia();
  const t = getTranslation(language);

  return (
    <nav className={`${isLoginPage ? 'bg-white' : 'bg-white'} shadow`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${isLoginPage ? '' : 'relative'}`}>
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link to="/" className="bg-[#4A90E2] p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
              <img className="h-8 w-8" src={brain} alt="NeuroBridge Logo" />
            </Link>

            <Link to="/" className="flex flex-col leading-tight hover:text-black">
              <span className="text-xl font-bold">NeuroBridge</span>
              <span className="text-xs font-bold text-[#969696]">
                Learning & careers for every brain
              </span>
            </Link>
          </div>

          {/* Dynamic Links (Only on main layout) */}
          {!isLoginPage && (
            <div className="hidden sm:flex items-center absolute left-1/2 transform -translate-x-1/2 gap-8">
              {links.map((link, index) => (
                <a key={index} href="#" className="text-gray-700 hover:text-black font-medium transition-colors">
                  {link}
                </a>
              ))}
            </div>
          )}

          {/* Right Section / Buttons */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            {!isLoginPage && (
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => window.location.reload()} // Simple reload to apply language
                  className="bg-white border-2 border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium focus:border-blue-400 focus:outline-none transition-colors cursor-pointer"
                  aria-label="Select language"
                >
                  <option value="en">🇬🇧 EN</option>
                  <option value="hi">🇮🇳 HI</option>
                  <option value="mr">🇮🇳 MR</option>
                </select>
              </div>
            )}

            {/* Dyslexia Mode Toggle */}
            {!isLoginPage && (
              <button
                onClick={toggleDyslexiaMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                  isDyslexiaMode
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                }`}
                aria-label="Toggle dyslexia mode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="hidden md:inline text-sm">
                  {isDyslexiaMode ? t.on : t.off}
                </span>
              </button>
            )}

            {isLoginPage ? (
              <Link to="/" className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#4A90E2] text-white font-semibold hover:bg-blue-600 transition-colors">
                Go Back
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            ) : (
              showLogin && (
                <Link to="/login" className="px-6 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 transition-colors">
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
