import { Palette, Headphones, BookOpenCheck, Target } from 'lucide-react';
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

export function Features() {
  return (
    <div className="flex flex-col w-full">
      {/* Header section */}
      <div className="flex flex-col items-start gap-4 mb-12">
        <div className="border border-[#75A1DF] text-[#306CBE] bg-transparent px-5 py-1.5 rounded-full text-sm font-bold shadow-sm">
          Features
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1A2639] tracking-tight">
          Everything built for the way you think
        </h2>
        <p className="text-[#566B85] text-lg font-medium max-w-2xl leading-relaxed mt-2">
          Tools designed with dyslexic learners at the center — so everyone gets the experience they deserve.
        </p>
      </div>

      {/* Features Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        
        {/* Feature 1 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="bg-[#eff5ff] text-[#4A90E2] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Palette size={28} strokeWidth={2} />
          </div>
          <h3 className="text-[#1A2639] text-xl font-bold mb-4">
            Adaptive UI
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed text-sm">
            Switch instantly between standard and dyslexia-friendly modes. Adjust fonts, spacing, and contrast to match your comfort.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="bg-[#f0fbf8] text-[#38B2AC] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Headphones size={28} strokeWidth={2} />
          </div>
          <h3 className="text-[#1A2639] text-xl font-bold mb-4">
            Audio Learning
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed text-sm">
            Every lesson available in text-to-speech. Learn by listening, speaking, or reading — whatever clicks for you.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="bg-[#fff7ed] text-[#ED8936] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpenCheck size={28} strokeWidth={2} />
          </div>
          <h3 className="text-[#1A2639] text-xl font-bold mb-4">
            Smart Reading Tools
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed text-sm">
            Focus mode, intelligent highlighting, and simplified text keep your attention sharp without overwhelming you.
          </p>
        </motion.div>

        {/* Feature 4 */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="bg-[#fcf5ff] text-[#9F7AEA] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target size={28} strokeWidth={2} />
          </div>
          <h3 className="text-[#1A2639] text-xl font-bold mb-4">
            Skill-Based Opportunities
          </h3>
          <p className="text-[#566B85] font-medium leading-relaxed text-sm">
            Matched to jobs based on what you can do, not the degree you hold. Over 1,200+ inclusive employers and counting.
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
