import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
// Removed AudioControl import
export function Hero() {
  const navigate = useNavigate();
  const { language } = useDyslexia();
  const t = getTranslation(language);

  return (
    <div className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 shadow-sm mx-auto max-w-7xl mt-4 border border-white/50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Content */}
        <motion.div 
          className="flex flex-col items-start gap-6 lg:pr-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-[#E7F0FD] text-[#306CBE] px-5 py-2 rounded-full text-sm font-extrabold shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {t.inclusiveLearning}
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#1A2639] leading-[1.15] tracking-tight">
            {t.heroTitle}
          </h1>

          {/* Subheading */}
          <p className="text-[#566B85] text-lg font-medium leading-relaxed max-w-xl">
            {t.heroSubtitle}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-2 bg-[#4A90E2] hover:bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {t.getStarted}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white border-2 border-[#E7F0FD] text-[#306CBE] hover:border-[#4A90E2] hover:bg-[#F8FAFC] px-8 py-3.5 rounded-full font-bold transition-all"
            >
              {t.exploreGrowth}
            </motion.button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 w-full pt-6 border-t border-gray-100">
            {/* Stat 1 */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-black text-[#4A90E2] mb-1">92%</div>
                <p className="text-[#566B85] text-sm font-bold leading-tight pr-4">{t.usersReportBetterFocus}</p>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#38B2AC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-black text-[#38B2AC] mb-1">+38%</div>
                <p className="text-[#566B85] text-sm font-bold leading-tight pr-2">{t.confidenceGrowth}</p>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ED8936]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-black text-[#ED8936] mb-1">1,200+</div>
                <p className="text-[#566B85] text-sm font-bold leading-tight">{t.skillBasedOpportunities}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Single Image */}
        <motion.div 
          className="flex justify-center lg:justify-end relative pl-4 lg:pl-0 pt-8 lg:pt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative w-full max-w-md lg:max-w-[480px] group">
            <img 
              src="https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Student learning with focus using technology"
              className="w-full h-auto relative z-10 transition-all duration-500 rounded-2xl shadow-lg"
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
