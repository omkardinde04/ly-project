import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FUN_DEFAULTS, type FunFontId } from '../utils/funFonts';
import { getAssessmentSeverity, type AssessmentSeverity } from '../utils/assessmentScoring';

export type Language = 'en' | 'hi' | 'mr';
export type DyslexiaLevel = AssessmentSeverity;
export type CognitiveDimension = 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';

export type LineSpacing = 'normal' | 'comfortable' | 'spacious';
export type LetterSpacing = 'normal' | 'comfortable' | 'wide';
export type ContentWidth = 'normal' | 'comfortable' | 'narrow';

/** 0-100 per skill; a skill that couldn't be measured (e.g. no microphone) is missing */
interface CognitiveProfile {
  phonological?: number;
  visual?: number;
  workingMemory?: number;
  processingSpeed?: number;
  orthographic?: number;
  executive?: number;
}

interface DyslexiaSettings {
  isDyslexiaMode: boolean;
  isDarkMode: boolean;
  language: Language;
  audioSpeed: number;
  fontSize: number;
  textSize: number;
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
  highContrast: boolean;
  reduceMotion: boolean;
  contentWidth: ContentWidth;
  dyslexiaLevel: DyslexiaLevel;
  isTestCompleted: boolean;
  testScore: number | null;
  assessmentScoringVersion: number | null;
  cognitiveProfile: CognitiveProfile | null;
  partACompleted: boolean;
  partBCompleted: boolean;
  /* Fun mode (isDyslexiaMode = Fun mode on) */
  funFont: FunFontId;
  funLineHeight: number;
  funWeight: number;
  funLetterSpacing: number;
}

interface DyslexiaContextType extends DyslexiaSettings {
  toggleDyslexiaMode: () => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: Language) => void;
  setAudioSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  setTextSize: (size: number) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setContentWidth: (width: ContentWidth) => void;
  resetVisualPreferences: () => void;
  setDyslexiaLevel: (level: DyslexiaLevel) => void;
  completeCognitiveTasks: (profile: CognitiveProfile, indicatorScore: number) => void;
  resetTest: () => void;
  setFunFont: (font: FunFontId) => void;
  setFunLineHeight: (value: number) => void;
  setFunWeight: (value: number) => void;
  setFunLetterSpacing: (value: number) => void;
  /** Turn Fun mode on without toggling (used when a Fun-mode control is changed). */
  enableFunMode: () => void;
  resetFunSettings: () => void;
}

const defaultSettings: DyslexiaSettings = {
  isDyslexiaMode: false,
  isDarkMode: false,
  language: 'en',
  audioSpeed: 1,
  fontSize: 16,
  textSize: 100,
  lineSpacing: 'comfortable',
  letterSpacing: 'normal',
  highContrast: false,
  reduceMotion: false,
  contentWidth: 'normal',
  dyslexiaLevel: 'none',
  isTestCompleted: false,
  testScore: null,
  assessmentScoringVersion: null,
  cognitiveProfile: null,
  partACompleted: false,
  partBCompleted: false,
  ...FUN_DEFAULTS,
};

const DyslexiaContext = createContext<DyslexiaContextType | undefined>(undefined);

