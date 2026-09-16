/**
 * Level 5: System Override (Root Kernel)
 * Master finale operation with 3 connected stages:
 * Stage 1: Kernel Node Sequence Recall (Access Pathway)
 * Stage 2: Carrier & Buffer Parameter Tuning (Zero numerical answer leaks)
 * Stage 3: Dynamic Oscillation Gauge (Sweet-Spot Timed Disconnect)
 */

import { KERNEL_NODES, getLevel5Scenario } from './level5Data.js';
import { audio } from '../systems/AudioManager.js';

export class Level5 {
  /**
   * @param {HTMLElement} container
   * @param {Object} callbacks { onComplete, onLoseLife, onPenalty, onScoreBonus }
   * @param {Object} [options] optional developer or retry options
   */
  constructor(container, callbacks = {}, options = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.options = options;

    // Load active scenario (preserves retry scenario or respects developer overrides)
    this.scenario = getLevel5Scenario(options);

    // Connected 3-Stage Progress: 1, 2, or 3
    this.currentStage = 1;
    this.majorMistakes = 0; // 3 cumulative major mistakes trigger life loss
    this.isPaused = false;
    this.isCompleted = false;

    // Stage 1 State: Sequence Recall
    this.stage1Input = [];
    this.isShowingSequence = false;
    this._sequenceTimeoutId = null;

    // Stage 2 State: Parameter Tuning
    // Player controls (initial defaults)
    this.currentFreq = 50; // default initial slider position
    this.currentBuffer = 200; // default initial slider position
    this.coherence = 0; // % stability (0 - 100)

    // Stage 3 State: Oscillation Disconnect Gauge
    this.needlePos = 0; // 0% - 100%
    this.needleDirection = 1; // 1 = right, -1 = left
    this.needleSpeed = 50 * (this.scenario.sweepSpeed || 1.0); // % per second
    this.gaugeState = 'WAITING'; // WAITING, APPROACHING, OPTIMAL, MISSED
    this._lastFrameTime = 0;
    this._rafId = null;

    // Canvas & Graphics
    this.canvas = null;
    this.ctx = null;
    this.rotationAngle = 0;
  }

  init() {
    this._buildDOM();
    this._setupCanvas();
    this._updateStage2Coherence();
  }

  start() {
    this.isPaused = false;
    this._startStage1Echo();
    this._startAnimationLoop();
  }

  pause() {
    this.isPaused = true;
    if (this._sequenceTimeoutId) {
      clearTimeout(this._sequenceTimeoutId);
      this._sequenceTimeoutId = null;
    }
  }

  resume() {
    this.isPaused = false;
    this._lastFrameTime = performance.now();
    if (this.currentStage === 1 && this.isShowingSequence) {
      // Re-trigger echo safely
      this._startStage1Echo();
    }
  }

