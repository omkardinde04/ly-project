import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';
export type DyslexiaLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type CognitiveDimension = 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';

export type LineSpacing = 'normal' | 'comfortable' | 'spacious';
export type LetterSpacing = 'normal' | 'comfortable' | 'wide';
export type ContentWidth = 'normal' | 'comfortable' | 'narrow';

interface CognitiveProfile {
  phonological: number; // 0-100
  visual: number;
  workingMemory: number;
  processingSpeed: number;
  orthographic: number;
  executive: number;
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
  cognitiveProfile: CognitiveProfile | null;
  partACompleted: boolean;
  partBCompleted: boolean;
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
  markTestCompleted: (score: number) => void;
  completeCognitiveTasks: (profile: CognitiveProfile) => void;
  resetTest: () => void;
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
  cognitiveProfile: null,
  partACompleted: false,
  partBCompleted: false,
};

const DyslexiaContext = createContext<DyslexiaContextType | undefined>(undefined);

export function DyslexiaProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DyslexiaSettings>(() => {
    const saved = localStorage.getItem('dyslexiaSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
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
    if (settings.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.isDarkMode]);

  const toggleDyslexiaMode = () => {
    setSettings(prev => ({ ...prev, isDyslexiaMode: !prev.isDyslexiaMode }));
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const setLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
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

  const markTestCompleted = (score: number) => {
    setSettings(prev => ({ 
      ...prev, 
      partACompleted: true,
      testScore: score,
      dyslexiaLevel: calculateDyslexiaLevel(score)
    }));
  };

  const completeCognitiveTasks = (profile: CognitiveProfile) => {
    const totalScore = Object.values(profile).reduce((sum, val) => sum + val, 0);
    const avgScore = totalScore / 6;
    
    setSettings(prev => ({
      ...prev,
      partBCompleted: true,
      isTestCompleted: true,
      cognitiveProfile: profile,
      dyslexiaLevel: calculateDyslexiaLevelFromProfile(avgScore)
    }));
  };

  const resetTest = () => {
    setSettings(prev => ({ 
      ...prev, 
      isTestCompleted: false, 
      testScore: null,
      dyslexiaLevel: 'none',
      cognitiveProfile: null,
      partACompleted: false,
      partBCompleted: false
    }));
  };

  const calculateDyslexiaLevel = (score: number): DyslexiaLevel => {
    if (score < 45) return 'none';
    if (score <= 60) return 'mild';
    if (score <= 80) return 'moderate';
    return 'severe';
  };

  const calculateDyslexiaLevelFromProfile = (avgScore: number): DyslexiaLevel => {
    if (avgScore < 40) return 'none';
    if (avgScore <= 60) return 'mild';
    if (avgScore <= 75) return 'moderate';
    return 'severe';
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
      markTestCompleted,
      completeCognitiveTasks,
      resetTest,
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
