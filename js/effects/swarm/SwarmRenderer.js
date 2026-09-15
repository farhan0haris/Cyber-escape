/**
 * GPU-Accelerated Raw WebGL Swarm Particle Renderer
 * Pure Vanilla JS, zero CDN dependencies, zero per-frame object allocations.
 */

import { SWARM_VERTEX_SHADER, SWARM_FRAGMENT_SHADER } from './SwarmShaders.js';

export class SwarmRenderer {
  /**
   * @param {HTMLCanvasElement|null} canvas
   * @param {Object} [options]
   * @param {number} [options.speed=0.32]
   * @param {number} [options.chaos=16.0]
   * @param {number} [options.coreSize=8.0]
   * @param {number} [options.maxRadius=135.0]
   * @param {boolean} [options.reducedMotion=false]
   */
  constructor(canvas = null, options = {}) {
    this.canvas = canvas;
    this.speed = options.speed !== undefined ? options.speed : 0.75;
    this.chaos = options.chaos !== undefined ? options.chaos : 14.0;
    this.coreSize = options.coreSize !== undefined ? options.coreSize : 7.0;
    this.maxRadius = options.maxRadius !== undefined ? options.maxRadius : 135.0;
    this.reducedMotion = !!options.reducedMotion;
    this.intensity = 1.0;

    this.gl = null;
    this.program = null;
    this.vbo = null;
    this.isInitialized = false;
    this.isContextLost = false;

    this.particleCount = 0;
    this.width = 0;
    this.height = 0;

    // Uniform Locations
    this.uLocations = {};

    // Preallocated Matrix Buffers (Zero memory allocations during render loop)
    this.projMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);

