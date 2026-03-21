import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function MyLearning() {
  const { language, dyslexiaLevel } = useDyslexia();
  const t = getTranslation(language);

  // Personalized content based on dyslexia level
  const getCourses = () => {
    const baseCourses = [
      {
        id: 1,
        title: 'Visual Learning Fundamentals',
        description: 'Master concepts through diagrams and visual patterns',
        duration: '2 hours',
        progress: 0,
        icon: '🎨',
      },
      {
        id: 2,
        title: 'Audio-Based Comprehension',
        description: 'Learn through listening and verbal explanations',
        duration: '1.5 hours',
        progress: 0,
        icon: '🎧',
      },
      {
        id: 3,
        title: 'Hands-On Problem Solving',
        description: 'Interactive exercises with real-world applications',
        duration: '3 hours',
        progress: 0,
        icon: '⚡',
      },
    ];

    // Adjust based on severity
    if (dyslexiaLevel === 'severe' || dyslexiaLevel === 'moderate') {
      return baseCourses.map(course => ({
        ...course,
        description: `${course.description} - Simplified for your learning style`,
      }));
    }

    return baseCourses;
  };

  const courses = getCourses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">My Learning</h1>
          <p className="text-gray-600 font-medium">Personalized content for your learning style</p>
        </div>
        <AudioControl 
          text="My Learning section. Personalized courses based on your dyslexia level and preferences." 
          showControls={false} 
        />
      </div>

      {/* Learning Style Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold text-lg text-gray-800">Your Learning Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-blue-600 mb-1">Level</div>
            <div className="font-bold text-gray-800 capitalize">{dyslexiaLevel}</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-green-600 mb-1">Style</div>
            <div className="font-bold text-gray-800">Visual-Auditory</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-purple-600 mb-1">Courses</div>
            <div className="font-bold text-gray-800">{courses.length} Available</div>
          </div>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50 hover:border-blue-200 transition-all"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">{course.icon}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
            
            {/* Description */}
            <p className="text-gray-600 font-medium mb-4 text-sm leading-relaxed">
              {course.description}
            </p>

            {/* Audio Summary */}
            <div className="mb-4">
              <AudioControl text={`${course.title}. ${course.description}`} showControls={true} />
            </div>

            {/* Duration & Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-500">⏱️ {course.duration}</div>
              <div className="text-sm font-semibold text-blue-600">
                {course.progress}% Complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>

            {/* Start Button */}
            <button className="w-full py-3 bg-[#4A90E2] hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md">
              Start Course
            </button>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Recommended For You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">📖 Reading Support</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Text-to-speech enabled</li>
              <li>• Dyslexia-friendly fonts</li>
              <li>• Visual aids included</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-2">🎧 Audio Features</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Narrated lessons</li>
              <li>• Adjustable speed</li>
              <li>• Multi-language support</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
