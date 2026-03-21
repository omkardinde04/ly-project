import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

export function GlobalMap() {
  const { language } = useDyslexia();
  const t = getTranslation(language);

  // Mock data - in production, this would come from backend
  const globalData = [
    { region: 'North America', users: 1250, challenges: ['Reading Speed', 'Focus'], popular: ['Tech', 'Design'] },
    { region: 'Europe', users: 980, challenges: ['Comprehension', 'Memory'], popular: ['Science', 'Arts'] },
    { region: 'Asia', users: 2100, challenges: ['Visual Processing', 'Writing'], popular: ['Engineering', 'Business'] },
    { region: 'South America', users: 650, challenges: ['Audio Processing', 'Spelling'], popular: ['Creative', 'Sports'] },
    { region: 'Africa', users: 420, challenges: ['Reading', 'Concentration'], popular: ['Education', 'Health'] },
    { region: 'Oceania', users: 180, challenges: ['Dyscalculia', 'Dysgraphia'], popular: ['Environment', 'Tourism'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Global Dyslexia Insights</h1>
        <p className="text-gray-600 font-medium">See how learners worldwide are succeeding with NeuroBridge</p>
      </div>

      {/* World Map Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🌍</span>
          <h3 className="text-xl font-bold text-gray-800">Worldwide User Distribution</h3>
        </div>

        {/* Simplified Map Representation */}
        <div className="relative bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl p-8 h-96 overflow-hidden">
          {/* Abstract world map dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-6 gap-8 p-8">
              {globalData.map((data, index) => (
                <motion.div
                  key={data.region}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      data.users > 1000 ? 'bg-red-500' :
                      data.users > 500 ? 'bg-orange-500' :
                      'bg-green-500'
                    } group-hover:scale-150 transition-transform`}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -mt-16 bg-white shadow-lg rounded-lg px-4 py-2 text-xs z-10 whitespace-nowrap">
                    <div className="font-bold">{data.region}</div>
                    <div className="text-gray-600">{data.users.toLocaleString()} users</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-gray-700">1000+ users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-sm font-semibold text-gray-700">500-999 users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-gray-700">&lt;500 users</span>
          </div>
        </div>
      </motion.div>

      {/* Regional Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {globalData.map((data, index) => (
          <motion.div
            key={data.region}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50 hover:border-blue-300 transition-all cursor-pointer"
          >
            {/* Region Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{data.region}</h4>
              <span className="text-2xl">
                {data.region === 'North America' ? '🇺🇸' :
                 data.region === 'Europe' ? '🇪🇺' :
                 data.region === 'Asia' ? '🌏' :
                 data.region === 'South America' ? '🌎' :
                 data.region === 'Africa' ? '🌍' : '🌏'}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Users</span>
                <span className="font-bold text-blue-600">{data.users.toLocaleString()}</span>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Common Challenges:</div>
                <div className="flex flex-wrap gap-2">
                  {data.challenges.map((challenge) => (
                    <span key={challenge} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold">
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Popular Careers:</div>
                <div className="flex flex-wrap gap-2">
                  {data.popular.map((career) => (
                    <span key={career} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-gray-800">Global Trends & Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Most Common Challenges Worldwide
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Reading Speed</span>
                <span className="font-bold text-blue-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-full rounded-full w-[42%]" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Focus & Concentration</span>
                <span className="font-bold text-green-600">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-full rounded-full w-[38%]" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Comprehension</span>
                <span className="font-bold text-purple-600">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-full rounded-full w-[35%]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💼</span>
              Top Career Paths
            </h4>
            <div className="space-y-3">
              {[
                { career: 'Technology & Engineering', percent: 45 },
                { career: 'Creative Arts & Design', percent: 32 },
                { career: 'Business & Entrepreneurship', percent: 28 },
                { career: 'Education & Training', percent: 25 },
              ].map((item) => (
                <div key={item.career}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700 text-sm">{item.career}</span>
                    <span className="font-bold text-orange-600">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Stories Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌟</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Success Stories from Around the World</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4">
                <div className="font-bold text-gray-800 mb-1">Sarah, USA</div>
                <div className="text-sm text-gray-600">Overcame reading challenges → Now a Software Engineer at Google</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="font-bold text-gray-800 mb-1">Raj, India</div>
                <div className="text-sm text-gray-600">Used audio learning → Founded successful startup</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="font-bold text-gray-800 mb-1">Emma, UK</div>
                <div className="text-sm text-gray-600">Visual learner → Award-winning graphic designer</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