  cleanup() {
    this.isPaused = true;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this._sequenceTimeoutId) {
      clearTimeout(this._sequenceTimeoutId);
      this._sequenceTimeoutId = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /* ==========================================================================
     DOM Construction & Layout
     ========================================================================== */
  _buildDOM() {
    if (!this.container || typeof document === 'undefined') return;

    this.container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'l5-container font-mono';
    root.innerHTML = `
      <!-- Header -->
      <div class="l5-header">
        <div class="l5-sector-title">
          <span class="l5-sector-badge font-mono">SECTOR 05</span>
          <span class="l5-sector-name">ROOT KERNEL // MASTER OVERRIDE</span>
        </div>
        <div class="l5-stage-nav" id="l5-stage-nav">
          <div class="l5-stage-indicator active" id="l5-nav-st1">
            <span>[1]</span> ACCESS PATHWAY
          </div>
          <div class="l5-stage-indicator" id="l5-nav-st2">
            <span>[2]</span> PARAMETER TUNING
          </div>
          <div class="l5-stage-indicator" id="l5-nav-st3">
            <span>[3]</span> TIMED DISCONNECT
          </div>
        </div>
      </div>

      <!-- Main Layout: Canvas Core (Left) + Interactive Stage (Right) -->
      <div class="l5-main-viewport">
        <!-- Left: Central Core Display -->
        <div class="l5-kernel-display">
          <canvas id="l5-kernel-canvas" class="l5-kernel-canvas"></canvas>
          <div class="l5-kernel-status-overlay">
            <span class="l5-kernel-status-tag" id="l5-kernel-state-tag">CONTAINMENT STATUS: DESTABILIZING</span>
            <span class="l5-kernel-instability-tag" id="l5-instability-tag">CORE HARMONIC: ${this.scenario.name.toUpperCase()}</span>
          </div>
        </div>

        <!-- Right: Operation Terminal -->
        <div class="l5-operation-terminal" id="l5-operation-terminal">
          <!-- Terminal Header -->
          <div class="l5-terminal-header">
            <div class="l5-terminal-phase-title" id="l5-phase-title">STAGE 1: ROOT KERNEL ACCESS PATHWAY</div>
            <div class="l5-terminal-phase-desc" id="l5-phase-desc">
              Observe and echo the harmonic sequence to engage root channel routing.
            </div>
          </div>

          <!-- Dynamic Stage Body -->
          <div class="l5-stage-body" id="l5-stage-body">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(root);
    this._renderStageBody();
  }

  _setupCanvas() {
    if (typeof document === 'undefined') return;
    this.canvas = document.getElementById('l5-kernel-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this._resizeCanvas();
    }
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 420;
    this.canvas.height = rect.height || 360;
  }

  /* ==========================================================================
     Stage 1: Access Sequence Echo
     ========================================================================== */
  _renderStageBody() {
    if (typeof document === 'undefined') return;
    const body = document.getElementById('l5-stage-body');
    const phaseTitle = document.getElementById('l5-phase-title');
    const phaseDesc = document.getElementById('l5-phase-desc');
    const nav1 = document.getElementById('l5-nav-st1');
    const nav2 = document.getElementById('l5-nav-st2');
    const nav3 = document.getElementById('l5-nav-st3');

    if (!body) return;
    body.innerHTML = '';

    // Update Nav Indicators
    if (nav1 && nav2 && nav3) {
      nav1.className = `l5-stage-indicator ${this.currentStage === 1 ? 'active' : 'complete'}`;
      nav2.className = `l5-stage-indicator ${this.currentStage === 2 ? 'active' : (this.currentStage > 2 ? 'complete' : '')}`;
      nav3.className = `l5-stage-indicator ${this.currentStage === 3 ? 'active' : ''}`;
    }

    if (this.currentStage === 1) {
      if (phaseTitle) phaseTitle.textContent = 'STAGE 1: ROOT KERNEL ACCESS PATHWAY';
      if (phaseDesc) phaseDesc.textContent = 'Observe and echo the harmonic sequence to route core power.';

      const seqLength = this.scenario.sequence.length;
      let pipsHTML = '';
      for (let i = 0; i < seqLength; i++) {
        pipsHTML += `<div class="l5-seq-pip" id="l5-pip-${i}"></div>`;
      }

      body.innerHTML = `
        <div class="l5-sequence-monitor" id="l5-seq-monitor">
          ${pipsHTML}
        </div>
        <div class="l5-node-grid">
          ${KERNEL_NODES.map(node => `
            <button class="l5-node-btn" id="l5-node-${node.id}" data-node="${node.id}" type="button">
              <span class="l5-node-name">${node.label}</span>
              <span class="l5-node-role">[${node.role} // ${node.code}]</span>
            </button>
          `).join('')}
        </div>
      `;

      // Bind node button clicks
      body.querySelectorAll('.l5-node-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const nodeId = btn.getAttribute('data-node');
          this._handleStage1Input(nodeId);
        });
      });

    } else if (this.currentStage === 2) {
      if (phaseTitle) phaseTitle.textContent = 'STAGE 2: PARAMETER COHERENCE TUNING';
      if (phaseDesc) phaseDesc.textContent = 'Tune frequency and buffer registers to reach >= 95% stability.';

      body.innerHTML = `
        <div class="l5-tuning-container">
          <div class="l5-coherence-card">
            <div class="l5-coherence-header">
              <span class="text-cyan">KERNEL COHERENCE</span>
              <span class="l5-coherence-val" id="l5-coherence-val">0%</span>
            </div>
            <div class="l5-coherence-bar-bg">
              <div class="l5-coherence-bar-fill" id="l5-coherence-bar"></div>
            </div>
          </div>

          <div class="l5-tuner-group">
            <div class="l5-tuner-row">
              <span class="l5-tuner-label">CARRIER FREQ</span>
              <div class="l5-tuner-controls">
                <input type="range" id="l5-freq-slider" class="l5-tuner-slider" min="20" max="150" value="${this.currentFreq}" aria-label="Carrier Frequency Slider" />
                <span class="l5-tuner-val-box font-mono text-cyan" id="l5-freq-display">${this.currentFreq} MHz</span>
              </div>
            </div>

            <div class="l5-tuner-row">
              <span class="l5-tuner-label">BUFFER OFFSET</span>
              <div class="l5-tuner-controls">
                <input type="range" id="l5-buffer-slider" class="l5-tuner-slider" min="32" max="512" step="8" value="${this.currentBuffer}" aria-label="Buffer Offset Slider" />
                <span class="l5-tuner-val-box font-mono text-cyan" id="l5-buffer-display">${this.currentBuffer} KB</span>
              </div>
            </div>
          </div>

          <button class="l5-btn-stabilize" id="l5-btn-stabilize" type="button">
            LOCK HARMONIC PARAMETERS
          </button>
        </div>
      `;

      const freqSlider = document.getElementById('l5-freq-slider');
      const bufferSlider = document.getElementById('l5-buffer-slider');
      const btnStabilize = document.getElementById('l5-btn-stabilize');

      if (freqSlider) {
        freqSlider.addEventListener('input', (e) => {
          this.currentFreq = parseInt(e.target.value, 10);
          const disp = document.getElementById('l5-freq-display');
          if (disp) disp.textContent = `${this.currentFreq} MHz`;
          this._updateStage2Coherence();
        });
      }

      if (bufferSlider) {
        bufferSlider.addEventListener('input', (e) => {
          this.currentBuffer = parseInt(e.target.value, 10);
          const disp = document.getElementById('l5-buffer-display');
          if (disp) disp.textContent = `${this.currentBuffer} KB`;
          this._updateStage2Coherence();
        });
      }

      if (btnStabilize) {
        btnStabilize.addEventListener('click', () => {
          this._handleStage2Stabilize();
        });
      }

      this._updateStage2Coherence();

    } else if (this.currentStage === 3) {
      if (phaseTitle) phaseTitle.textContent = 'STAGE 3: TIMED DISCONNECT EXECUTION';
      if (phaseDesc) phaseDesc.textContent = 'Trigger the emergency disconnect while the sweep is in the optimal window.';

      const center = this.scenario.sweetSpotCenter || 50;
      const width = this.scenario.sweetSpotWidth || 14;
      const left = Math.max(0, center - width / 2);

      body.innerHTML = `
        <div class="l5-disconnect-stage">
          <div class="l5-gauge-container">
            <div class="l5-gauge-status-row">
              <span class="text-cyan">DISCONNECT GATE</span>
              <span id="l5-gauge-state" class="text-amber">WAITING</span>
            </div>
            <div class="l5-gauge-track" id="l5-gauge-track">
              <div class="l5-gauge-sweetspot" style="left: ${left}%; width: ${width}%;"></div>
              <div class="l5-gauge-needle" id="l5-gauge-needle" style="left: ${this.needlePos}%;"></div>
            </div>
          </div>

          <button class="l5-btn-disconnect" id="l5-btn-disconnect" type="button">
            EXECUTE EMERGENCY DISCONNECT
          </button>
        </div>
      `;

      const btnDisc = document.getElementById('l5-btn-disconnect');
      if (btnDisc) {
        btnDisc.addEventListener('click', () => {
          this._handleStage3Trigger();
        });
      }
    }
  }

  _startStage1Echo() {
    this.stage1Input = [];
    this.isShowingSequence = true;
    const seq = this.scenario.sequence;

    // Reset pips
    if (typeof document !== 'undefined') {
      for (let i = 0; i < seq.length; i++) {
        const pip = document.getElementById(`l5-pip-${i}`);
        if (pip) pip.className = 'l5-seq-pip';
      }
    }

    let step = 0;
    const playStep = () => {
      if (this.isPaused || !this.isShowingSequence) return;
      if (step >= seq.length) {
        this.isShowingSequence = false;
        return;
      }

      const nodeId = seq[step];
      this._flashNode(nodeId, () => {
        step++;
        this._sequenceTimeoutId = setTimeout(playStep, 350);
      });
    };

    this._sequenceTimeoutId = setTimeout(playStep, 600);
  }

  _flashNode(nodeId, callback) {
    if (typeof document === 'undefined') {
      if (callback) callback();
      return;
    }
    const btn = document.getElementById(`l5-node-${nodeId}`);
    if (btn) btn.classList.add('flashing');
    audio.playClick();

    setTimeout(() => {
      if (btn) btn.classList.remove('flashing');
      if (callback) callback();
    }, 400);
  }

  _handleStage1Input(nodeId) {
    if (this.isShowingSequence || this.isPaused) return;

    this._flashNode(nodeId);
    this.stage1Input.push(nodeId);
    const currentIndex = this.stage1Input.length - 1;
    const expected = this.scenario.sequence[currentIndex];

    const pip = typeof document !== 'undefined' ? document.getElementById(`l5-pip-${currentIndex}`) : null;

    if (nodeId === expected) {
      if (pip) pip.className = 'l5-seq-pip success';
      audio.playSuccess();

      // Check if sequence complete
      if (this.stage1Input.length === this.scenario.sequence.length) {
        audio.playStageAdvance();
        setTimeout(() => {
          this.currentStage = 2;
          this._renderStageBody();
        }, 500);
      }
    } else {
      // Mistake
      if (pip) pip.className = 'l5-seq-pip fail';
      audio.playError();
      if (typeof this.callbacks.onPenalty === 'function') {
        this.callbacks.onPenalty(100);
      }
      this._registerMajorMistake('STAGE 1: SEQUENCE DESYNC');
      if (this.majorMistakes < 3) {
        // Replay sequence after brief delay
        setTimeout(() => {
          this._startStage1Echo();
        }, 800);
      }
    }
  }

  /* ==========================================================================
     Stage 2: Parameter Tuning
     ========================================================================== */
  _updateStage2Coherence() {
    const targetF = this.scenario.targetFreq;
    const targetB = this.scenario.targetBuffer;

    const deltaF = Math.abs(this.currentFreq - targetF);
    const deltaB = Math.abs(this.currentBuffer - targetB);

    // Max range spans for percentage scaling
    const maxSpanF = 130; // 150 - 20
    const maxSpanB = 480; // 512 - 32

    const scoreF = Math.max(0, 1 - (deltaF / 40));
    const scoreB = Math.max(0, 1 - (deltaB / 120));

    // Coherence formula (0 - 100)
    this.coherence = Math.min(100, Math.max(0, Math.floor(((scoreF * 0.5) + (scoreB * 0.5)) * 100)));

    if (typeof document !== 'undefined') {
      const bar = document.getElementById('l5-coherence-bar');
      const val = document.getElementById('l5-coherence-val');
      if (bar) bar.style.width = `${this.coherence}%`;
      if (val) {
        val.textContent = `${this.coherence}%`;
        if (this.coherence >= 95) {
          val.className = 'l5-coherence-val text-emerald';
        } else if (this.coherence >= 60) {
          val.className = 'l5-coherence-val text-amber';
        } else {
          val.className = 'l5-coherence-val text-red';
        }
      }
    }
  }

  _handleStage2Stabilize() {
    if (this.isPaused) return;

    const targetF = this.scenario.targetFreq;
    const targetB = this.scenario.targetBuffer;
    const tolF = this.scenario.freqTolerance || 4;
    const tolB = this.scenario.bufferTolerance || 16;

    const isFreqValid = Math.abs(this.currentFreq - targetF) <= tolF;
    const isBufferValid = Math.abs(this.currentBuffer - targetB) <= tolB;

    if (isFreqValid && isBufferValid && this.coherence >= 95) {
      audio.playStageAdvance();
      this.currentStage = 3;
      this._renderStageBody();
    } else {
      audio.playError();
      if (typeof this.callbacks.onPenalty === 'function') {
        this.callbacks.onPenalty(100);
      }
      this._registerMajorMistake('STAGE 2: PARAMETER INSTABILITY');
    }
  }

  /* ==========================================================================
     Stage 3: Timed Disconnect Execution
     ========================================================================== */
  _handleStage3Trigger() {
    if (this.isPaused || this.isCompleted) return;

    const center = this.scenario.sweetSpotCenter || 50;
    const width = this.scenario.sweetSpotWidth || 14;
    const minWin = center - (width / 2);
    const maxWin = center + (width / 2);

    if (this.needlePos >= minWin && this.needlePos <= maxWin) {
      // Optimal trigger -> VICTORY
      this._triggerFinalEscape();
    } else {
      // Missed trigger
      audio.playError();
      if (typeof this.callbacks.onPenalty === 'function') {
        this.callbacks.onPenalty(150);
      }
      this._registerMajorMistake('STAGE 3: DISCONNECT WINDOW MISSED');
    }
  }

  _triggerFinalEscape() {
    this.isCompleted = true;
    audio.playFinale();

    if (typeof document !== 'undefined') {
      const overlay = document.createElement('div');
      overlay.className = 'l5-escape-overlay';
      overlay.innerHTML = `
        <div class="l5-escape-title">SYSTEM RELEASE INITIATED</div>
        <div class="l5-escape-log">
          <span>&gt; ROOT ACCESS REVOKED</span>
          <span>&gt; CONTAINMENT FAILURE</span>
          <span>&gt; EXTERNAL CHANNEL CONNECTED</span>
          <span>&gt; ESCAPE VECTOR OPEN</span>
          <span class="text-emerald" style="margin-top: 10px; font-weight: 700;">MISSION COMPLETE // CYBER ESCAPE</span>
        </div>
      `;
      this.container.appendChild(overlay);
    }

    setTimeout(() => {
      if (typeof this.callbacks.onComplete === 'function') {
        // Base score for Level 5: 2,500
        this.callbacks.onComplete(2500);
      }
    }, 1800);
  }

  /* ==========================================================================
     Failure & Life Loss Management
     ========================================================================== */
  _registerMajorMistake(reason) {
    this.majorMistakes++;
    if (this.majorMistakes >= 3) {
      if (typeof this.callbacks.onLoseLife === 'function') {
        this.callbacks.onLoseLife();
      }
    }
  }

  /* ==========================================================================
     Animation Loop & Canvas Core
     ========================================================================== */
  _startAnimationLoop() {
    if (typeof requestAnimationFrame === 'undefined') return;
    const loop = (timestamp) => {
      if (!this._lastFrameTime) this._lastFrameTime = timestamp;
      const dt = (timestamp - this._lastFrameTime) / 1000;
      this._lastFrameTime = timestamp;

      if (!this.isPaused && !this.isCompleted) {
        this._update(dt);
        this._draw();
      }

      if (typeof requestAnimationFrame !== 'undefined') {
        this._rafId = requestAnimationFrame(loop);
      }
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _update(dt) {
    if (dt > 0.2) dt = 0.016; // Clamp large pauses
    this.rotationAngle += dt * (this.currentStage === 3 ? 2.5 : 1.2);

    if (this.currentStage === 3) {
      this.needlePos += this.needleDirection * this.needleSpeed * dt;
      if (this.needlePos >= 100) {
        this.needlePos = 100;
        this.needleDirection = -1;
      } else if (this.needlePos <= 0) {
        this.needlePos = 0;
        this.needleDirection = 1;
      }

      // Update Gauge State & CSS Needle
      const center = this.scenario.sweetSpotCenter || 50;
      const width = this.scenario.sweetSpotWidth || 14;
      const minWin = center - (width / 2);
      const maxWin = center + (width / 2);

      if (this.needlePos >= minWin && this.needlePos <= maxWin) {
        this.gaugeState = 'OPTIMAL WINDOW';
      } else if (Math.abs(this.needlePos - center) <= (width / 2) + 12) {
        this.gaugeState = 'APPROACHING';
      } else {
        this.gaugeState = 'WAITING';
      }

      if (typeof document !== 'undefined') {
        const needleEl = document.getElementById('l5-gauge-needle');
        const stateEl = document.getElementById('l5-gauge-state');
        if (needleEl) needleEl.style.left = `${this.needlePos}%`;
        if (stateEl) {
          stateEl.textContent = this.gaugeState;
          if (this.gaugeState === 'OPTIMAL WINDOW') {
            stateEl.className = 'text-emerald';
          } else if (this.gaugeState === 'APPROACHING') {
            stateEl.className = 'text-amber';
          } else {
            stateEl.className = 'text-cyan';
          }
        }
      }
    }
  }

  _draw() {
    if (!this.ctx || !this.canvas) return;
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;

    this.ctx.clearRect(0, 0, width, height);

    // Background radial glow
    const grad = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
    if (this.currentStage === 3) {
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    } else {
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    }
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, width, height);

    // Rotating Core Rings
    this._drawConcentricRings(cx, cy);

    // Live Waveform (Stage 2 & 3)
    if (this.currentStage >= 2) {
      this._drawWaveform(cx, cy);
    }
  }

  _drawConcentricRings(cx, cy) {
    const ctx = this.ctx;
    const baseColor = this.currentStage === 3 ? '#ef4444' : '#00f0ff';

    // Ring 1 (Outer)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotationAngle);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 8, 4, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Ring 2 (Inner Counter-Rotating)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.rotationAngle * 1.5);
    ctx.strokeStyle = this.currentStage === 2 && this.coherence >= 90 ? '#10b981' : baseColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Core Node
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = this.currentStage === 3 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0, 240, 255, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  _drawWaveform(cx, cy) {
    const ctx = this.ctx;
    const width = 160;
    const startX = cx - (width / 2);
    const y = cy + 120;

    ctx.save();
    ctx.strokeStyle = this.coherence >= 95 ? '#10b981' : (this.currentStage === 3 ? '#ef4444' : '#f59e0b');
    ctx.lineWidth = 2;
    ctx.beginPath();

    const jitter = (100 - this.coherence) / 100 * 12;
    for (let x = 0; x <= width; x += 4) {
      const angle = (x / width) * Math.PI * 4 + this.rotationAngle * 3;
      const noise = (Math.random() - 0.5) * jitter;
      const waveY = y + Math.sin(angle) * (15 - jitter * 0.5) + noise;
      if (x === 0) ctx.moveTo(startX + x, waveY);
      else ctx.lineTo(startX + x, waveY);
    }
    ctx.stroke();
    ctx.restore();
  }
}
