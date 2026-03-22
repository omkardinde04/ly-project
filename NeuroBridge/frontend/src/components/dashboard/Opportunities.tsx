import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';

export function Opportunities() {
  const { language, dyslexiaLevel } = useDyslexia();
  const t = getTranslation(language);
  const [activeSection, setActiveSection] = useState<'overview' | 'linkedin' | 'unstop'>('overview');
  const [dyslexiaModeEnabled, setDyslexiaModeEnabled] = useState(false);

  // LinkedIn Jobs Data
  const linkedInJobs = [
    {
      id: 1,
      title: 'UX Designer',
      company: 'Microsoft',
      location: 'Remote',
      type: 'Full-time',
      posted: '2 days ago',
      applicants: 45,
      description: 'Design user experiences for accessibility-focused products. Work with cross-functional teams to create inclusive designs.',
      skills: ['Figma', 'User Research', 'Prototyping'],
      logo: '🔵',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Google',
      location: 'Hybrid - Mountain View',
      type: 'Full-time',
      posted: '1 day ago',
      applicants: 120,
      description: 'Build accessible web applications using React and modern JavaScript. Focus on performance and inclusivity.',
      skills: ['React', 'TypeScript', 'CSS'],
      logo: '🔴',
    },
    {
      id: 3,
      title: 'Content Strategist',
      company: 'LinkedIn',
      location: 'Remote',
      type: 'Full-time',
      posted: '5 hours ago',
      applicants: 67,
      description: 'Create content strategies that make information accessible to diverse audiences.',
      skills: ['Content Writing', 'SEO', 'Strategy'],
      logo: '🔷',
    },
  ];

  // Unstop Opportunities Data
  const unstopOpportunities = [
    {
      id: 1,
      title: 'Global Hackathon 2024',
      organization: 'TechGiant Inc.',
      type: 'Hackathon',
      prize: '$10,000',
      deadline: 'March 15, 2024',
      participants: 2500,
      description: '48-hour coding challenge to solve real-world accessibility problems. Build solutions for neurodiverse users.',
      logo: '🏆',
    },
    {
      id: 2,
      title: 'AI Innovation Challenge',
      organization: 'AI Labs',
      type: 'Competition',
      prize: '$5,000 + Internship',
      deadline: 'April 1, 2024',
      participants: 1800,
      description: 'Develop AI solutions that help people with learning differences. Focus on practical applications.',
      logo: '🤖',
    },
    {
      id: 3,
      title: 'Summer Design Internship',
      organization: 'Creative Studio',
      type: 'Internship',
      prize: 'Paid - $30/hour',
      deadline: 'March 30, 2024',
      participants: 950,
      description: '6-week intensive design program with mentorship. Learn accessible design principles.',
      logo: '✨',
    },
  ];

  const pageContent = `Opportunities Platform. Access job listings from LinkedIn and competitions from Unstop. All content is simplified for dyslexia-friendly reading with audio summaries available.`;

  const renderLinkedInClone = () => (
    <div className="space-y-6">
      {/* LinkedIn Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#0A66C2] p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">LinkedIn Jobs</h2>
              <p className="text-sm text-gray-600">Professional opportunities tailored for you</p>
            </div>
          </div>
          
          {/* Dyslexia-Friendly Toggle */}
          <button
            onClick={() => setDyslexiaModeEnabled(!dyslexiaModeEnabled)}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              dyslexiaModeEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {dyslexiaModeEnabled ? '✓ Dyslexia Mode ON' : 'Dyslexia Mode OFF'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by title or skill..."
            className={`flex-1 px-4 py-3 rounded-xl border-2 ${
              dyslexiaModeEnabled 
                ? 'border-blue-400 bg-blue-50 text-lg' 
                : 'border-gray-200'
            } focus:border-blue-400 focus:outline-none font-medium`}
          />
          <button className="bg-[#0A66C2] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
            Search
          </button>
        </div>
      </motion.div>

      {/* Job Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50"
      >
        <div className="flex gap-3 flex-wrap">
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm hover:bg-blue-100">
            Remote Only
          </button>
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm hover:bg-blue-100">
            Entry Level
          </button>
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm hover:bg-blue-100">
            Accessibility Support
          </button>
        </div>
      </motion.div>

      {/* Job Listings */}
      <div className="space-y-4">
        {linkedInJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg p-6 border-2 hover:border-blue-300 transition-all ${
              dyslexiaModeEnabled ? 'border-blue-400 bg-blue-50' : 'border-blue-50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dyslexiaModeEnabled ? 'bg-blue-200' : 'bg-gradient-to-br from-blue-100 to-blue-200'
              }`}>
                <span className="text-3xl">{job.logo}</span>
              </div>

              {/* Job Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="mb-3">
                  <h3 className={`font-bold mb-2 ${
                    dyslexiaModeEnabled ? 'text-2xl text-gray-900' : 'text-xl text-gray-800'
                  }`}>{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 flex-wrap">
                    <span className="font-bold text-blue-600">{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>

                {/* Key Info Highlights */}
                <div className={`flex gap-4 mb-3 ${
                  dyslexiaModeEnabled ? 'text-lg' : 'text-sm'
                }`}>
                  <span className="text-gray-600">⏰ Posted {job.posted}</span>
                  <span className="text-gray-600">👥 {job.applicants} applicants</span>
                </div>

                {/* Description */}
                <p className={`text-gray-700 mb-4 leading-relaxed ${
                  dyslexiaModeEnabled ? 'text-lg' : 'text-base'
                }`}>
                  {job.description}
                </p>

                {/* Skills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full font-semibold text-xs ${
                        dyslexiaModeEnabled
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`, '_blank')}
                    className="flex-1 bg-[#0A66C2] hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all">
                    Save
                  </button>
                </div>

                {/* Audio Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AudioControl 
                    text={`${job.title} position at ${job.company}. ${job.location}. ${job.type}. ${job.description}. Required skills: ${job.skills.join(', ')}.`} 
                    showControls={true} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All LinkedIn Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-6 border-t border-gray-200"
      >
        <button
          onClick={() => window.open('https://www.linkedin.com/jobs/', '_blank')}
          className="inline-flex items-center gap-2 bg-[#0A66C2] hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          View More Jobs
        </button>
      </motion.div>
    </div>
  );

  const renderUnstopClone = () => (
    <div className="space-y-6">
      {/* Unstop Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E93E30] p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Unstop Opportunities</h2>
              <p className="text-sm text-gray-600">Competitions, hackathons, and internships</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Opportunity Cards */}
      <div className="grid grid-cols-1 gap-6">
        {unstopOpportunities.map((opp, index) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-50 hover:border-purple-200 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{opp.logo}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Title & Organization */}
                <div className="mb-3">
                  <h3 className="text-2xl font-black text-gray-800 mb-1">{opp.title}</h3>
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 flex-wrap">
                    <span className="font-bold text-purple-600">{opp.organization}</span>
                    <span>•</span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{opp.type}</span>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1">Prize</div>
                    <div className="font-bold text-purple-700">{opp.prize}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1">Deadline</div>
                    <div className="font-bold text-blue-700">{opp.deadline}</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1">Participants</div>
                    <div className="font-bold text-green-700">{opp.participants.toLocaleString()}</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <div className="text-xs text-gray-600 mb-1">Type</div>
                    <div className="font-bold text-orange-700">{opp.type}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {opp.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`https://unstop.com/search?q=${encodeURIComponent(opp.title)}`, '_blank')}
                    className="flex-1 bg-[#E93E30] hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all">
                    Save
                  </button>
                </div>

                {/* Audio Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AudioControl 
                    text={`${opp.title} by ${opp.organization}. Prize: ${opp.prize}. Deadline: ${opp.deadline}. ${opp.description}.`} 
                    showControls={true} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-6 border-t border-gray-200"
      >
        <button
          onClick={() => alert('Full Unstop integration coming soon!')}
          className="inline-flex items-center gap-2 bg-[#E93E30] hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          View More Opportunities
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Main Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800">Opportunities</h1>
        </div>
        <AudioControl text={pageContent} />
      </motion.div>

      {/* Section Tabs */}
      <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-sm border border-blue-50">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeSection === 'overview'
              ? 'bg-[#4A90E2] text-white shadow-md'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          📋 Overview
        </button>
        <button
          onClick={() => setActiveSection('linkedin')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeSection === 'linkedin'
              ? 'bg-[#0A66C2] text-white shadow-md'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          💼 LinkedIn
        </button>
        <button
          onClick={() => setActiveSection('unstop')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
            activeSection === 'unstop'
              ? 'bg-[#E93E30] text-white shadow-md'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          🏆 Unstop
        </button>
      </div>

      {/* Render Active Section */}
      {activeSection === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-blue-100"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What This Offers
          </h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Our Opportunities platform connects you directly to real job listings from LinkedIn and competitions from Unstop, all with dyslexia-friendly enhancements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  LinkedIn Integration
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    Real-time job listings
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    Dyslexia-friendly mode toggle
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    Audio summaries for each job
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    Simplified application process
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Unstop Integration
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-1">•</span>
                    Latest competitions and hackathons
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-1">•</span>
                    Internship opportunities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-1">•</span>
                    Clear deadline tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-1">•</span>
                    Prize and eligibility highlights
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => setActiveSection('linkedin')}
              className="bg-[#0A66C2] hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Browse LinkedIn Jobs
            </button>
            <button
              onClick={() => setActiveSection('unstop')}
              className="bg-[#E93E30] hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Explore Unstop Opportunities
            </button>
          </div>
        </motion.div>
      )}

      {activeSection === 'linkedin' && renderLinkedInClone()}
      {activeSection === 'unstop' && renderUnstopClone()}
    </div>
  );
}
