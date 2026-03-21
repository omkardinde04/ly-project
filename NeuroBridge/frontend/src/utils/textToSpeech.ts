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

  speak(text: string, language: Language, speed: number = 1): void {
    this.stop();

    const settings = this.getVoiceSettings(language);
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    this.currentUtterance.lang = settings.lang;
    this.currentUtterance.rate = settings.rate * speed;
    this.currentUtterance.pitch = settings.pitch;
    this.currentUtterance.volume = settings.volume;

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

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
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

  // Get available voices for debugging
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

export const stopSpeech = () => {
  ttsService.stop();
};
