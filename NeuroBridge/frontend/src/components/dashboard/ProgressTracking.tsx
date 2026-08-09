import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { 
  Clock, CheckCircle, Target, Briefcase, FileText, Send,
  TrendingUp, Award, Star, Zap, BookOpen
} from 'lucide-react';

export function ProgressTracking() {
  const { cognitiveProfile } = useDyslexia();

  // Calculate average from cognitive profile if available
  const averageAccuracy = cognitiveProfile 
    ? Math.round(Object.values(cognitiveProfile).reduce((sum: number, val: number) => sum + val, 0) / 6)
    : 0;

  // Mock data combined with dynamic stats
  const progressData = {
    learningTime: 12.5, // hours
    coursesCompleted: 3,
    accuracy: averageAccuracy || 75,
    opportunitiesMatched: 45,
    jobsApplied: 12,
    resumeScore: 85,
    weeklyActivity: [45, 52, 38, 65, 58, 72, 68],
    skillGrowth: cognitiveProfile ? [
      { skill: 'Phonological', level: cognitiveProfile.phonological },
      { skill: 'Visual Attention', level: cognitiveProfile.visual },
      { skill: 'Working Memory', level: cognitiveProfile.workingMemory },
      { skill: 'Processing Speed', level: cognitiveProfile.processingSpeed },
    ] : [
      { skill: 'Reading Comprehension', level: 65 },
      { skill: 'Pattern Recognition', level: 72 },
      { skill: 'Visual Learning', level: 85 },
      { skill: 'Problem Solving', level: 80 },
    ],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Track Your Progress</h1>
        <p className="text-text-muted font-medium">See how far you've come in your learning and career journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Learning Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <BookOpen size={20} className="text-[#4A90E2]" />
              Learning Progress
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={16} /> <span className="text-sm font-semibold">Time Spent</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.learningTime}h</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <CheckCircle size={16} /> <span className="text-sm font-semibold">Completed</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.coursesCompleted}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <Target size={16} /> <span className="text-sm font-semibold">Accuracy</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.accuracy}%</div>
            </div>
          </div>
        </motion.div>

        {/* Career Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Briefcase size={20} className="text-[#4A90E2]" />
              Career Readiness
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <Zap size={16} /> <span className="text-sm font-semibold">Matched</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.opportunitiesMatched}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <Send size={16} /> <span className="text-sm font-semibold">Applied</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.jobsApplied}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-muted">
                <FileText size={16} /> <span className="text-sm font-semibold">Resume Score</span>
              </div>
              <div className="text-3xl font-black text-text">{progressData.resumeScore}%</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Activity Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <TrendingUp size={20} className="text-[#4A90E2]" />
              Weekly Activity
            </h3>
          </div>
          
          <div className="p-6 flex items-end justify-between gap-3 h-64">
            {progressData.weeklyActivity.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / 100) * 100}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-[#4A90E2] rounded-t-md min-h-[20px] max-w-[40px] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  title={`${value} activity points`}
                />
                <span className="text-xs font-semibold text-text-muted">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skill Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <Award size={20} className="text-[#4A90E2]" />
              Skill Development
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {progressData.skillGrowth.map((skill, index) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-text text-sm">{skill.skill}</span>
                  <span className="font-bold text-text text-sm">{skill.level}%</span>
                </div>
                <div className="w-full bg-blue-50 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                    className="h-full rounded-full bg-[#4A90E2]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <Star size={20} className="text-[#4A90E2]" />
            Recent Achievements
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
              <Award size={24} className="text-yellow-600" />
            </div>
            <div>
              <div className="font-bold text-text text-sm">First Course</div>
              <div className="text-xs text-text-muted">Completed beginner module</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Zap size={24} className="text-[#4A90E2]" />
            </div>
            <div>
              <div className="font-bold text-text text-sm">Quick Learner</div>
              <div className="text-xs text-text-muted">5 hours in one week</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <div className="font-bold text-text text-sm">Perfect Profile</div>
              <div className="text-xs text-text-muted">Completed assessment</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}