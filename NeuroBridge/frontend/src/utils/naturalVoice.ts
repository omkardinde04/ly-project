import type { Language } from '../contexts/DyslexiaContext';

export interface NaturalVoiceConfig {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export type SpeechTone = 'neutral' | 'helpful' | 'encouraging' | 'explaining' | 'warning' | 'celebrating' | 'sensitive';

export interface SpeechSegment {
  text: string;
  pauseAfterMs: number; // Duration of natural pause/halt after this segment
  isQuestion: boolean;
  tone: SpeechTone;
}

// Preferred natural human-sounding voice keywords by language in priority order
const PREFERRED_VOICE_NAMES: Record<Language, string[]> = {
  en: [
    // Top-tier Siri-like Apple voices (macOS / iOS)
    'Samantha (Enhanced)',
    'Samantha (Premium)',
    'Ava (Enhanced)',
    'Ava (Premium)',
    'Zoe (Enhanced)',
    'Zoe (Premium)',
    'Serena (Enhanced)',
    'Serena (Premium)',
    'Nicky (Enhanced)',
    'Evan (Enhanced)',
    'Allison (Enhanced)',
    'Samantha',
    'Ava',
    'Zoe',
    'Serena',
    // Microsoft Natural / Neural voices (Edge / Windows)
    'Microsoft Jenny Online (Natural)',
    'Microsoft Aria Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Microsoft Christopher Online (Natural)',
    'Jenny (Natural)',
    'Aria (Natural)',
    'Guy (Natural)',
    // Google voices (Chrome / Android)
    'Google US English',
    'Google UK English Female',
    'Google UK English Male',
    // Standard fallbacks
    'Karen',
    'Daniel',
    'Alex',
    'Microsoft Zira',
  ],
  hi: [
    // Microsoft Natural
    'Microsoft Swara Online (Natural)',
    'Microsoft Madhur Online (Natural)',
    'Microsoft Aarav Online (Natural)',
    'Swara (Natural)',
    // Google
    'Google हिन्दी',
    'Google Hindi',
    // Apple & Microsoft standard
    'Lekha (Enhanced)',
    'Lekha',
    'Microsoft Kalpana',
    'Hindi',
  ],
  mr: [
    // Google & Microsoft
    'Google मराठी',
    'Google Marathi',
    'Microsoft Marathi',
    'Lekha (Enhanced)',
    'Lekha',
    'Marathi',
    'Google हिन्दी',
    'Google Hindi',
  ],
};

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getLoadedVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length > 0) {
    return cachedVoices;
  }
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the highest quality, most natural human-sounding voice for a given language.
 */
export function getBestNaturalVoice(language: Language = 'en'): SpeechSynthesisVoice | null {
  const voices = getLoadedVoices();
  if (!voices.length) return null;

  const targetLang = language.toLowerCase();
  const langCandidates = voices.filter((v) => {
    const vLang = v.lang.toLowerCase();
    if (targetLang === 'en') return vLang.startsWith('en');
    if (targetLang === 'hi') return vLang.startsWith('hi');
    if (targetLang === 'mr') return vLang.startsWith('mr') || vLang.startsWith('hi');
    return vLang.includes(targetLang);
  });

  const voicePool = langCandidates.length > 0 ? langCandidates : voices;
  const preferences = PREFERRED_VOICE_NAMES[language] || PREFERRED_VOICE_NAMES.en;

  // 1. Check exact match in preference list
  for (const preferred of preferences) {
    const found = voicePool.find(
      (v) =>
        v.name.toLowerCase().includes(preferred.toLowerCase()) ||
        v.voiceURI.toLowerCase().includes(preferred.toLowerCase())
    );
    if (found) return found;
  }

  // 2. Prefer any voice labeled 'Natural', 'Enhanced', 'Neural', or 'Premium'
  const naturalFallback = voicePool.find((v) => {
    const name = v.name.toLowerCase();
    return (
      name.includes('natural') ||
      name.includes('enhanced') ||
      name.includes('neural') ||
      name.includes('premium') ||
      name.includes('online')
    );
  });
  if (naturalFallback) return naturalFallback;

  // 3. Prefer non-local service (cloud high quality) if available
  const remoteVoice = voicePool.find((v) => !v.localService);
  if (remoteVoice) return remoteVoice;

  return voicePool[0] || null;
}

/**
 * Returns optimized acoustic and prosody parameters for warm, human-like cadence.
 */
export function getNaturalVoiceConfig(
  language: Language = 'en',
  speedMultiplier: number = 1.0
): NaturalVoiceConfig {
  const voice = getBestNaturalVoice(language);

  const langMap: Record<Language, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    mr: 'mr-IN',
  };

  // Siri-like natural rate & warm human pitch
  const baseRate = language === 'en' ? 0.94 : 0.92;
  const basePitch = language === 'en' ? 1.02 : 1.0;

  return {
    voice,
    rate: Math.max(0.6, Math.min(1.8, baseRate * speedMultiplier)),
    pitch: basePitch,
    volume: 1.0,
    lang: langMap[language] || 'en-US',
  };
}

