import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { changeSpeechSpeed } from '../../utils/textToSpeech';

export function AccessibilitySettings() {
  const { 
    isDyslexiaMode: globalDyslexiaMode, 
    toggleDyslexiaMode: globalToggleDyslexiaMode,
    language: globalLanguage, 
    setLanguage: globalSetLanguage,
    audioSpeed: globalAudioSpeed,
    setAudioSpeed: globalSetAudioSpeed,
    dyslexiaLevel
  } = useDyslexia();
  const t = getTranslation(globalLanguage);
  
  // Local state for delayed saving
  const [localLanguage, setLocalLanguage] = useState(globalLanguage);
  const [localAudioSpeed, setLocalAudioSpeed] = useState(globalAudioSpeed);
  const [localDyslexiaMode, setLocalDyslexiaMode] = useState(globalDyslexiaMode);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [highContrast, setHighContrast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const previewT = getTranslation(localLanguage);

  const handleSave = () => {
    setIsSaving(true);
    globalSetLanguage(localLanguage);
    globalSetAudioSpeed(localAudioSpeed);
    
    if (localDyslexiaMode !== globalDyslexiaMode) {
      globalToggleDyslexiaMode();
    }
    
    // Allow React state and useEffect to commit to localStorage
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 150);
  };

  const handleLocalAudioSpeedChange = (speed: number) => {
    setLocalAudioSpeed(speed);
    changeSpeechSpeed(speed); // Updates speed instantly if audio is currently playing
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">{t.accPreferences}</h1>
        <p className="text-gray-600 font-medium">Fine-tune your reading and audio experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Profile Block */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-blue-100/50 overflow-hidden"
          >
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-blue-50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.accVisual}</h3>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Row: Dyslexia Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Global Dyslexia Mode</h4>
                  <p className="text-sm text-gray-500 font-medium">Auto-applies ideal fonts and spacing for your level.</p>
                </div>
                
                {/* Local Dyslexia Toggle */}
                <div className={`flex items-center gap-3 bg-[#F4F9FD]! px-4 py-2.5 rounded-full shadow-none! border border-blue-100/50`}>
                  <span className="text-sm font-bold text-gray-700 select-none">🎨 Dyslexia Mode</span>
                  <button
                    onClick={() => setLocalDyslexiaMode(!localDyslexiaMode)}
                    type="button"
                    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ml-1 ${
                      localDyslexiaMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                        localDyslexiaMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100" />

              {/* Row: Specific Settings */}
              <div className={`transition-opacity duration-300 ${localDyslexiaMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800">Base Font Size</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14" max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                />

                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800">Line Spacing</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">{lineSpacing}x</span>
                </div>
                <input
                  type="range"
                  min="1" max="2.5" step="0.1"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">High Contrast UI</h4>
                    <p className="text-sm text-gray-500 font-medium">Enhance elements for reduced eye strain.</p>
                  </div>
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    type="button"
                    className={`w-14 h-7 rounded-full transition-colors relative focus:outline-hidden ${
                      highContrast ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                      highContrast ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Audio & Localization Block */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-blue-100/50 overflow-hidden"
          >
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-blue-50">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.accAudio}</h3>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Row: Speech Rate */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Default Speech Rate</h4>
                <div className="flex bg-[#F4F9FD] p-1.5 rounded-2xl border border-blue-100 max-w-sm">
                  {[
                    { label: '0.5x Slow', val: 0.5 },
                    { label: '1.0x Normal', val: 1.0 },
                    { label: '1.5x Fast', val: 1.5 },
                  ].map((speed) => (
                    <button
                      key={speed.val}
                      onClick={() => handleLocalAudioSpeedChange(speed.val)}
                      className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                        localAudioSpeed === speed.val 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100" />

              {/* Row: Language */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Primary Content Language</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'en', flag: '🇬🇧', label: 'English' },
                    { id: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
                    { id: 'mr', flag: '🇮🇳', label: 'मराठी' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLocalLanguage(lang.id as any)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        localLanguage === lang.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm transform scale-[1.02]'
                          : 'border-gray-100 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className={`font-bold text-sm ${localLanguage === lang.id ? 'text-blue-700' : ''}`}>
                        {lang.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100 mt-6 mb-2" />

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                <span className="text-xl">{isSaving ? '⏳' : '💾'}</span>
                {isSaving ? 'Saving...' : t.saveChanges}
              </button>
            </div>
          </motion.div>
          
        </div>

        {/* Right Column: Live Preview & Profile */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl p-6 shadow-sm border transition-colors ${
              highContrast ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-blue-100'
            }`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${highContrast ? 'text-slate-400' : 'text-gray-500'}`}>Live Preview</h3>
            
            <div 
              style={{ 
                fontSize: `${localDyslexiaMode ? 18 : fontSize}px`, 
                lineHeight: localDyslexiaMode ? 1.8 : lineSpacing,
                fontFamily: localDyslexiaMode ? '"Lexend", "Comic Sans MS", cursive' : 'inherit'
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-3 shrink-0 mb-4">
                <h2 className={`font-bold ${localDyslexiaMode ? '' : 'text-xl'}`}>
                  {previewT.previewTitle}
                </h2>
                <div className="self-start">
                  <AudioControl 
                    text={`${previewT.previewTitle}. ${previewT.previewText}`}
                    showControls={false}
                    overrideLanguage={localLanguage}
                    overrideSpeed={localAudioSpeed}
                  />
                </div>
              </div>
              <p className={`font-medium wrap-break-word ${highContrast ? 'text-slate-300' : 'text-gray-700'}`}>
                {previewT.previewText}
              </p>
            </div>
          </motion.div>

          {/* Dyslexia Status Card */}
          <div className="bg-linear-to-br from-[#4A90E2] to-[#60A5FA] p-6 rounded-3xl shadow-md text-white">
            <h3 className="text-sm font-bold text-blue-100 mb-6 uppercase tracking-wider">Assessment Status</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-blue-100 font-medium mb-1">Needs Level</p>
                <div className="text-2xl font-black capitalize">{dyslexiaLevel}</div>
              </div>
              <div className="text-4xl opacity-80">
                {dyslexiaLevel === 'none' ? '🎯' : dyslexiaLevel === 'severe' ? '⭐' : '🌟'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
