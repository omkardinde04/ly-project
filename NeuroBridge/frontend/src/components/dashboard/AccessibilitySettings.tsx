import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

export function AccessibilitySettings() {
  const { 
    isDyslexiaMode, 
    toggleDyslexiaMode, 
    language, 
    setLanguage,
    audioSpeed,
    setAudioSpeed,
    dyslexiaLevel
  } = useDyslexia();
  
  const t = getTranslation(language);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Accessibility Settings</h1>
        <p className="text-gray-600 font-medium">Customize your learning experience</p>
      </div>

      {/* Current Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-gray-800">Your Current Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-600 mb-1">Dyslexia Level</div>
            <div className="font-bold text-gray-800 capitalize">{dyslexiaLevel}</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-600 mb-1">Current Language</div>
            <div className="font-bold text-gray-800 uppercase">{language}</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-600 mb-1">Dyslexia Mode</div>
            <div className={`font-bold ${isDyslexiaMode ? 'text-green-600' : 'text-gray-600'}`}>
              {isDyslexiaMode ? 'Enabled ✓' : 'Disabled'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dyslexia Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">👁️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Dyslexia-Friendly Mode</h3>
              <p className="text-sm text-gray-600">Enable specialized fonts, spacing, and colors</p>
            </div>
          </div>
          <button
            onClick={toggleDyslexiaMode}
            className={`w-16 h-8 rounded-full transition-colors ${
              isDyslexiaMode ? 'bg-green-500' : 'bg-gray-300'
            } relative`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
              isDyslexiaMode ? 'translate-x-9' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </motion.div>

      {/* Font Size Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-2xl">📏</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Font Size</h3>
            <p className="text-sm text-gray-600">Adjust text size for comfortable reading</p>
          </div>
        </div>
        
        <div className="px-4">
          <input
            type="range"
            min="14"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Small ({fontSize}px)</span>
            <span>Large</span>
          </div>
        </div>

        {/* Preview */}
        <div 
          className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
          style={{ fontSize: `${fontSize}px` }}
        >
          <p className="text-gray-800 font-medium">
            Preview: The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </motion.div>

      {/* Line Spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-2xl">📐</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Line Spacing</h3>
            <p className="text-sm text-gray-600">Increase spacing between lines</p>
          </div>
        </div>
        
        <div className="px-4">
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.1"
            value={lineSpacing}
            onChange={(e) => setLineSpacing(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Normal ({lineSpacing}x)</span>
            <span>Wide</span>
          </div>
        </div>

        {/* Preview */}
        <div 
          className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
          style={{ lineHeight: lineSpacing }}
        >
          <p className="text-gray-800 font-medium">
            Line 1: This is how the text will look.<br/>
            Line 2: With your selected spacing.<br/>
            Line 3: Easy to read and comfortable.
          </p>
        </div>
      </motion.div>

      {/* Audio Speed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Audio Speed</h3>
            <p className="text-sm text-gray-600">Control text-to-speech playback speed</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[0.8, 1.0, 1.2].map((speed) => (
            <button
              key={speed}
              onClick={() => setAudioSpeed(speed)}
              className={`py-3 rounded-xl font-bold transition-all ${
                audioSpeed === speed
                  ? 'bg-[#4A90E2] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {speed === 0.8 ? 'Slow' : speed === 1.0 ? 'Normal' : 'Fast'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* High Contrast Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">🌗</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">High Contrast Mode</h3>
              <p className="text-sm text-gray-600">Enhanced color contrast for better visibility</p>
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-16 h-8 rounded-full transition-colors ${
              highContrast ? 'bg-blue-500' : 'bg-gray-300'
            } relative`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
              highContrast ? 'translate-x-9' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {highContrast && (
          <div className="mt-4 bg-black text-white p-4 rounded-xl">
            <p className="font-bold">
              High contrast preview: Text appears white on black background for maximum visibility.
            </p>
          </div>
        )}
      </motion.div>

      {/* Language Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-50"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Language</h3>
            <p className="text-sm text-gray-600">Choose your preferred language</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`py-3 rounded-xl font-bold transition-all ${
              language === 'en'
                ? 'bg-[#4A90E2] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`py-3 rounded-xl font-bold transition-all ${
              language === 'hi'
                ? 'bg-[#4A90E2] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇮🇳 हिन्दी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`py-3 rounded-xl font-bold transition-all ${
              language === 'mr'
                ? 'bg-[#4A90E2] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇮🇳 मराठी
          </button>
        </div>
      </motion.div>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-50"
      >
        <button className="w-full py-4 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-all">
          🔄 Reset to Default Settings
        </button>
      </motion.div>
    </div>
  );
}
