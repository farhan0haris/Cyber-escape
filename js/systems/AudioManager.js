/**
 * Web Audio API Synthesizer Foundation
 * Procedural retro cyber audio without external audio asset dependencies
 */

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._isEnabled = false;
    this._isInitialized = false;
  }

  get isEnabled() {
    return this._isEnabled;
  }

  /**
   * Initializes AudioContext upon user gesture
   */
  initialize() {
    if (this._isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this._ctx = new AudioCtx();
        this._isInitialized = true;
      }
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not supported.', e);
    }
  }

  setEnabled(enabled) {
    this._isEnabled = Boolean(enabled);
    if (this._isEnabled && this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  toggle() {
    this.setEnabled(!this._isEnabled);
    return this._isEnabled;
  }

  playClick() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Audio autoplay or context errors safely caught
    }
  }

  playSuccess() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(880, now + 0.16); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playError() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playWarning() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playCheckpoint() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.07); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playStageAdvance() {
    if (!this._isEnabled || !this._ctx) return;
    try {
      const now = this._ctx.currentTime;
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(1046.50, now + 0.12); // C6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this._ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

export const audio = new AudioManager();

