import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function AboutPage() {
  const { language, isDyslexiaMode } = useDyslexia();
  const t = getTranslation(language);

  const pageContent = `About NeuroBridge. We are dedicated to making education and career opportunities accessible for individuals with dyslexia. Our platform uses evidence-based approaches, text-to-speech technology, and personalized assessments to support neurodiverse learners. Mission: Empower every dyslexic individual to reach their full potential.`;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className={`font-black text-gray-800 ${isDyslexiaMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>About Us</h1>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Our Mission
        </h2>

        <div className={`prose max-w-none ${isDyslexiaMode ? 'text-lg leading-loose' : 'prose-lg'}`}>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            NeuroBridge is committed to creating a more inclusive world for individuals with dyslexia. We believe that with the right tools and support, every person can thrive academically and professionally.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                What We Do
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Provide comprehensive dyslexia assessments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Offer personalized learning recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Connect users with job opportunities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Build supportive communities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  Advocate for accessibility in education
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Our Values
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Inclusivity and accessibility first
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Evidence-based approaches
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  User-centered design
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Privacy and data security
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-1">•</span>
                  Continuous improvement
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Platform Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Assess</div>
                <p className="text-gray-600 text-sm">Comprehensive dyslexia testing</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">Learn</div>
                <p className="text-gray-600 text-sm">Personalized recommendations</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Connect</div>
                <p className="text-gray-600 text-sm">Jobs and community support</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h3>
            <p className="text-gray-700 mb-4">Have questions or feedback? We'd love to hear from you.</p>
            <div className="flex justify-center gap-4">
              <div className="bg-white rounded-xl px-6 py-4 border-2 border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-bold text-blue-600">contact@neurobridge.com</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
