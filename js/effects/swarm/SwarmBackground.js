/**
 * Cyber Escape Swarm Background Host
 * Lifecycle manager, DOM mount, visibility listener, resize observer,
 * reduced motion handling, and game state integration.
 */

import { SwarmRenderer } from './SwarmRenderer.js';

export class SwarmBackground {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.container] Root container element (defaults to body)
   * @param {number} [options.opacity=0.65] CSS opacity (defaults to 0.65)
   * @param {boolean} [options.reducedMotion]
   */
  constructor(options = {}) {
    this.container = options.container || (typeof document !== 'undefined' ? document.body : null);
    this.opacity = options.opacity !== undefined ? options.opacity : 0.65;

    this.wrapper = null;
    this.canvas = null;
    this.renderer = null;

    this.isRunning = false;
    this.isPaused = false;
    this.rafId = null;
    this.startTime = 0;

    this.resizeObserver = null;
    this._boundVisibilityChange = this._handleVisibilityChange.bind(this);
    this._boundResize = this._handleResize.bind(this);
    this._boundContextLost = this._handleContextLost.bind(this);
    this._boundContextRestored = this._handleContextRestored.bind(this);
    this._boundReducedMotion = this._handleReducedMotionChange.bind(this);
    this._motionMediaQuery = null;
  }

  /**
   * Mount the Swarm background layer into the DOM
   */
  mount() {
    if (typeof document === 'undefined' || !this.container) return;
    if (this.wrapper) return; // Already mounted

    // Create container element
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'swarm-bg-container';
    this.wrapper.id = 'swarm-bg-layer';
    this.wrapper.setAttribute('aria-hidden', 'true');
    this.wrapper.style.opacity = String(this.opacity);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'swarm-bg-canvas';
    this.wrapper.appendChild(this.canvas);

    // Insert behind UI (z-index: 1)
    if (this.container.firstChild) {
      this.container.insertBefore(this.wrapper, this.container.firstChild);
    } else {
      this.container.appendChild(this.wrapper);
    }

    // Initialize WebGL Swarm Renderer
    const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new SwarmRenderer(this.canvas, {
      reducedMotion: isReduced
    });

    // Setup Context Loss Handlers
    this.canvas.addEventListener('webglcontextlost', this._boundContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this._boundContextRestored, false);

    // Setup Visibility, Resize, and Reduced Motion Observers
    document.addEventListener('visibilitychange', this._boundVisibilityChange);
    window.addEventListener('resize', this._boundResize);

    if (typeof window !== 'undefined' && window.matchMedia) {
      this._motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (this._motionMediaQuery.addEventListener) {
        this._motionMediaQuery.addEventListener('change', this._boundReducedMotion);
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this._handleResize());
      this.resizeObserver.observe(this.wrapper);
    }

    this._handleResize();
    this.start();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now();

    const loop = (timestamp) => {
      if (!this.isRunning) return;

      if (!this.isPaused && !document.hidden && this.renderer && this.opacity > 0.001) {
        const timeSec = (timestamp - this.startTime) / 1000;
        this.renderer.render(timeSec);
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  /**
   * Set container opacity
   * @param {number} opacity Value between 0.0 and 1.0
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
    if (this.wrapper) {
      this.wrapper.style.opacity = String(this.opacity);
    }
    if (this.renderer) {
      this.renderer.setIntensity(this.opacity);
    }
    if (this.opacity <= 0.001) {
      this.pause();
    } else {
      this.resume();
    }
  }

  _handleResize() {
    if (!this.wrapper || !this.renderer) return;
    const w = window.innerWidth || (document.documentElement ? document.documentElement.clientWidth : 800);
    const h = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 600);
    this.renderer.resize(w, h);
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      if (this.opacity > 0.001) {
        this.resume();
      }
    }
  }

  _handleReducedMotionChange(e) {
    if (this.renderer) {
      this.renderer.setReducedMotion(e.matches);
    }
  }

  _handleContextLost(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.warn('[SwarmBackground] WebGL context lost.');
    if (this.renderer) this.renderer.isContextLost = true;
  }

  _handleContextRestored() {
    console.info('[SwarmBackground] WebGL context restored.');
    if (this.renderer) {
      this.renderer.isContextLost = false;
      this.renderer._initWebGL();
      this._handleResize();
    }
  }

  /**
   * Clean up all resources, listeners, and remove DOM
   */
  destroy() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._boundVisibilityChange);
      window.removeEventListener('resize', this._boundResize);
    }

    if (this._motionMediaQuery && this._motionMediaQuery.removeEventListener) {
      this._motionMediaQuery.removeEventListener('change', this._boundReducedMotion);
    }

    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this._boundContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this._boundContextRestored);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
      this.wrapper = null;
    }
  }
}

// Global Singleton Instance
export const swarmBackground = new SwarmBackground();
