/**
 * Raw WebGL CRT Renderer
 * Compiles vertex & fragment shaders, manages screen texture uploads,
 * geometry buffers, and applies hardware-accelerated CRT distortion.
 */

import { CRT_VERTEX_SHADER, CRT_FRAGMENT_SHADER } from './crtShaders.js';
import { CrtScreenGenerator, CRT_SCREENS } from './crtScreens.js';

export class CrtRenderer {
  /**
   * @param {HTMLCanvasElement} canvas Target WebGL Canvas
   * @param {Object} [options]
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.positionBuffer = null;
    this.texture = null;

    // Offscreen Canvas 2D Screen Texture Generator
    this.offscreenCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.screenGen = this.offscreenCanvas ? new CrtScreenGenerator(this.offscreenCanvas) : null;

    // Configuration / Shader Uniforms
    this.variant = options.variant || CRT_SCREENS.TERMINAL;
    this.curvature = options.curvature !== undefined ? options.curvature : 0.18;
    this.scanlines = options.scanlines !== undefined ? options.scanlines : 0.55;
    this.grille = options.grille !== undefined ? options.grille : 0.4;
    this.bloom = options.bloom !== undefined ? options.bloom : 0.45;
    this.chromatic = options.chromatic !== undefined ? options.chromatic : 0.35;
    this.noise = options.noise !== undefined ? options.noise : 0.2;
    this.rollingBar = options.rollingBar !== undefined ? options.rollingBar : 0.3;
    this.flicker = options.flicker !== undefined ? options.flicker : 0.25;
    this.brightness = options.brightness !== undefined ? options.brightness : 0.95;
    this.contrast = options.contrast !== undefined ? options.contrast : 1.1;
    this.saturation = options.saturation !== undefined ? options.saturation : 1.05;
    this.tint = options.tint || [1.0, 1.0, 1.0];
    this.vignette = options.vignette !== undefined ? options.vignette : 0.65;
    this.motion = options.motion !== undefined ? options.motion : 1.0;
    this.reducedMotion = Boolean(options.reducedMotion);

    // Uniform Locations cache
    this.uniforms = {};

    this.isContextLost = false;
    this.isInitialized = false;

    this._initWebGL();
  }

  _initWebGL() {
    if (!this.canvas || typeof window === 'undefined') return;

    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power'
      });
    } catch (e) {
      console.warn('[CrtRenderer] WebGL not supported, falling back.', e);
      return;
    }

    if (!this.gl) return;

    // Compile Program
    const vertShader = this._compileShader(this.gl.VERTEX_SHADER, CRT_VERTEX_SHADER);
    const fragShader = this._compileShader(this.gl.FRAGMENT_SHADER, CRT_FRAGMENT_SHADER);

    if (!vertShader || !fragShader) return;

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertShader);
    this.gl.attachShader(this.program, fragShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('[CrtRenderer] Program link error:', this.gl.getProgramInfoLog(this.program));
      return;
    }

    // Quad geometry covering NDC (-1 to 1)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Screen Texture
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Cache Uniform Locations
    this._cacheUniforms();
    this.isInitialized = true;
  }

  _compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('[CrtRenderer] Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _cacheUniforms() {
    const p = this.program;
    const gl = this.gl;
    const names = [
      'u_screenTexture', 'u_resolution', 'u_time', 'u_curvature',
      'u_scanlines', 'u_grille', 'u_bloom', 'u_chromatic', 'u_noise',
      'u_rollingBar', 'u_flicker', 'u_brightness', 'u_contrast',
      'u_saturation', 'u_tint', 'u_vignette', 'u_motion'
    ];
    names.forEach(name => {
      this.uniforms[name] = gl.getUniformLocation(p, name);
    });
  }

  /**
   * Resize viewport & offscreen screen canvas with performance-optimized resolution capping
   */
  resize(width, height) {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderW = Math.min(1920, Math.max(320, Math.floor(width * dpr)));
    const renderH = Math.min(1080, Math.max(240, Math.floor(height * dpr)));

    if (this.canvas.width !== renderW || this.canvas.height !== renderH) {
      this.canvas.width = renderW;
      this.canvas.height = renderH;
    }

    if (this.offscreenCanvas) {
      const offW = this.variant === CRT_SCREENS.NINTENDO ? 320 : 640;
      const offH = this.variant === CRT_SCREENS.NINTENDO ? 180 : 360;
      if (this.offscreenCanvas.width !== offW || this.offscreenCanvas.height !== offH) {
        this.offscreenCanvas.width = offW;
        this.offscreenCanvas.height = offH;
      }
    }

    if (this.gl && !this.isContextLost) {
      this.gl.viewport(0, 0, renderW, renderH);
    }
  }

