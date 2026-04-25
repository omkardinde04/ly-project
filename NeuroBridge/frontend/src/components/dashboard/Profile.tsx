import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { AudioControl } from '../ui/AudioControl';
import { LinkedInConnect } from './LinkedInConnect';


export function Profile() {
  const { dyslexiaLevel, testScore } = useDyslexia();
  
  const [formData, setFormData] = useState({
    location: '',
    city: '',
    interests: '',
    skills: '',
    excitedAbout: '',
    learningStyle: 'visual',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, save to backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600 font-medium">Complete your profile to personalize your experience</p>
      </div>

      {/* LinkedIn Connect Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-lg font-black text-gray-700 flex items-center gap-2">
          <span>💼</span> Connected Accounts
        </h2>
        <LinkedInConnect />
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-4xl font-bold">U</span>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-1">User Profile</h2>
            <div className="flex items-center gap-3 text-sm font-medium justify-center flex-wrap">
              <span>📊 Assessment Score: {testScore}</span>
              <span>•</span>
              <span>🎯 Level: {dyslexiaLevel}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center bg-white/10 rounded-full shadow-inner p-1 backdrop-blur-xs border border-white/20">
          <AudioControl 
            text={`Your profile shows your dyslexia level as ${dyslexiaLevel} with a score of ${testScore}. Complete the form below to personalize your experience.`} 
            showControls={true} 
          />
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Profile Completion</h3>
          <span className="font-bold text-blue-600">40%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 to-purple-500 h-full rounded-full w-[40%]" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Complete all fields to unlock personalized recommendations</p>
      </motion.div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h3 className="text-xl font-bold text-gray-800">Location</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your country"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter your city"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium"
              />
            </div>
          </div>
        </motion.div>

        {/* Interests & Hobbies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎨</span>
            <h3 className="text-xl font-bold text-gray-800">Interests & Hobbies</h3>
          </div>
          
          <textarea
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            placeholder="What are you passionate about? (e.g., art, technology, music, sports)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none font-medium min-h-[100px]"
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            {['Design', 'Coding', 'Writing', 'Music', 'Gaming', 'Photography'].map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setFormData({ 
                  ...formData, 
                  interests: formData.interests ? `${formData.interests}, ${tag}` : tag 
                })}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚡</span>
            <h3 className="text-xl font-bold text-gray-800">Skills</h3>
          </div>
          
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="List your current skills (e.g., communication, problem-solving, design)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none font-medium"
          />
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '💬', label: 'Communication' },
              { icon: '🧩', label: 'Problem Solving' },
              { icon: '🎨', label: 'Creativity' },
              { icon: '👥', label: 'Teamwork' },
              { icon: '💻', label: 'Technical' },
              { icon: '✍️', label: 'Writing' },
            ].map((skill) => (
              <button
                type="button"
                key={skill.label}
                className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
              >
                <span>{skill.icon}</span>
                <span className="text-sm">{skill.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* What Excites You */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌟</span>
            <h3 className="text-xl font-bold text-gray-800">What Excites You Most?</h3>
          </div>
          
          <textarea
            value={formData.excitedAbout}
            onChange={(e) => setFormData({ ...formData, excitedAbout: e.target.value })}
            placeholder="Tell us what motivates you and what you're most excited to learn or achieve..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-medium min-h-[100px]"
          />
        </motion.div>

        {/* Learning Style Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📚</span>
            <h3 className="text-xl font-bold text-gray-800">Preferred Learning Style</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'visual', icon: '👁️', label: 'Visual', desc: 'Learn through images and diagrams' },
              { id: 'auditory', icon: '🎧', label: 'Auditory', desc: 'Learn through listening and audio' },
              { id: 'kinesthetic', icon: '✋', label: 'Hands-On', desc: 'Learn by doing and practicing' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setFormData({ ...formData, learningStyle: style.id })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.learningStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-4xl mb-3">{style.icon}</div>
                <div className="font-bold text-gray-800 mb-1">{style.label}</div>
                <div className="text-sm text-gray-600">{style.desc}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          type="submit"
          className="w-full py-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105"
        >
          💾 Save Profile
        </motion.button>
      </form>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Privacy & Security</h4>
            <p className="text-sm text-gray-700">
              Your information is kept private and secure. We only use this data to personalize your learning experience. 
              You can update or delete your information at any time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
