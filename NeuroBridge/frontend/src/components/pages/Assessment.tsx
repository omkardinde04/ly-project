import { useState } from 'react';
import { AssessmentTest } from '../assessment/AssessmentTest';
import { ReportGenerator } from '../assessment/ReportGenerator';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';

export function AssessmentPage() {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [testState, setTestState] = useState<'intro' | 'test' | 'report'>('intro');
  const [finalScore, setFinalScore] = useState<number>(0);

  const handleStartTest = () => {
    setTestState('test');
  };

  const handleTestComplete = (score: number) => {
    setFinalScore(score);
    setTestState('report');
  };

  const handleRetake = () => {
    setTestState('test');
  };

  const handleContinue = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  if (testState === 'test') {
    return <AssessmentTest onComplete={handleTestComplete} />;
  }

  if (testState === 'report') {
    return (
      <ReportGenerator
        score={finalScore}
        onRetake={handleRetake}
        onContinue={handleContinue}
      />
    );
  }

  // Intro Screen
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-blue-100">
        {/* Header */}
        <div className="relative text-center mb-8">
          {/* Dyslexia Toggle (Absolute positioning for top right) */}
          <div className="absolute top-0 right-0">
            <DyslexiaToggle />
          </div>

          <div className="inline-block bg-blue-100 p-4 rounded-full mb-4 mt-6 md:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
            {t.assessmentTitle}
          </h1>
          
          {/* Audio Summary */}
          <div className="mb-6">
            <AudioControl 
              text={`${t.assessmentTitle}. ${t.assessmentSubtitle}`} 
              showControls={true} 
            />
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            {t.assessmentSubtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">15 Questions</h3>
            <p className="text-sm text-gray-600">Quick assessment to understand your learning style</p>
          </div>
          
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl">⏱️</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">5-10 Minutes</h3>
            <p className="text-sm text-gray-600">Take your time, there's no rush</p>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-6 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Instant Report</h3>
            <p className="text-sm text-gray-600">Get personalized recommendations immediately</p>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What to Expect
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-green-500 font-bold mt-1">✓</span>
              One question per screen - easy to focus
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-green-500 font-bold mt-1">✓</span>
              Audio support available for each question
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-green-500 font-bold mt-1">✓</span>
              Visual examples to help understanding
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-green-500 font-bold mt-1">✓</span>
              No right or wrong answers - be honest
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-green-500 font-bold mt-1">✓</span>
              You can go back and change answers
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            className="inline-flex items-center gap-3 bg-[#4A90E2] hover:bg-blue-600 text-white px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/30 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.startAssessment}
          </button>
        </div>

        {/* Reassurance */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            This helps us personalize the platform for your needs
          </p>
        </div>
      </div>
    </div>
  );
}
