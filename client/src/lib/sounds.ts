// Sound effects utility using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Resume audio context (call this from a user interaction)
  async resumeAudio(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.error('Failed to resume audio context:', err);
      }
    }
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      
      // Auto-resume if suspended (best effort)
      if (ctx.state === 'suspended') {
        this.resumeAudio();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Victory sound - ascending notes
  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 0.2), i * 100);
    });
  }

  // Loss sound - descending notes
  playLoss() {
    const notes = [523.25, 493.88, 440.00, 392.00]; // C5, B4, A4, G4
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 0.15, 'triangle'), i * 150);
    });
  }

  // Match start sound
  playMatchStart() {
    this.playTone(440.00, 0.15, 0.2); // A4
    setTimeout(() => this.playTone(523.25, 0.15, 0.2), 150); // C5
  }

  // Button click sound
  playClick() {
    this.playTone(800, 0.05, 0.1, 'square');
  }

  // Message sent sound
  playMessageSent() {
    this.playTone(659.25, 0.1, 0.15); // E5
  }

  // Turn complete sound
  playTurnComplete() {
    this.playTone(523.25, 0.15, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 0.2), 100); // E5
  }

  // Streak achievement sound
  playStreak() {
    const notes = [659.25, 783.99, 1046.50]; // E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 0.2, 'sine'), i * 80);
    });
  }

  // Error sound
  playError() {
    this.playTone(200, 0.3, 0.2, 'sawtooth');
  }

  // Time warning sound (5 seconds left)
  playTimeWarning() {
    this.playTone(880, 0.1, 0.15);
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
