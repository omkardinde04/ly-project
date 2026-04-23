import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { AudioControl } from '../ui/AudioControl';
import { AccountConnector } from './AccountConnector';
import { AIAssistedJobCard } from './AIAssistedJobCard';

export function Opportunities() {
  const { language } = useDyslexia();
  const [activeSection, setActiveSection] = useState<'overview' | 'linkedin' | 'unstop'>('overview');
  const [dyslexiaModeEnabled, setDyslexiaModeEnabled] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isUnstopConnected, setIsUnstopConnected] = useState(false);

  const [linkedInJobs, setLinkedInJobs] = useState<any[]>([]);
  const [unstopOpportunities, setUnstopOpportunities] = useState<any[]>([]);
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false);
  const [isLoadingUnstop, setIsLoadingUnstop] = useState(false);

  useEffect(() => {
    if (isLinkedInConnected) {
      setIsLoadingLinkedIn(true);
      fetch('http://localhost:4000/api/opportunities/linkedin/jobs')
        .then(res => res.json())
        .then(data => setLinkedInJobs(data))
        .catch(err => console.error("Failed to fetch LinkedIn jobs", err))
        .finally(() => setIsLoadingLinkedIn(false));
    }
  }, [isLinkedInConnected]);

  useEffect(() => {
    if (isUnstopConnected) {
      setIsLoadingUnstop(true);
      fetch('http://localhost:4000/api/opportunities/unstop/jobs')
        .then(res => res.json())
        .then(data => setUnstopOpportunities(data))
        .catch(err => console.error("Failed to fetch Unstop opportunities", err))
        .finally(() => setIsLoadingUnstop(false));
    }
  }, [isUnstopConnected]);

  // Jobs data state is managed via hooks above

  const pageContent = `Opportunities Platform. Access job listings from LinkedIn and competitions from Unstop. All content is simplified for dyslexia-friendly reading with audio summaries available.`;

  const renderLinkedInClone = () => {
    if (!isLinkedInConnected) {
      return (
        <AccountConnector
          platform="LinkedIn"
          color="#0A66C2"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          }
          onConnect={() => setIsLinkedInConnected(true)}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* LinkedIn Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
              className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                dyslexiaModeEnabled
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {dyslexiaModeEnabled ? '✓ Reading Mode ON' : 'Reading Mode OFF'}
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
            <button className="bg-[#0A66C2] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
              Search
            </button>
          </div>
        </motion.div>

        {/* Job Listings using AIAssistedJobCard */}
        <div className="space-y-6">
          {isLoadingLinkedIn ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : linkedInJobs && linkedInJobs.length > 0 ? (
            linkedInJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AIAssistedJobCard 
                  job={job} 
                  dyslexiaModeEnabled={dyslexiaModeEnabled} 
                  platform="LinkedIn" 
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">No opportunities found right now. Check back later!</div>
          )}
        </div>

        {/* View All LinkedIn Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 border-t border-gray-200"
        >
          <button
            onClick={() => window.open('https://www.linkedin.com/jobs/', '_blank')}
            className="inline-flex items-center gap-2 bg-[#0A66C2] hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            View More Jobs
          </button>
        </motion.div>
      </div>
    );
  };

  const renderUnstopClone = () => {
    if (!isUnstopConnected) {
      return (
        <AccountConnector
          platform="Unstop"
          color="#E93E30"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          onConnect={() => setIsUnstopConnected(true)}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Unstop Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
            
            {/* Dyslexia-Friendly Toggle */}
            <button
              onClick={() => setDyslexiaModeEnabled(!dyslexiaModeEnabled)}
              className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                dyslexiaModeEnabled
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {dyslexiaModeEnabled ? '✓ Reading Mode ON' : 'Reading Mode OFF'}
            </button>
          </div>
        </motion.div>

        {/* Opportunity Cards */}
        <div className="space-y-6">
          {isLoadingUnstop ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : unstopOpportunities && unstopOpportunities.length > 0 ? (
            unstopOpportunities.map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AIAssistedJobCard 
                  job={opp} 
                  dyslexiaModeEnabled={dyslexiaModeEnabled} 
                  platform="Unstop" 
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">No opportunities found right now. Check back later!</div>
          )}
        </div>

        {/* View More Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 border-t border-gray-200"
        >
          <button
            onClick={() => window.open('https://unstop.com', '_blank')}
            className="inline-flex items-center gap-2 bg-[#E93E30] hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Explore More on Unstop
          </button>
        </motion.div>
      </div>
    );
  };

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
