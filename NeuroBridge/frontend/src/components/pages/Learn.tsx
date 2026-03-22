import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function Learn() {
  const { language, isDyslexiaMode } = useDyslexia();
  const t = getTranslation(language);

  const pageContent = `Learning Platform Overview. Our learning section provides personalized educational content tailored for dyslexic learners. Features include audio-supported lessons, visual learning aids, self-paced courses, and progress tracking. All content is available in English, Hindi, and Marathi with text-to-speech narration.`;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h1 className={`font-black text-gray-800 ${isDyslexiaMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>Learn</h1>
        </div>
        <AudioControl text={pageContent} showControls={true} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-100"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What This Offers
        </h2>

        <div className={`prose max-w-none ${isDyslexiaMode ? 'text-lg leading-loose' : 'prose-lg'}`}>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Our Learning platform is designed specifically for individuals with dyslexia, making education more accessible and effective through multi-sensory approaches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Audio-supported lessons in all languages
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Visual learning aids and illustrations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Self-paced course progression
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Dyslexia-friendly fonts and spacing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Interactive exercises with instant feedback
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Learning Methods
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Phonics-based reading instruction
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Multisensory learning techniques
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Gamified learning experiences
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Personalized learning paths
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Course Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Reading</div>
                <p className="text-gray-600 text-sm">Phonics, comprehension, fluency</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">Writing</div>
                <p className="text-gray-600 text-sm">Spelling, grammar, composition</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Math</div>
                <p className="text-gray-600 text-sm">Numbers, problem-solving</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="font-bold text-lg text-gray-800">Coming Soon</h4>
        </div>
        <p className="text-gray-700">
          Full learning platform functionality is under development. We're building truly accessible educational content.
        </p>
      </motion.div>
    </div>
  );
}
