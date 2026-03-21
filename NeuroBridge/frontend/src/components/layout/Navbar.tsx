import { Link, useLocation } from 'react-router-dom';
import brain from "../assets/brain.png";

export function Navbar({ links = [], showLogin = true }: { links?: string[], showLogin?: boolean }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

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
          <div className="flex items-center">
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
