import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';
export type DyslexiaLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type CognitiveDimension = 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';

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
  language: Language;
  audioSpeed: number;
  fontSize: number;
  dyslexiaLevel: DyslexiaLevel;
  isTestCompleted: boolean;
  testScore: number | null;
  cognitiveProfile: CognitiveProfile | null;
  partACompleted: boolean;
  partBCompleted: boolean;
}

interface DyslexiaContextType extends DyslexiaSettings {
  toggleDyslexiaMode: () => void;
  setLanguage: (lang: Language) => void;
  setAudioSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  setDyslexiaLevel: (level: DyslexiaLevel) => void;
  markTestCompleted: (score: number) => void;
  completeCognitiveTasks: (profile: CognitiveProfile) => void;
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
  cognitiveProfile: null,
  partACompleted: false,
  partBCompleted: false,
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
      partACompleted: true,
      testScore: score
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
      setLanguage,
      setAudioSpeed,
      setFontSize,
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