/**
 * Cleans text for natural spoken dialogue (removes markdown symbols, emojis, and awkward punctuation).
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove markdown links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown bold/italic asterisks & underscores
      .replace(/[*_#`~]/g, '')
      // Remove bullet symbols
      .replace(/[•▪—–]/g, ', ')
      // Remove emojis to avoid synthesizer reading emoji descriptions
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ''
      )
      // Normalize multiple punctuations (e.g. "..." -> "...")
      .replace(/\.{4,}/g, '...')
      // Normalize extra spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Analyzes the semantic meaning of a sentence to determine the most natural emotional tone.
 */
export function analyzeSentenceTone(text: string, language: Language = 'en'): SpeechTone {
  const lower = text.toLowerCase();
  
  if (language === 'en') {
    if (/(congratulations|great job|awesome|amazing|perfect|excellent|🎉)/i.test(lower)) return 'celebrating';
    if (/(warning|careful|important|note that|make sure|error)/i.test(lower)) return 'warning';
    if (/(you can do this|don't give up|no rush|take your time|together|no worries)/i.test(lower)) return 'encouraging';
    if (/(this means|for example|because|specifically|in other words|step by step)/i.test(lower)) return 'explaining';
    if (/(i can help|let me|here for you|sure|of course)/i.test(lower)) return 'helpful';
    if (/(sorry|unfortunately|confused|wrong|apologies)/i.test(lower)) return 'sensitive';
  } else if (language === 'hi') {
    if (/(बधाई|बहुत अच्छा|शानदार|अद्भुत|🎉)/i.test(lower)) return 'celebrating';
    if (/(चेतावनी|ध्यान दें|महत्वपूर्ण|सुनिश्चित करें|त्रुटि)/i.test(lower)) return 'warning';
    if (/(चिंता मत करो|जल्दबाजी नहीं|हम कर सकते हैं|साथ|कोई बात नहीं)/i.test(lower)) return 'encouraging';
    if (/(इसका मतलब|उदाहरण के लिए|क्योंकि|सरलता से|कदम)/i.test(lower)) return 'explaining';
    if (/(मदद|मुझे|बिल्कुल|यहाँ हूँ)/i.test(lower)) return 'helpful';
    if (/(क्षमा|गलत|माफ़|समस्या)/i.test(lower)) return 'sensitive';
  } else if (language === 'mr') {
    if (/(अभिनंदन|खूप छान|उत्कृष्ट|अद्भुत|🎉)/i.test(lower)) return 'celebrating';
    if (/(चेतावणी|लक्षात ठेवा|महत्त्वाचे|खात्री करा|चूक)/i.test(lower)) return 'warning';
    if (/(चिंता करु नकोस|जास्ती नाही|एकत्र|काळजी करू नका)/i.test(lower)) return 'encouraging';
    if (/(याचा अर्थ|उदाहरणासाठी|कारण|समजावून|पाऊल)/i.test(lower)) return 'explaining';
    if (/(मदत|मला|नक्की|येथे आहे)/i.test(lower)) return 'helpful';
    if (/(माफ करा|चुकीचे|क्षमस्व|समस्या)/i.test(lower)) return 'sensitive';
  }

  return 'neutral';
}

/**
 * Splits conversational text into natural speaking segments with Siri-like halts/pauses between sentences and clauses.
 */
export function splitTextIntoSpeechSegments(text: string, language: Language = 'en'): SpeechSegment[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  // Match sentences ending with punctuation, ellipsis, newlines, or clauses
  const regex = /([^.!?\n\r]+[.!?\n\r]*)/g;
  const matches = cleaned.match(regex) || [cleaned];
  const segments: SpeechSegment[] = [];

  for (const m of matches) {
    const trimmed = m.trim();
    if (!trimmed) continue;

    const lastChar = trimmed[trimmed.length - 1];
    const isQuestion = lastChar === '?';
    const isExclamation = lastChar === '!';
    const isPeriod = lastChar === '.';
    const isEllipsis = trimmed.endsWith('...');

    // Calculate natural halt/breath duration:
    // Period / Question / Exclamation: 350-420ms halt
    // Ellipsis / comma / clause: 200-260ms halt
    let pauseAfterMs = 280;
    if (isQuestion || isExclamation || isPeriod) {
      pauseAfterMs = 380;
    } else if (isEllipsis) {
      pauseAfterMs = 450;
    }

    segments.push({
      text: trimmed,
      pauseAfterMs,
      isQuestion,
      tone: analyzeSentenceTone(trimmed, language)
    });
  }

  return segments;
}

/**
 * Async sleep helper for natural speech halts.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