export function DyslexiaProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DyslexiaSettings>(() => {
    const saved = localStorage.getItem('dyslexiaSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const usesCurrentScoring = parsed.assessmentScoringVersion === 2;
        // The site is English-only: ignore any Hindi/Marathi choice saved earlier
        return {
          ...defaultSettings,
          ...parsed,
          language: 'en',
          testScore: usesCurrentScoring ? parsed.testScore : null,
          assessmentScoringVersion: usesCurrentScoring ? 2 : null,
          dyslexiaLevel: usesCurrentScoring ? parsed.dyslexiaLevel : 'none',
          cognitiveProfile: usesCurrentScoring ? parsed.cognitiveProfile : null,
          isTestCompleted: usesCurrentScoring ? parsed.isTestCompleted : false,
          partACompleted: usesCurrentScoring ? parsed.partACompleted : false,
          partBCompleted: usesCurrentScoring ? parsed.partBCompleted : false,
        };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dyslexiaSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [settings.isDarkMode]);

  // Fun mode. Switching it OFF puts every Fun-mode choice back to the default
  // (font, line spacing, weight, letter spacing and text size), so the site
  // looks exactly as it did before.
  const toggleDyslexiaMode = () => {
    setSettings(prev =>
      prev.isDyslexiaMode
        ? { ...prev, isDyslexiaMode: false, ...FUN_DEFAULTS, textSize: 100 }
        : { ...prev, isDyslexiaMode: true }
    );
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // English-only for now; kept so existing callers keep working
  const setLanguage = () => {
    setSettings(prev => (prev.language === 'en' ? prev : { ...prev, language: 'en' }));
  };

  const setAudioSpeed = (speed: number) => {
    setSettings(prev => ({ ...prev, audioSpeed: speed }));
  };

  const setFontSize = (size: number) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setTextSize = (size: number) => {
    setSettings(prev => ({ ...prev, textSize: size }));
  };

  const setLineSpacing = (spacing: LineSpacing) => {
    setSettings(prev => ({ ...prev, lineSpacing: spacing }));
  };

  const setLetterSpacing = (spacing: LetterSpacing) => {
    setSettings(prev => ({ ...prev, letterSpacing: spacing }));
  };

  const setHighContrast = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, highContrast: enabled }));
  };

  const setReduceMotion = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion: enabled }));
  };

  const setContentWidth = (width: ContentWidth) => {
    setSettings(prev => ({ ...prev, contentWidth: width }));
  };

  const resetVisualPreferences = () => {
    setSettings(prev => ({
      ...prev,
      textSize: 100,
      lineSpacing: 'comfortable',
      letterSpacing: 'normal',
      highContrast: false,
      reduceMotion: false,
      contentWidth: 'normal'
    }));
  };

  const setDyslexiaLevel = (level: DyslexiaLevel) => {
    setSettings(prev => ({ ...prev, dyslexiaLevel: level }));
  };

  const completeCognitiveTasks = (profile: CognitiveProfile, indicatorScore: number) => {
    setSettings(prev => ({
      ...prev,
      partACompleted: true,
      partBCompleted: true,
      isTestCompleted: true,
      testScore: indicatorScore,
      assessmentScoringVersion: 2,
      cognitiveProfile: profile,
      dyslexiaLevel: getAssessmentSeverity(indicatorScore)
    }));
  };

  const setFunFont = (font: FunFontId) => setSettings((prev) => ({ ...prev, funFont: font }));
  const setFunLineHeight = (value: number) => setSettings((prev) => ({ ...prev, funLineHeight: value }));
  const setFunWeight = (value: number) => setSettings((prev) => ({ ...prev, funWeight: value }));
  const setFunLetterSpacing = (value: number) => setSettings((prev) => ({ ...prev, funLetterSpacing: value }));
  const enableFunMode = () => setSettings((prev) => (prev.isDyslexiaMode ? prev : { ...prev, isDyslexiaMode: true }));
  const resetFunSettings = () => setSettings((prev) => ({ ...prev, ...FUN_DEFAULTS, textSize: 100 }));

  const resetTest = () => {
    setSettings(prev => ({ 
      ...prev, 
      isTestCompleted: false, 
      testScore: null,
      assessmentScoringVersion: null,
      dyslexiaLevel: 'none',
      cognitiveProfile: null,
      partACompleted: false,
      partBCompleted: false
    }));
  };

  return (
    <DyslexiaContext.Provider value={{
      ...settings,
      toggleDyslexiaMode,
      toggleDarkMode,
      setLanguage,
      setAudioSpeed,
      setFontSize,
      setTextSize,
      setLineSpacing,
      setLetterSpacing,
      setHighContrast,
      setReduceMotion,
      setContentWidth,
      resetVisualPreferences,
      setDyslexiaLevel,
      completeCognitiveTasks,
      resetTest,
      setFunFont,
      setFunLineHeight,
      setFunWeight,
      setFunLetterSpacing,
      enableFunMode,
      resetFunSettings,
    }}>
      {children}
    </DyslexiaContext.Provider>
  );
}

export function useDyslexia() {
  const context = useContext(DyslexiaContext);
  if (context === undefined) {
    throw new Error('useDyslexia must be used within a DyslexiaProvider');
  }
  return context;
}
