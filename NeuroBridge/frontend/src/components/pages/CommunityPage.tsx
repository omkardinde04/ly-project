import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function CommunityPage() {
  const { language, isDyslexiaMode } = useDyslexia();
  const t = getTranslation(language);

  const pageContent = `Community Platform Overview. Connect with other dyslexic individuals, share experiences, and find support. Features include discussion forums, peer support groups, success stories, expert Q&A sessions, and local meetups. A safe space to share challenges and celebrate achievements.`;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className={`font-black text-gray-800 ${isDyslexiaMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>Community</h1>
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
            Our Community platform provides a supportive environment where individuals with dyslexia can connect, share experiences, and learn from each other.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Discussion Forums
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Topic-based discussions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Ask questions anonymously
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Share strategies and tips
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Get advice from peers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Moderated safe space
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Support Groups
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Age-specific groups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Career-focused groups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Parent support networks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Local meetup coordination
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Community Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Share</div>
                <p className="text-gray-600 text-sm">Your stories and experiences</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">Learn</div>
                <p className="text-gray-600 text-sm">From others' journeys</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Grow</div>
                <p className="text-gray-600 text-sm">Together as a community</p>
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
          Full community platform is under development. We're building a safe, supportive environment for everyone.
        </p>
      </motion.div>
    </div>
  );
}
