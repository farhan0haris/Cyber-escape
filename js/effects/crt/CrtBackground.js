/**
 * Vanilla JS CRT Background Host
 * Lifecycle manager, DOM mount, visibility listener, resize observer,
 * reduced motion handling, and game state integration.
 */

import { CrtRenderer } from './crtRenderer.js';
import { CRT_SCREENS } from './crtScreens.js';

export class CrtBackground {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.container] Root container element (defaults to body)
   * @param {string} [options.variant] Initial variant (defaults to 'terminal')
   * @param {number} [options.opacity] CSS opacity (defaults to 0.35)
   * @param {boolean} [options.reducedMotion]
   */
  constructor(options = {}) {
    this.container = options.container || (typeof document !== 'undefined' ? document.body : null);
    this.initialVariant = options.variant || CRT_SCREENS.TERMINAL;
    this.opacity = options.opacity !== undefined ? options.opacity : 0.35;

    this.wrapper = null;
    this.canvas = null;
    this.renderer = null;

    this.isRunning = false;
    this.isPaused = false;
    this.rafId = null;
    this.startTime = 0;
    this.lastTime = 0;

    this.resizeObserver = null;
    this._boundVisibilityChange = this._handleVisibilityChange.bind(this);
    this._boundResize = this._handleResize.bind(this);
    this._boundContextLost = this._handleContextLost.bind(this);
    this._boundContextRestored = this._handleContextRestored.bind(this);
  }

  /**
   * Mount the CRT background layer into the DOM
   */
  mount() {
    if (typeof document === 'undefined' || !this.container) return;
    if (this.wrapper) return; // Already mounted

    // Create container element
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'crt-bg-container';
    this.wrapper.id = 'crt-bg-layer';
    this.wrapper.setAttribute('aria-hidden', 'true');
    this.wrapper.style.opacity = String(this.opacity);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'crt-bg-canvas';
    this.wrapper.appendChild(this.canvas);

    // Insert as the first child of the container (behind existing UI)
    if (this.container.firstChild) {
      this.container.insertBefore(this.wrapper, this.container.firstChild);
    } else {
      this.container.appendChild(this.wrapper);
    }

    // Initialize WebGL Renderer
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new CrtRenderer(this.canvas, {
      variant: this.initialVariant,
      reducedMotion: isReduced
    });

    // Setup Context Loss Handlers
    this.canvas.addEventListener('webglcontextlost', this._boundContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this._boundContextRestored, false);

    // Setup Visibility and Resize Observers
    document.addEventListener('visibilitychange', this._boundVisibilityChange);
    window.addEventListener('resize', this._boundResize);

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

      if (!this.isPaused && !document.hidden && this.renderer && this.opacity > 0) {
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
   * Set active CRT screen variant
   * @param {'terminal' | 'cinematic' | 'blue_screen' | 'nintendo'} variant
   */
  setVariant(variant) {
    if (this.renderer) {
      this.renderer.setVariant(variant);
    }
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
  }

  /**
   * Adjust color grade / brightness
   */
  setGrade(options) {
    if (this.renderer) {
      this.renderer.setGrade(options);
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
      this.resume();
    }
  }

  _handleContextLost(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.warn('[CrtBackground] WebGL context lost.');
    if (this.renderer) this.renderer.isContextLost = true;
  }

  _handleContextRestored() {
    console.info('[CrtBackground] WebGL context restored.');
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
export const crtBackground = new CrtBackground();
