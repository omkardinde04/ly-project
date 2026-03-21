import type { Language } from '../contexts/DyslexiaContext';

interface VoiceSettings {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentIndex: number = 0;
  private currentText: string = '';
  private currentLanguage: Language = 'en';

  constructor() {
    this.synth = window.speechSynthesis;
  }

  getVoiceSettings(language: Language): VoiceSettings {
    const voiceMap: Record<Language, VoiceSettings> = {
      en: { lang: 'en-US', rate: 1, pitch: 1, volume: 1 },
      hi: { lang: 'hi-IN', rate: 0.9, pitch: 1, volume: 1 },
      mr: { lang: 'mr-IN', rate: 0.9, pitch: 1, volume: 1 },
    };
    return voiceMap[language];
  }

  speak(text: string, language: Language, speed: number = 1, startIndex: number = 0): void {
    // If not resuming, reset
    if (startIndex === 0) {
      this.currentIndex = 0;
    }
    this.currentText = text;
    this.currentLanguage = language;

    this.synth.cancel();

    const settings = this.getVoiceSettings(language);
    const textToSpeak = text.substring(startIndex);
    
    this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    this.currentUtterance.lang = settings.lang;
    this.currentUtterance.rate = settings.rate * speed;
    this.currentUtterance.pitch = settings.pitch;
    this.currentUtterance.volume = settings.volume;

    // Track words to know where we are if we need to change speed mid-speech
    this.currentUtterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.currentIndex = startIndex + event.charIndex;
      }
    };

    // Try to find a voice for the specific language
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(settings.lang.split('-')[0])
    );
    
    if (preferredVoice) {
      this.currentUtterance.voice = preferredVoice;
    }

    this.synth.speak(this.currentUtterance);
  }

  setSpeed(speed: number): void {
    if (this.synth.speaking && this.currentText) {
      // Resume from current tracked point at new speed
      this.speak(this.currentText, this.currentLanguage, speed, this.currentIndex);
    }
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.currentIndex = 0;
  }

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }
}

// Singleton instance
export const ttsService = new TextToSpeechService();

// Hook-friendly functions
export const speakText = (text: string, language: Language, speed: number = 1) => {
  ttsService.speak(text, language, speed);
};

export const changeSpeechSpeed = (speed: number) => {
  ttsService.setSpeed(speed);
};

export const stopSpeech = () => {
  ttsService.stop();
};
