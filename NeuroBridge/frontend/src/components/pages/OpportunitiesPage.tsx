import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function OpportunitiesPage() {
  const { language, isDyslexiaMode } = useDyslexia();
  const t = getTranslation(language);

  const pageContent = `Opportunities Platform Overview. Access job listings and career opportunities designed for dyslexic professionals. Features include simplified job descriptions, audio summaries, one-click applications, and accessibility-focused employers. All opportunities are vetted for inclusive workplace culture.`;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h1 className={`font-black text-gray-800 ${isDyslexiaMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>Opportunities</h1>
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
            Our Opportunities platform connects you with dyslexia-friendly employers and career paths that value your unique strengths and thinking style.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Job Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Simplified job descriptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Audio summaries for each position
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Accessibility-focused employers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  One-click application assistance
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Visual company information
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Competitions & Internships
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Hackathons and challenges
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Paid internship programs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Clear eligibility criteria
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Deadline tracking
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Partner Platforms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#0A66C2] mb-2">LinkedIn</div>
                <p className="text-gray-600 text-sm">Professional networking and jobs</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#E93E30] mb-2">Unstop</div>
                <p className="text-gray-600 text-sm">Competitions and internships</p>
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
          Full opportunities platform is under development. We're building partnerships with inclusive employers.
        </p>
      </motion.div>
    </div>
  );
}