    if (this.canvas) {
      this._initWebGL();
    }
  }

  /**
   * Determine optimal particle budget according to viewport width and reduced motion
   */
  getAdaptiveParticleCount(width) {
    if (this.reducedMotion) return 800;
    if (width <= 520) return 2200; // Mobile
    if (width <= 1024) return 4800; // Tablet
    return 8500; // Desktop / High performance
  }

  _initWebGL() {
    if (!this.canvas) return;

    try {
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
      }) || this.canvas.getContext('experimental-webgl');
    } catch (e) {
      console.warn('[SwarmRenderer] WebGL not supported.', e);
      return;
    }

    if (!this.gl) {
      console.warn('[SwarmRenderer] WebGL context creation failed.');
      return;
    }

    const gl = this.gl;

    // Compile Shaders
    const vs = this._compileShader(gl.VERTEX_SHADER, SWARM_VERTEX_SHADER);
    const fs = this._compileShader(gl.FRAGMENT_SHADER, SWARM_FRAGMENT_SHADER);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('[SwarmRenderer] Program link failed:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // Cache Uniform Locations
    this.uLocations = {
      u_time: gl.getUniformLocation(this.program, 'u_time'),
      u_speed: gl.getUniformLocation(this.program, 'u_speed'),
      u_chaos: gl.getUniformLocation(this.program, 'u_chaos'),
      u_coreSize: gl.getUniformLocation(this.program, 'u_coreSize'),
      u_maxRadius: gl.getUniformLocation(this.program, 'u_maxRadius'),
      u_viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
      u_projMatrix: gl.getUniformLocation(this.program, 'u_projMatrix'),
      u_viewport: gl.getUniformLocation(this.program, 'u_viewport'),
      u_intensity: gl.getUniformLocation(this.program, 'u_intensity'),
      u_reducedMotion: gl.getUniformLocation(this.program, 'u_reducedMotion')
    };

    // Attribute Locations
    this.aLocations = {
      a_norm: gl.getAttribLocation(this.program, 'a_norm'),
      a_theta: gl.getAttribLocation(this.program, 'a_theta'),
      a_phi: gl.getAttribLocation(this.program, 'a_phi'),
      a_phase: gl.getAttribLocation(this.program, 'a_phase')
    };

    // Allocate & Populate Particle Geometry
    this._rebuildParticles();

    this.isInitialized = true;
  }

  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[SwarmRenderer] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _rebuildParticles() {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    const count = this.getAdaptiveParticleCount(this.width || window.innerWidth || 1200);
    this.particleCount = count;

    // 4 floats per particle: [norm, theta, phi, phase]
    const vertexData = new Float32Array(count * 4);
    const goldenRatio = (1.0 + Math.sqrt(5.0)) / 2.0;

    for (let i = 0; i < count; i++) {
      const norm = i / count;
      const theta = (2.0 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * norm)));
      const phase = Math.random();

      const offset = i * 4;
      vertexData[offset] = norm;
      vertexData[offset + 1] = theta;
      vertexData[offset + 2] = phi;
      vertexData[offset + 3] = phase;
    }

    if (!this.vbo) {
      this.vbo = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    // Setup Attribute Pointers
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

    if (this.aLocations.a_norm !== -1) {
      gl.enableVertexAttribArray(this.aLocations.a_norm);
      gl.vertexAttribPointer(this.aLocations.a_norm, 1, gl.FLOAT, false, stride, 0);
    }
    if (this.aLocations.a_theta !== -1) {
      gl.enableVertexAttribArray(this.aLocations.a_theta);
      gl.vertexAttribPointer(this.aLocations.a_theta, 1, gl.FLOAT, false, stride, 1 * Float32Array.BYTES_PER_ELEMENT);
    }
    if (this.aLocations.a_phi !== -1) {
      gl.enableVertexAttribArray(this.aLocations.a_phi);
      gl.vertexAttribPointer(this.aLocations.a_phi, 1, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    }
    if (this.aLocations.a_phase !== -1) {
      gl.enableVertexAttribArray(this.aLocations.a_phase);
      gl.vertexAttribPointer(this.aLocations.a_phase, 1, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    }
  }

  /**
   * Compute standard 4x4 perspective matrix
   */
  _setPerspectiveMatrix(out, fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const rangeInv = 1.0 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (near + far) * rangeInv;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = near * far * rangeInv * 2;
    out[15] = 0;
  }

  /**
   * Compute view matrix with slow ambient camera drift (orbital yaw & slight pitch)
   */
  _setViewMatrix(out, timeSec) {
    const driftSpeed = this.reducedMotion ? 0.02 : 0.07;
    const yaw = timeSec * driftSpeed;
    const pitch = Math.sin(timeSec * 0.04) * 0.08;

    const camDistance = 110.0;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    // Eye position
    const eyeX = sy * cp * camDistance;
    const eyeY = sp * camDistance;
    const eyeZ = cy * cp * camDistance;

    // Forward vector (Target is center origin 0,0,0)
    let fx = -eyeX;
    let fy = -eyeY;
    let fz = -eyeZ;
    const rlen = 1.0 / (Math.hypot(fx, fy, fz) || 1);
    fx *= rlen;
    fy *= rlen;
    fz *= rlen;

    // Up vector (0, 1, 0) crossed with forward -> Right vector
    let rx = fz; // 1*fz - 0*fy
    let ry = 0;
    let rz = -fx; // 0*fy - 1*fx
    const rlenRight = 1.0 / (Math.hypot(rx, rz) || 1);
    rx *= rlenRight;
    rz *= rlenRight;

    // Actual Up = Right crossed with Forward
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;

    out[0] = rx;
    out[1] = ux;
    out[2] = -fx;
    out[3] = 0;

    out[4] = ry;
    out[5] = uy;
    out[6] = -fy;
    out[7] = 0;

    out[8] = rz;
    out[9] = uz;
    out[10] = -fz;
    out[11] = 0;

    out[12] = -(rx * eyeX + ry * eyeY + rz * eyeZ);
    out[13] = -(ux * eyeX + uy * eyeY + uz * eyeZ);
    out[14] = -(-fx * eyeX + -fy * eyeY + -fz * eyeZ);
    out[15] = 1;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;

    if (!this.canvas || !this.gl) return;

    // Cap devicePixelRatio at 1.5 to maintain smooth 60 FPS while crisp
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const displayWidth = Math.floor(w * dpr);
    const displayHeight = Math.floor(h * dpr);

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    const currentAdaptive = this.getAdaptiveParticleCount(w);
    if (currentAdaptive !== this.particleCount) {
      this._rebuildParticles();
    }
  }

  setReducedMotion(enabled) {
    this.reducedMotion = !!enabled;
    this._rebuildParticles();
  }

  setIntensity(intensity) {
    this.intensity = Math.max(0.0, Math.min(1.0, intensity));
  }

  render(timeSec) {
    if (!this.isInitialized || this.isContextLost || !this.gl || !this.program) return;
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.intensity <= 0.001) return;

    gl.useProgram(this.program);

    // Additive blending for luminous cyber particles
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Update Matrices
    const aspect = (this.canvas.width || 1) / (this.canvas.height || 1);
    this._setPerspectiveMatrix(this.projMatrix, (60.0 * Math.PI) / 180.0, aspect, 1.0, 500.0);
    this._setViewMatrix(this.viewMatrix, timeSec);

    // Send Uniforms
    gl.uniform1f(this.uLocations.u_time, timeSec);
    gl.uniform1f(this.uLocations.u_speed, this.speed);
    gl.uniform1f(this.uLocations.u_chaos, this.chaos);
    gl.uniform1f(this.uLocations.u_coreSize, this.coreSize);
    gl.uniform1f(this.uLocations.u_maxRadius, this.maxRadius);
    gl.uniformMatrix4fv(this.uLocations.u_projMatrix, false, this.projMatrix);
    gl.uniformMatrix4fv(this.uLocations.u_viewMatrix, false, this.viewMatrix);
    gl.uniform2f(this.uLocations.u_viewport, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uLocations.u_intensity, this.intensity);
    gl.uniform1f(this.uLocations.u_reducedMotion, this.reducedMotion ? 1.0 : 0.0);

    // Draw Particles
    gl.drawArrays(gl.POINTS, 0, this.particleCount);
  }

  destroy() {
    this.isInitialized = false;
    if (this.gl) {
      if (this.vbo) {
        this.gl.deleteBuffer(this.vbo);
        this.vbo = null;
      }
      if (this.program) {
        this.gl.deleteProgram(this.program);
        this.program = null;
      }
    }
    this.gl = null;
    this.canvas = null;
  }
}
