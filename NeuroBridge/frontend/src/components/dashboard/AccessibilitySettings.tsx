import React from 'react';
import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import type { LineSpacing, LetterSpacing, ContentWidth } from '../../contexts/DyslexiaContext';

export function AccessibilitySettings() {
  const { 
    isDyslexiaMode,
    textSize, setTextSize,
    lineSpacing, setLineSpacing,
    letterSpacing, setLetterSpacing,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    contentWidth, setContentWidth,
    resetVisualPreferences
  } = useDyslexia();

  // Helper mappings for CSS values
  const getLineHeight = (val: LineSpacing) => {
    if (val === 'normal') return 1.5;
    if (val === 'comfortable') return 1.8;
    return 2.2; // spacious
  };

  const getLetterSpacing = (val: LetterSpacing) => {
    if (val === 'normal') return 'normal';
    if (val === 'comfortable') return '0.05em';
    return '0.1em'; // wide
  };

  const getContentWidth = (val: ContentWidth) => {
    if (val === 'normal') return '100%';
    if (val === 'comfortable') return '85%';
    return '65%'; // narrow
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Accessibility Preferences</h1>
        <p className="text-text-muted font-medium">Customize how content looks and feels for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Adjustments */}
        <motion.div 
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-bold text-text">Reading & Visual Adjustments</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* 1. Text Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-text">Text Size</label>
                <span className="text-[#4A90E2] font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">
                  {textSize}%
                </span>
              </div>
              <p className="text-sm text-text-muted font-medium mb-4">Make text easier to read.</p>
              <input
                type="range"
                min="80" max="140" step="10"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
              />
              <div className="flex justify-between text-xs text-text-muted font-bold mt-2 px-1">
                <span>80%</span>
                <span>100%</span>
                <span>120%</span>
                <span>140%</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* 2. Line Spacing */}
            <div>
              <label className="font-bold text-text block mb-1">Line Spacing</label>
              <p className="text-sm text-text-muted font-medium mb-4">Increase space between lines for easier reading.</p>
              <div className="flex gap-3">
                {(['normal', 'comfortable', 'spacious'] as LineSpacing[]).map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => setLineSpacing(spacing)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                      lineSpacing === spacing
                        ? 'bg-[#4A90E2] text-white shadow-sm border border-[#4A90E2]'
                        : 'bg-white text-text border border-border hover:border-gray-300'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* 3. Letter Spacing */}
            <div>
              <label className="font-bold text-text block mb-1">Letter Spacing</label>
              <p className="text-sm text-text-muted font-medium mb-4">Add space between letters to improve readability.</p>
              <div className="flex gap-3">
                {(['normal', 'comfortable', 'wide'] as LetterSpacing[]).map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => setLetterSpacing(spacing)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                      letterSpacing === spacing
                        ? 'bg-[#4A90E2] text-white shadow-sm border border-[#4A90E2]'
                        : 'bg-white text-text border border-border hover:border-gray-300'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* 4. High Contrast & 5. Reduce Motion */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-text mb-1">High Contrast</div>
                  <div className="text-sm text-text-muted font-medium">Increase the contrast between text and backgrounds.</div>
                </div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  type="button"
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${
                    highContrast ? 'bg-[#4A90E2]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                    highContrast ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-text mb-1">Reduce Motion</div>
                  <div className="text-sm text-text-muted font-medium">Minimize animations and movement across the website.</div>
                </div>
                <button
                  onClick={() => setReduceMotion(!reduceMotion)}
                  type="button"
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${
                    reduceMotion ? 'bg-[#4A90E2]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
                    reduceMotion ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* 6. Content Width */}
            <div>
              <label className="font-bold text-text block mb-1">Reading Comfort (Content Width)</label>
              <p className="text-sm text-text-muted font-medium mb-4">Controls the maximum width of long text paragraphs.</p>
              <div className="flex gap-3">
                {(['normal', 'comfortable', 'narrow'] as ContentWidth[]).map((width) => (
                  <button
                    key={width}
                    onClick={() => setContentWidth(width)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                      contentWidth === width
                        ? 'bg-[#4A90E2] text-white shadow-sm border border-[#4A90E2]'
                        : 'bg-white text-text border border-border hover:border-gray-300'
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="space-y-8 sticky top-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-2xl p-8 border shadow-sm transition-colors ${
              highContrast ? 'bg-slate-900 border-slate-700' : 'bg-surface border-border'
            }`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-8 ${highContrast ? 'text-slate-400' : 'text-text-muted'}`}>
              Live Preview
            </h3>
            <p className={`text-sm font-bold mb-4 ${highContrast ? 'text-slate-300' : 'text-text-muted'}`}>
              See how your settings affect reading.
            </p>

            {/* Preview Container */}
            <div 
              style={{ 
                width: getContentWidth(contentWidth),
                margin: '0 auto',
                transition: reduceMotion ? 'none' : 'width 0.3s ease'
              }}
              className="bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-200"
            >
              <div 
                style={{
                  fontSize: `${(textSize / 100) * 16}px`,
                  lineHeight: getLineHeight(lineSpacing),
                  letterSpacing: getLetterSpacing(letterSpacing),
                  fontFamily: isDyslexiaMode ? 'var(--font-heading)' : 'inherit',
                  transition: reduceMotion ? 'none' : 'all 0.3s ease'
                }}
              >
                <h2 className={`font-bold mb-4 ${highContrast ? 'text-white' : 'text-text'}`} style={{ fontSize: '1.25em' }}>
                  Learning should feel comfortable.
                </h2>
                <p className={`${highContrast ? 'text-slate-200' : 'text-text'}`}>
                  Everyone learns differently. Adjust the reading experience until the content feels comfortable and easy to follow.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Current Settings Summary */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-text mb-4">Your Settings</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-medium">Text Size:</span>
                <span className="font-bold text-text">{textSize}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-medium">Line Spacing:</span>
                <span className="font-bold text-text capitalize">{lineSpacing}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-medium">Letter Spacing:</span>
                <span className="font-bold text-text capitalize">{letterSpacing}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-medium">High Contrast:</span>
                <span className="font-bold text-text">{highContrast ? 'On' : 'Off'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-medium">Reduce Motion:</span>
                <span className="font-bold text-text">{reduceMotion ? 'On' : 'Off'}</span>
              </div>
            </div>

            <button 
              onClick={resetVisualPreferences}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl transition-colors text-sm"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
