/**
 * High-Precision Delta Timer System
 * Uses performance.now() to prevent drift caused by browser throttling
 */

export class Timer {
  constructor({ onTick, onWarning, onExpired }) {
    this.onTick = onTick || (() => {});
    this.onWarning = onWarning || (() => {});
    this.onExpired = onExpired || (() => {});

    this.totalSeconds = 0;
    this.remainingSeconds = 0;
    this.isRunning = false;
    this.isPaused = false;

    this._rafId = null;
    this._lastTimestamp = 0;
    this._accumulatedMs = 0;
  }

  /**
   * Start a countdown timer
   * @param {number} durationSeconds
   */
  start(durationSeconds) {
    this.cleanup();
    this.totalSeconds = Math.max(0, Math.floor(durationSeconds));
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = true;
    this.isPaused = false;
    this._accumulatedMs = 0;
    this._lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    this.onTick(this.remainingSeconds);
    this._loop(this._lastTimestamp);
  }

  /**
   * Pause the countdown timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    if (this._rafId) {
      if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /**
   * Resume the countdown timer
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this._lastTimestamp = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this._loop(this._lastTimestamp);
  }

  /**
   * Reset countdown timer with given or existing duration
   * @param {number} [newDuration]
   */
  reset(newDuration) {
    const duration = newDuration !== undefined ? newDuration : this.totalSeconds;
    this.start(duration);
  }

  /**
   * Stop timer completely
   */
  stop() {
    this.cleanup();
  }

  /**
   * Safe cleanup to prevent memory leaks and duplicate rAF loops
   */
  cleanup() {
    this.isRunning = false;
    this.isPaused = false;
    if (this._rafId) {
      if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._lastTimestamp = 0;
    this._accumulatedMs = 0;
  }

  _loop(currentTimestamp) {
    if (!this.isRunning || this.isPaused) return;

    const delta = currentTimestamp - this._lastTimestamp;
    this._lastTimestamp = currentTimestamp;
    this._accumulatedMs += delta;

    // Process every full elapsed second
    while (this._accumulatedMs >= 1000) {
      this._accumulatedMs -= 1000;
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.onTick(0);
        this.cleanup();
        this.onExpired();
        return;
      }

      this.onTick(this.remainingSeconds);

      if (this.remainingSeconds === 20 || this.remainingSeconds === 10) {
        this.onWarning(this.remainingSeconds);
      }
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this._rafId = requestAnimationFrame((ts) => this._loop(ts));
    }
  }
}
