import { LanguageCode } from '../types';

export type VoiceStateListener = (hasTamilVoice: boolean) => void;

class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<VoiceStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
          this.notifyListeners();
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.hasTamilVoice());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const hasTa = this.hasTamilVoice();
    this.listeners.forEach((l) => l(hasTa));
  }

  public hasTamilVoice(): boolean {
    if (!this.synth) return false;
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices.some((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      return l.startsWith('ta');
    });
  }

  public getTamilVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return (
      this.voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === 'ta-in' || l.startsWith('ta');
      }) || null
    );
  }

  public getEnglishVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return (
      this.voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === 'en-in';
      }) ||
      this.voices.find((v) => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l.startsWith('en');
      }) ||
      null
    );
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterance = null;
  }

  public speak(
    text: string,
    lang: LanguageCode = 'ta',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    this.speakAsync(text, lang).then(() => {
      if (onEnd) onEnd();
    });
  }

  public speakAsync(
    text: string,
    lang: LanguageCode = 'en',
    options?: { fallbackTimeoutMs?: number; cancelPrevious?: boolean }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || !this.synth || typeof window === 'undefined') {
        resolve();
        return;
      }

      if (options?.cancelPrevious) {
        this.synth.cancel();
      }

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          this.activeUtterance = null;
          resolve();
        }
      };

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      // Check Tamil voice availability
      if (lang === 'ta') {
        const tamilVoice = this.getTamilVoice();
        // PART E RULE: If no Tamil voice is available on device, do NOT speak in English!
        // Show Tamil captions on screen and resolve after reasonable reading pause.
        if (!tamilVoice) {
          console.warn('[voice] No Tamil voice found on device. Displaying captions without English voice fallback.');
          // Simulate reading pause proportional to length, capped between 1.5s and 3.5s
          const readingDelay = Math.min(3500, Math.max(1500, text.length * 55));
          setTimeout(finish, readingDelay);
          return;
        }

        const fallbackMs = options?.fallbackTimeoutMs ?? 15000;
        const timer = setTimeout(() => {
          finish();
        }, fallbackMs);

        try {
          const utterance = new SpeechSynthesisUtterance(text);
          this.activeUtterance = utterance;
          utterance.lang = 'ta-IN';
          utterance.voice = tamilVoice;
          utterance.rate = 0.88;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            clearTimeout(timer);
            finish();
          };

          utterance.onerror = () => {
            clearTimeout(timer);
            finish();
          };

          this.synth.speak(utterance);
        } catch {
          clearTimeout(timer);
          finish();
        }
        return;
      }

      // English Voice
      const fallbackMs = options?.fallbackTimeoutMs ?? 15000;
      const timer = setTimeout(() => {
        finish();
      }, fallbackMs);

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        this.activeUtterance = utterance;
        utterance.lang = 'en-IN';
        const engVoice = this.getEnglishVoice();
        if (engVoice) {
          utterance.voice = engVoice;
        }
        utterance.rate = 0.90;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          clearTimeout(timer);
          finish();
        };

        utterance.onerror = () => {
          clearTimeout(timer);
          finish();
        };

        this.synth.speak(utterance);
      } catch {
        clearTimeout(timer);
        finish();
      }
    });
  }
}

export const voiceManager = new VoiceManager();
