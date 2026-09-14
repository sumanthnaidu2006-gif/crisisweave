/**
 * CrisisWeave Universal Haptic & Sensory Feedback Engine
 * 
 * Combines standard Web Vibration API (for mobile Android/supported devices)
 * with low-latency Web Audio API micro-acoustic synthesizer (for desktop,
 * laptops, and iOS devices where navigator.vibrate is unavailable or restricted).
 * 
 * Supports user-configurable state stored in localStorage.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'emergencySOS';

const STORAGE_KEY = 'crisisweave_haptics_enabled';

class HapticFeedbackService {
  private enabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    // Read user preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.enabled = stored !== null ? stored === 'true' : true;
    }
  }

  /**
   * Lazily initialize Web Audio API on first user interaction
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Play an ultra-subtle synthesized acoustic micro-click for sensory tactile feel
   */
  private playSensoryAudio(freq: number, durationMs: number, type: OscillatorType = 'sine', volume = 0.08) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Fast attack, exponential decay for a clean "click"
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (durationMs / 1000));
    } catch {
      // Audio context might be blocked prior to user interaction; fail silently
    }
  }

  /**
   * Trigger physical vibration if supported by device
   */
  private vibrate(pattern: number | number[]) {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if rejected by browser policy
      }
    }
  }

  /**
   * Subtle tick for tab switches, filter chips, toggles
   */
  public light() {
    this.vibrate(10);
    this.playSensoryAudio(1400, 12, 'triangle', 0.04);
  }

  /**
   * Medium confirmation pop for buttons, checklist checks, cards
   */
  public medium() {
    this.vibrate(25);
    this.playSensoryAudio(850, 20, 'sine', 0.07);
  }

  /**
   * Solid click for important primary action triggers, mode switches
   */
  public heavy() {
    this.vibrate(45);
    this.playSensoryAudio(420, 35, 'triangle', 0.1);
  }

  /**
   * Positive ascending chord for successful check-ins, safe reports
   */
  public success() {
    this.vibrate([20, 40, 25]);
    this.playSensoryAudio(700, 25, 'sine', 0.06);
    setTimeout(() => {
      this.playSensoryAudio(1050, 35, 'sine', 0.08);
    }, 45);
  }

  /**
   * Cautionary alert for warning triggers, timer thresholds
   */
  public warning() {
    this.vibrate([35, 60, 35]);
    this.playSensoryAudio(550, 40, 'sawtooth', 0.08);
    setTimeout(() => {
      this.playSensoryAudio(440, 50, 'sawtooth', 0.09);
    }, 70);
  }

  /**
   * Urgent emergency SOS vibration pattern & distress beacon acoustic pulse
   */
  public emergencySOS() {
    this.vibrate([120, 60, 120, 60, 220]);
    this.playSensoryAudio(880, 70, 'sawtooth', 0.12);
    setTimeout(() => {
      this.playSensoryAudio(660, 90, 'sawtooth', 0.14);
    }, 80);
    setTimeout(() => {
      this.playSensoryAudio(990, 140, 'sawtooth', 0.16);
    }, 180);
  }

  /**
   * Check if haptics & sensory audio is currently enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle haptics on/off
   */
  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.medium();
    }
    return this.enabled;
  }

  /**
   * Explicitly enable or disable haptics
   */
  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(val));
    }
    this.listeners.forEach((listener) => listener(this.enabled));
  }

  /**
   * Subscribe to haptics setting changes
   */
  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const haptics = new HapticFeedbackService();
