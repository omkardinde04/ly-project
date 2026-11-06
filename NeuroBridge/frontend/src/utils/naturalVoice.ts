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

// Old formant / novelty voices that sound robotic (macOS "Eloquence" + novelty
// voices, Windows SAPI desktop voices). Used only if nothing else exists.
const ROBOTIC_VOICES = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ',
  'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'fred', 'junior', 'kathy', 'ralph',
  'eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley',
  'microsoft david', 'microsoft zira', 'microsoft mark', 'microsoft hazel', 'microsoft heera', 'microsoft ravi',
];

// Warm, clear voices people tend to like (Siri / Alexa style). Small bonus only.
const FAVOURITE_VOICES = [
  'ava', 'jenny', 'aria', 'emma', 'andrew', 'brian', 'neerja', 'prabhat', 'samantha', 'zoe', 'evan',
  'nathan', 'joelle', 'noelle', 'allison', 'susan', 'serena', 'karen', 'daniel', 'libby', 'sonia',
];

/** Higher = more natural. Exported for debugging in the console. */
export function scoreVoice(v: SpeechSynthesisVoice, language: Language = 'en'): number {
  const name = `${v.name} ${v.voiceURI}`.toLowerCase();
  const lang = v.lang.toLowerCase().replace('_', '-');
  let score = 0;

  if (ROBOTIC_VOICES.some((r) => name.includes(r))) return -1000;

  // Neural / cloud voices — by far the most human
  if (/\b(natural|neural)\b/.test(name) || name.includes('online')) score += 120;
  if (name.includes('multilingual')) score += 10;
  // Apple's downloadable high-quality voices (Settings → Accessibility → Spoken Content)
  if (name.includes('premium')) score += 110;
  else if (name.includes('enhanced')) score += 95;
  // Chrome's Google network voices
  if (name.includes('google')) score += 80;
  // Apple's newer standard voices are fine; the "compact" ones less so
  if (name.includes('compact')) score -= 20;
  if (FAVOURITE_VOICES.some((f) => new RegExp(`\\b${f}\\b`).test(name))) score += 15;

  // Language fit
  if (language === 'en') {
    if (lang === 'en-us') score += 12;
    else if (lang === 'en-gb' || lang === 'en-in') score += 10;
    else if (lang.startsWith('en')) score += 6;
    else score -= 200;
  } else if (!lang.startsWith(language)) {
    score -= 200;
  }

  // The browser's own default is usually a sensible tie-breaker
  if (v.default) score += 2;
  return score;
}

/**
 * Finds the most natural, human-sounding voice installed for a language.
 * Best results: Microsoft Edge (Natural voices), Chrome (Google voices), or a
 * Mac with a Premium/Enhanced voice downloaded.
 */
export function getBestNaturalVoice(language: Language = 'en'): SpeechSynthesisVoice | null {
  const voices = getLoadedVoices();
  if (!voices.length) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const sc = scoreVoice(v, language);
    if (sc > bestScore) {
      best = v;
      bestScore = sc;
    }
  }
  return best;
}

/**
 * Returns optimized acoustic and prosody parameters for warm, human-like conversational voice.
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

  // A touch slower than the engine default sounds calmer and more human
  const baseRate = 0.95;
  const basePitch = 1.0;

  return {
    voice,
    rate: Math.max(0.7, Math.min(1.5, baseRate * speedMultiplier)),
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
 * Analyzes the semantic meaning of a sentence to determine subtle inflection.
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
 * Splits conversational text into natural speaking segments with Siri-like halts/pauses between sentences.
 */
export function splitTextIntoSpeechSegments(text: string, language: Language = 'en'): SpeechSegment[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  const regex = /([^.!?\n\r]+[.!?\n\r]*)/g;
  const matches = cleaned.match(regex) || [cleaned];
  const segments: SpeechSegment[] = [];

  for (const m of matches) {
    const trimmed = m.trim();
    if (!trimmed) continue;

    const lastChar = trimmed[trimmed.length - 1];
    const isQuestion = lastChar === '?';

    // Natural breath pause duration: 250ms for normal sentences
    const pauseAfterMs = isQuestion ? 300 : 250;

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

/**
 * Groups sentences into natural chunks (about 2–3 sentences, max ~220 chars).
 * Speaking a chunk in one go lets the voice keep its own rhythm instead of
 * restarting the intonation at every full stop, which sounds robotic.
 * (Chunks stay short because some browser voices stop after ~15 seconds.)
 */
export function splitTextIntoSpeechChunks(text: string, maxChars = 220): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];
  const sentences = cleaned.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (current && (current + ' ' + sentence).length > maxChars) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
    // A very long sentence: split at commas so it still flows
    while (current.length > maxChars * 1.6) {
      const cut = current.lastIndexOf(', ', maxChars);
      const at = cut > 40 ? cut + 1 : maxChars;
      chunks.push(current.slice(0, at).trim());
      current = current.slice(at).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

