import type { Language } from '../contexts/DyslexiaContext';
import { getNaturalVoiceConfig, cleanTextForSpeech, getLoadedVoices } from './naturalVoice';

export interface WordToken {
  id: number;
  word: string;
  trailing: string;
  startIndex: number;
  endIndex: number;
}

export interface SpeechCallbacks {
  onWord?: (wordIndex: number, charIndex: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (err: any) => void;
}

export function tokenizeText(text: string): WordToken[] {
  if (!text) return [];
  const tokens: WordToken[] = [];
  const regex = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  let id = 0;

  while ((match = regex.exec(text)) !== null) {
    const word = match[1];
    const trailing = match[2] || '';
    const startIndex = match.index;
    const endIndex = startIndex + word.length;

    tokens.push({
      id: id++,
      word,
      trailing,
      startIndex,
      endIndex,
    });
  }

  return tokens;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentWordIndex: number = 0;
  private currentText: string = '';
  private currentTokens: WordToken[] = [];
  private currentLanguage: Language = 'en';
  private currentSpeed: number = 1;
  private callbacks: SpeechCallbacks = {};
  private pacerTimer: number | null = null;
  private isManuallyPaused: boolean = false;
  private boundaryFired: boolean = false;

  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : ({} as SpeechSynthesis);
    if (typeof window !== 'undefined' && this.synth) {
      getLoadedVoices();
      if ('onvoiceschanged' in this.synth) {
        this.synth.onvoiceschanged = () => getLoadedVoices();
      }
    }
  }

  public setCallbacks(callbacks: SpeechCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public speak(
    text: string,
    language: Language = 'en',
    speed: number = 1,
    startWordIndex: number = 0,
    callbacks?: SpeechCallbacks
  ): void {
    if (!this.synth || typeof window === 'undefined') return;

    if (callbacks) {
      this.setCallbacks(callbacks);
    }

    this.stopPacer();
    this.synth.cancel();

    this.currentText = text;
    this.currentLanguage = language;
    this.currentSpeed = speed;
    this.currentTokens = tokenizeText(text);
    this.isManuallyPaused = false;
    this.boundaryFired = false;

    if (!this.currentTokens.length) {
      this.callbacks.onEnd?.();
      return;
    }

    const safeStartWordIdx = Math.max(0, Math.min(startWordIndex, this.currentTokens.length - 1));
    this.currentWordIndex = safeStartWordIdx;
    const startCharIndex = this.currentTokens[safeStartWordIdx].startIndex;

    const rawTextToSpeak = text.substring(startCharIndex);
    const cleanedTextToSpeak = cleanTextForSpeech(rawTextToSpeak) || rawTextToSpeak;

    // Use unified human-like natural voice configuration with Siri cadence
    const config = getNaturalVoiceConfig(language, speed);

    this.currentUtterance = new SpeechSynthesisUtterance(cleanedTextToSpeak);
    this.currentUtterance.lang = config.lang;
    if (config.voice) {
      this.currentUtterance.voice = config.voice;
    }
    this.currentUtterance.rate = config.rate;
    this.currentUtterance.pitch = config.pitch;
    this.currentUtterance.volume = config.volume;

    // Trigger initial word highlight immediately
    this.notifyWordChange(safeStartWordIdx, startCharIndex);

    this.currentUtterance.onstart = () => {
      this.callbacks.onStart?.();
      this.startPacer(safeStartWordIdx, speed);
    };

    this.currentUtterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word') {
        this.boundaryFired = true;
        const relativeCharIndex = event.charIndex;
        const absoluteCharIndex = startCharIndex + relativeCharIndex;

        const matchIdx = this.findWordIndexByChar(absoluteCharIndex);
        if (matchIdx !== -1 && matchIdx !== this.currentWordIndex) {
          this.currentWordIndex = matchIdx;
          this.notifyWordChange(matchIdx, absoluteCharIndex);
        }
      }
    };

    this.currentUtterance.onend = () => {
      this.stopPacer();
      this.callbacks.onEnd?.();
    };

