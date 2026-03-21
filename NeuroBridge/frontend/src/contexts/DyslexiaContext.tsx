import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';
export type DyslexiaLevel = 'none' | 'mild' | 'moderate' | 'severe';

interface DyslexiaSettings {
  isDyslexiaMode: boolean;
  language: Language;
  audioSpeed: number;
  fontSize: number;
  dyslexiaLevel: DyslexiaLevel;
  isTestCompleted: boolean;
  testScore: number | null;
}

interface DyslexiaContextType extends DyslexiaSettings {
  toggleDyslexiaMode: () => void;
  setLanguage: (lang: Language) => void;
  setAudioSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  setDyslexiaLevel: (level: DyslexiaLevel) => void;
  markTestCompleted: (score: number) => void;
  resetTest: () => void;
}

const defaultSettings: DyslexiaSettings = {
  isDyslexiaMode: false,
  language: 'en',
  audioSpeed: 1,
  fontSize: 16,
  dyslexiaLevel: 'none',
  isTestCompleted: false,
  testScore: null,
};

const DyslexiaContext = createContext<DyslexiaContextType | undefined>(undefined);

export function DyslexiaProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DyslexiaSettings>(() => {
    const saved = localStorage.getItem('dyslexiaSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dyslexiaSettings', JSON.stringify(settings));
  }, [settings]);

  const toggleDyslexiaMode = () => {
    setSettings(prev => ({ ...prev, isDyslexiaMode: !prev.isDyslexiaMode }));
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

  const setDyslexiaLevel = (level: DyslexiaLevel) => {
    setSettings(prev => ({ ...prev, dyslexiaLevel: level }));
  };

  const markTestCompleted = (score: number) => {
    setSettings(prev => ({ 
      ...prev, 
      isTestCompleted: true, 
      testScore: score,
      dyslexiaLevel: calculateDyslexiaLevel(score)
    }));
  };

  const resetTest = () => {
    setSettings(prev => ({ 
      ...prev, 
      isTestCompleted: false, 
      testScore: null,
      dyslexiaLevel: 'none'
    }));
  };

  const calculateDyslexiaLevel = (score: number): DyslexiaLevel => {
    if (score < 45) return 'none';
    if (score <= 60) return 'mild';
    if (score <= 80) return 'moderate';
    return 'severe';
  };

  return (
    <DyslexiaContext.Provider value={{
      ...settings,
      toggleDyslexiaMode,
      setLanguage,
      setAudioSpeed,
      setFontSize,
      setDyslexiaLevel,
      markTestCompleted,
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