  /**
   * Set active screen variant
   * @param {string} variant 'terminal' | 'cinematic' | 'blue_screen' | 'nintendo'
   */
  setVariant(variant) {
    this.variant = variant;
    if (this.canvas) {
      const w = window.innerWidth || 800;
      const h = window.innerHeight || 600;
      this.resize(w, h);
    }
  }

  setReducedMotion(reduced) {
    this.reducedMotion = Boolean(reduced);
    this.motion = this.reducedMotion ? 0.05 : 1.0;
  }

  setGrade(options = {}) {
    if (options.brightness !== undefined) this.brightness = options.brightness;
    if (options.contrast !== undefined) this.contrast = options.contrast;
    if (options.saturation !== undefined) this.saturation = options.saturation;
    if (options.tint) this.tint = options.tint;
    if (options.curvature !== undefined) this.curvature = options.curvature;
    if (options.scanlines !== undefined) this.scanlines = options.scanlines;
  }

  /**
   * Render frame onto WebGL context
   * @param {number} time Time in seconds
   */
  render(time) {
    if (!this.isInitialized || !this.gl || this.isContextLost) return;

    // 1. Draw 2D content on offscreen canvas
    if (this.screenGen) {
      this.screenGen.render(this.variant, time, this.reducedMotion);
    }

    // 2. Upload offscreen texture to WebGL
    const gl = this.gl;
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (this.offscreenCanvas) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.offscreenCanvas);
    }

    // Set Uniforms
    gl.uniform1i(this.uniforms['u_screenTexture'], 0);
    gl.uniform2f(this.uniforms['u_resolution'], this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms['u_time'], time);
    gl.uniform1f(this.uniforms['u_curvature'], this.curvature);
    gl.uniform1f(this.uniforms['u_scanlines'], this.scanlines);
    gl.uniform1f(this.uniforms['u_grille'], this.grille);
    gl.uniform1f(this.uniforms['u_bloom'], this.bloom);
    gl.uniform1f(this.uniforms['u_chromatic'], this.chromatic);
    gl.uniform1f(this.uniforms['u_noise'], this.noise);
    gl.uniform1f(this.uniforms['u_rollingBar'], this.rollingBar);
    gl.uniform1f(this.uniforms['u_flicker'], this.flicker);
    gl.uniform1f(this.uniforms['u_brightness'], this.brightness);
    gl.uniform1f(this.uniforms['u_contrast'], this.contrast);
    gl.uniform1f(this.uniforms['u_saturation'], this.saturation);
    gl.uniform3fv(this.uniforms['u_tint'], this.tint);
    gl.uniform1f(this.uniforms['u_vignette'], this.vignette);
    gl.uniform1f(this.uniforms['u_motion'], this.motion);

    // Bind buffer & Draw Quad
    const aPos = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Full cleanup of WebGL textures, buffers, shaders, and canvases
   */
  destroy() {
    this.isInitialized = false;
    if (this.gl) {
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
    this.texture = null;
    this.positionBuffer = null;
    this.program = null;
    this.gl = null;
    this.offscreenCanvas = null;
    this.screenGen = null;
  }
}
