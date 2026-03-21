import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function Opportunities() {
  const { language, dyslexiaLevel } = useDyslexia();
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'jobs' | 'competitions'>('jobs');

  // Mock data - would come from backend in production
  const jobs = [
    {
      id: 1,
      title: 'UX Designer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'Full-time',
      skills: ['Design', 'Figma', 'User Research'],
      deadline: '2024-02-15',
      description: 'Create user-friendly designs for web applications',
      logo: '🎨',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'Hybrid',
      type: 'Full-time',
      skills: ['React', 'TypeScript', 'CSS'],
      deadline: '2024-02-20',
      description: 'Build responsive web interfaces using modern frameworks',
      logo: '💻',
    },
    {
      id: 3,
      title: 'Content Creator',
      company: 'MediaHub',
      location: 'Remote',
      type: 'Part-time',
      skills: ['Writing', 'Video', 'Social Media'],
      deadline: '2024-02-25',
      description: 'Create engaging content for digital platforms',
      logo: '📝',
    },
  ];

  const competitions = [
    {
      id: 1,
      title: 'Global Hackathon 2024',
      organization: 'TechGiant',
      type: 'Hackathon',
      prize: '$10,000',
      deadline: '2024-03-01',
      description: '48-hour coding challenge to solve real-world problems',
      logo: '🏆',
    },
    {
      id: 2,
      title: 'AI Innovation Challenge',
      organization: 'AI Labs',
      type: 'Competition',
      prize: '$5,000',
      deadline: '2024-03-15',
      description: 'Develop innovative AI solutions for accessibility',
      logo: '🤖',
    },
    {
      id: 3,
      title: 'Design Sprint Internship',
      organization: 'Creative Studio',
      type: 'Internship',
      prize: 'Paid Internship',
      deadline: '2024-03-20',
      description: '6-week intensive design program with mentorship',
      logo: '✨',
    },
  ];

  const items = activeTab === 'jobs' ? jobs : competitions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Opportunities</h1>
          <p className="text-gray-600 font-medium">Jobs, internships, and competitions tailored for you</p>
        </div>
        <AudioControl 
          text="Opportunities section. Browse jobs and competitions that match your skills and learning style." 
          showControls={false} 
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-sm border border-blue-50">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-[#4A90E2] text-white shadow-md'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          💼 Jobs
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeTab === 'competitions'
              ? 'bg-[#4A90E2] text-white shadow-md'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          🚀 Competitions
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium">
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-medium">
              <option>All Skills</option>
              <option>Design</option>
              <option>Development</option>
              <option>Content</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{item.logo}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Title & Company/Organization */}
                <div className="mb-3">
                  <h3 className="text-2xl font-black text-gray-800 mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                    <span>{'company' in item ? item.company : item.organization}</span>
                    <span>•</span>
                    <span>{'location' in item ? item.location : item.type}</span>
                    <span>•</span>
                    <span className="text-blue-600">{'prize' in item ? item.prize : item.type}</span>
                  </div>
                </div>

                {/* Description with Audio */}
                <div className="mb-4">
                  <p className="text-gray-700 font-medium mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  <AudioControl 
                    text={`${item.title} at ${'company' in item ? item.company : item.organization}. ${item.description}`} 
                    showControls={true} 
                  />
                </div>

                {/* Key Points */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="font-bold text-gray-800 mb-2 text-sm">Key Information:</div>
                  <ul className="space-y-1">
                    {activeTab === 'jobs' ? (
                      <>
                        <li className="text-sm text-gray-700">• <strong>Role:</strong> {(item as any).title}</li>
                        <li className="text-sm text-gray-700">• <strong>Skills:</strong> {(item as any).skills.join(', ')}</li>
                        <li className="text-sm text-gray-700">• <strong>Deadline:</strong> {(item as any).deadline}</li>
                      </>
                    ) : (
                      <>
                        <li className="text-sm text-gray-700">• <strong>Type:</strong> {(item as any).type}</li>
                        <li className="text-sm text-gray-700">• <strong>Prize:</strong> {(item as any).prize}</li>
                        <li className="text-sm text-gray-700">• <strong>Deadline:</strong> {(item as any).deadline}</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-[#4A90E2] hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md">
                    {activeTab === 'jobs' ? 'Apply Now' : 'Register Now'}
                  </button>
                  <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dyslexia-Friendly Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Dyslexia-Friendly Features</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Audio summaries for every opportunity</li>
              <li>✓ Simplified descriptions with key points highlighted</li>
              <li>✓ Filtered based on your learning profile</li>
              <li>✓ No time pressure - apply at your own pace</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
