import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

export function ProgressTracking() {
  const { language, testScore } = useDyslexia();
  const t = getTranslation(language);

  // Mock data - in real app, this would come from backend
  const progressData = {
    learningTime: 12.5, // hours
    coursesCompleted: 3,
    accuracy: 78,
    weeklyActivity: [45, 52, 38, 65, 58, 72, 68],
    skillGrowth: [
      { skill: 'Reading', level: 65 },
      { skill: 'Comprehension', level: 72 },
      { skill: 'Visual Learning', level: 85 },
      { skill: 'Audio Processing', level: 80 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Track Your Progress</h1>
        <p className="text-gray-600 font-medium">See how far you've come and where you're going</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Time Spent</div>
              <div className="text-2xl font-black text-blue-600">{progressData.learningTime}h</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Completed</div>
              <div className="text-2xl font-black text-green-600">{progressData.coursesCompleted}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Accuracy</div>
              <div className="text-2xl font-black text-purple-600">{progressData.accuracy}%</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600">Assessment Score</div>
              <div className="text-2xl font-black text-orange-600">{testScore || 0}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Activity Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Weekly Activity
        </h3>
        
        <div className="flex items-end justify-between gap-2 h-48">
          {progressData.weeklyActivity.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(value / 100) * 100}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg min-h-[20px]"
              />
              <span className="text-xs font-semibold text-gray-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skill Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          Skill Development
        </h3>

        <div className="space-y-4">
          {progressData.skillGrowth.map((skill, index) => (
            <div key={skill.skill}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">{skill.skill}</span>
                <span className="font-bold text-blue-600">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-bold text-gray-800 text-sm">First Course</div>
            <div className="text-xs text-gray-500">Completed beginner module</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold text-gray-800 text-sm">Quick Learner</div>
            <div className="text-xs text-gray-500">5 hours in one week</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🌟</div>
            <div className="font-bold text-gray-800 text-sm">Perfect Score</div>
            <div className="text-xs text-gray-500">100% on a quiz</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