    this.currentUtterance.onerror = (event) => {
      this.stopPacer();
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn('TTS utterance error:', event);
        this.callbacks.onError?.(event);
      }
    };

    this.currentUtterance.onpause = () => {
      this.stopPacer();
      this.callbacks.onPause?.();
    };

    this.currentUtterance.onresume = () => {
      this.callbacks.onResume?.();
      this.startPacer(this.currentWordIndex, this.currentSpeed);
    };

    this.synth.speak(this.currentUtterance);
  }

  private findWordIndexByChar(charIndex: number): number {
    for (let i = 0; i < this.currentTokens.length; i++) {
      const token = this.currentTokens[i];
      const nextStart = i < this.currentTokens.length - 1 ? this.currentTokens[i + 1].startIndex : token.endIndex + 5;
      if (charIndex >= token.startIndex && charIndex < nextStart) {
        return i;
      }
    }
    return -1;
  }

  private notifyWordChange(wordIdx: number, charIndex: number) {
    if (wordIdx >= 0 && wordIdx < this.currentTokens.length) {
      this.callbacks.onWord?.(wordIdx, charIndex);
    }
  }

  private startPacer(startIdx: number, speed: number) {
    this.stopPacer();
    let currentIdx = startIdx;

    const scheduleNext = () => {
      if (this.isManuallyPaused || !this.synth.speaking) return;

      if (currentIdx >= this.currentTokens.length - 1) {
        return;
      }

      const currentToken = this.currentTokens[currentIdx];
      const wordLength = currentToken ? currentToken.word.length : 5;
      let baseMs = Math.max(170, Math.min(850, (wordLength * 58 + 140) / speed));

      // Siri-style punctuation halts:
      if (currentToken) {
        const lastChar = currentToken.word[currentToken.word.length - 1];
        if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
          baseMs += 350 / speed; // sentence halt
        } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
          baseMs += 160 / speed; // clause pause
        }
      }

      this.pacerTimer = window.setTimeout(() => {
        if (!this.synth.speaking || this.isManuallyPaused) return;

        if (!this.boundaryFired && currentIdx + 1 < this.currentTokens.length) {
          currentIdx += 1;
          this.currentWordIndex = currentIdx;
          const charIdx = this.currentTokens[currentIdx].startIndex;
          this.notifyWordChange(currentIdx, charIdx);
        }
        scheduleNext();
      }, baseMs);
    };

    scheduleNext();
  }

  private stopPacer() {
    if (this.pacerTimer !== null) {
      window.clearTimeout(this.pacerTimer);
      this.pacerTimer = null;
    }
  }

  public jumpToWord(wordIndex: number): void {
    if (wordIndex < 0 || wordIndex >= this.currentTokens.length) return;
    this.speak(
      this.currentText,
      this.currentLanguage,
      this.currentSpeed,
      wordIndex
    );
  }

  public setSpeed(speed: number): void {
    this.currentSpeed = speed;
    if (this.synth.speaking && this.currentText) {
      this.speak(
        this.currentText,
        this.currentLanguage,
        speed,
        this.currentWordIndex
      );
    }
  }

  public stop(): void {
    this.stopPacer();
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.currentWordIndex = 0;
    this.isManuallyPaused = false;
  }

  public pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.isManuallyPaused = true;
      this.stopPacer();
      this.synth.pause();
      this.callbacks.onPause?.();
    }
  }

  public resume(): void {
    if (this.synth && (this.synth.paused || this.isManuallyPaused)) {
      this.isManuallyPaused = false;
      this.synth.resume();
      this.startPacer(this.currentWordIndex, this.currentSpeed);
      this.callbacks.onResume?.();
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking && !this.synth.paused && !this.isManuallyPaused);
  }

  public isPaused(): boolean {
    return !!(this.synth && (this.synth.paused || this.isManuallyPaused));
  }

  public getCurrentWordIndex(): number {
    return this.currentWordIndex;
  }

  public getCurrentTokens(): WordToken[] {
    return this.currentTokens;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return getLoadedVoices();
  }
}

export const ttsService = new TextToSpeechService();

export const speakText = (
  text: string,
  language: Language = 'en',
  speed: number = 1,
  startWordIndex: number = 0,
  callbacks?: SpeechCallbacks
) => {
  ttsService.speak(text, language, speed, startWordIndex, callbacks);
};

export const changeSpeechSpeed = (speed: number) => {
  ttsService.setSpeed(speed);
};

export const stopSpeech = () => {
  ttsService.stop();
};

export const pauseSpeech = () => {
  ttsService.pause();
};

export const resumeSpeech = () => {
  ttsService.resume();
};
