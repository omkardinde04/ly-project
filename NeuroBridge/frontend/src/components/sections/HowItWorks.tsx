import { UserSquare2, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function HowItWorks() {
  return (
    <div className="flex flex-col w-full">
      {/* Header section */}
      <div className="flex flex-col items-start gap-4 mb-12">
        <div className="bg-[#E7F0FD] text-[#306CBE] px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm">
          How It Works
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1A2639] tracking-tight">
          Three simple steps to get started
        </h2>
        <p className="text-[#566B85] text-lg font-medium max-w-2xl leading-relaxed mt-2">
          No complicated setup. NeuroBridge meets you where you are and adapts to how your mind works best.
        </p>
      </div>

      {/* Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        
        {/* Step 1 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-[#F5F9FD] border-2 border-[#DCE8F7] rounded-[32px] p-8 hover:border-[#4A90E2] transition-colors group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-full bg-[#4A90E2] text-white flex items-center justify-center font-black text-lg shadow-md">
              1
            </div>
            <div className="bg-blue-50 text-[#4A90E2] p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <UserSquare2 size={40} className="opacity-80" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-[#1A2639] text-xl font-black mb-4">
            Tell Us About You
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed">
            Personalized onboarding to understand your needs, learning style, and goals — no judgment, just clarity
          </p>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-[#F5F9FD] border-2 border-[#DCE8F7] rounded-[32px] p-8 hover:border-[#4A90E2] transition-colors group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-full bg-[#4A90E2] text-white flex items-center justify-center font-black text-lg shadow-md">
              2
            </div>
            <div className="bg-pink-50 text-[#ED64A6] p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <BookOpen size={40} className="opacity-80" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-[#1A2639] text-xl font-black mb-4">
            Experience Adaptive Learning
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed">
            The interface adjusts automatically for comfort and clarity — fonts, spacing, colors, and pace, all tuned for you.
          </p>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-[#F5F9FD] border-2 border-[#DCE8F7] rounded-[32px] p-8 hover:border-[#4A90E2] transition-colors group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-full bg-[#4A90E2] text-white flex items-center justify-center font-black text-lg shadow-md">
              3
            </div>
            <div className="bg-orange-50 text-[#ED8936] p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp size={40} className="opacity-80" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-[#1A2639] text-xl font-black mb-4">
            Grow & Succeed
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed">
            Build real skills, earn badges, and access opportunities matched to your strengths — not just your grades.
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
