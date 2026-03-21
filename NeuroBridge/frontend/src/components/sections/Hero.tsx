import heroImage from '../assets/HeroImage.png';
import { motion } from 'framer-motion';
export function Hero() {
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
            className="bg-[#E7F0FD] text-[#306CBE] px-5 py-2 rounded-full text-sm font-extrabold shadow-sm"
          >
            Inclusive learning for dyslexic and general users
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#1A2639] leading-[1.15] tracking-tight">
            A calm, clear platform to learn skills and unlock careers confidently.
          </h1>

          {/* Subheading */}
          <p className="text-[#566B85] text-lg font-medium leading-relaxed max-w-xl">
            ClearPath replaces text-heavy friction with visual learning, assistive tools, and opportunity matching designed for the way you think.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-[#4A90E2] hover:bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white border-2 border-[#E7F0FD] text-[#306CBE] hover:border-[#4A90E2] hover:bg-[#F8FAFC] px-8 py-3.5 rounded-full font-bold transition-all"
            >
              Explore Growth
            </motion.button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 w-full pt-6 border-t border-gray-100">
            {/* Stat 1 */}
            <div>
              <div className="text-3xl font-black text-[#4A90E2] mb-1">92%</div>
              <p className="text-[#566B85] text-sm font-bold leading-tight pr-4">users report better <br className="hidden sm:block"/>focus</p>
            </div>
            {/* Stat 2 */}
            <div>
              <div className="text-3xl font-black text-[#38B2AC] mb-1">+38%</div>
              <p className="text-[#566B85] text-sm font-bold leading-tight pr-2">confidence growth <br className="hidden sm:block"/>in 4 weeks</p>
            </div>
            {/* Stat 3 */}
            <div>
              <div className="text-3xl font-black text-[#ED8936] mb-1">1,200+</div>
              <p className="text-[#566B85] text-sm font-bold leading-tight">skill-based <br className="hidden sm:block"/>opportunities</p>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Shaped Image Stack */}
        {/* Right Content - Single Image */}
        <motion.div 
          className="flex justify-center lg:justify-end relative pl-4 lg:pl-0 pt-8 lg:pt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative w-full max-w-md lg:max-w-[480px] group">

            {/* Unified Hero Image */}
            <img 
              src={heroImage}
              alt="Student learning confidently"
              className="
                w-full h-auto
                relative
                z-10
                transition-all duration-500
              "
            />

        

          </div>
        </motion.div>

      </div>
    </div>
  );
}
