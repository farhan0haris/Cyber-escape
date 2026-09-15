/**
 * Level 4: Firewall Dodge (Sector 04 // Packet Inspection Corridor)
 * Real-time 2D canvas continuous-movement action puzzle.
 */

import { gameState } from '../core/state.js';
import { audio } from '../systems/AudioManager.js';
import { getLevelMetadata } from '../core/levelMetadata.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ZONE_BOUNDS,
  SPAWN_POSITION,
  CHECKPOINT_POSITION,
  LEVEL4_VARIANTS
} from './level4Data.js';

export class Level4 {
  /**
   * @param {HTMLElement} container
   * @param {Object} callbacks - { onComplete, onLoseLife, onPenalty, onScoreBonus }
   * @param {Object} [options] - optional config (e.g. { variantIndex, variantId })
   */
  constructor(container, callbacks = {}, options = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.options = options;

    // Pick variant
    let vIdx = 0;
    if (typeof options.variantIndex === 'number' && LEVEL4_VARIANTS[options.variantIndex]) {
      vIdx = options.variantIndex;
    } else if (options.variantId) {
      const found = LEVEL4_VARIANTS.findIndex(v => v.id === options.variantId);
      if (found !== -1) vIdx = found;
    } else {
      vIdx = Math.floor(Math.random() * LEVEL4_VARIANTS.length);
    }

    this.variant = LEVEL4_VARIANTS[vIdx];
    this.variantIndex = vIdx;

    // Player State
    this.player = {
      x: SPAWN_POSITION.x,
      y: SPAWN_POSITION.y,
      width: 20,
      height: 20,
      hitboxWidth: 16,
      hitboxHeight: 16,
      vx: 0,
      vy: 0,
      speed: 220
    };

    // Checkpoint State
    this.checkpoint = {
      x: SPAWN_POSITION.x,
      y: SPAWN_POSITION.y,
      isMidpointReached: false
    };

    // Input States
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Game Loop & Timing
    this.rafId = null;
    this.lastTimestamp = 0;
    this.simTime = 0; // Cumulative active time in seconds

    // Flags
    this.isInitialized = false;
    this.isRunning = false;
    this.isPaused = false;
    this.isCompleted = false;
    this.isHandlingCollision = false;
    this.invulnerableTimer = 0; // Seconds of invulnerability remaining
    this.briefingDismissed = false;

    // Metrics & Penalties
    this.mistakesCount = 0;
    this.penaltyPerMistake = 250;
    this.baseScore = 2000;
    this.timeMultiplier = 20;

    // Canvas elements
    this.canvas = null;
    this.ctx = null;

    // Bound handlers
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundKeyUp = this._handleKeyUp.bind(this);
    this._boundLoop = this._gameLoop.bind(this);
  }

  init() {
    this.render();
    this.isInitialized = true;
    this._bindEvents();
  }

  render() {
    if (!this.container || typeof document === 'undefined') return;

    this.container.innerHTML = `
      <div class="l4-container" id="level4-screen">
        <!-- Header -->
        <header class="l4-header">
          <div class="l4-title-group">
            <span class="l4-status-badge ${this.checkpoint.isMidpointReached ? 'checkpoint' : 'active'}" id="l4-status-badge">
              ${this.checkpoint.isMidpointReached ? 'CHECKPOINT: MIDPOINT SECURED' : 'STATUS: CONDUIT ONLINE'}
            </span>
            <h2 class="l4-sector-title">${this.variant.name}</h2>
          </div>
          <div class="l4-attempts-group">
            <span>ROUTE: MULTI-LANE CONDUIT</span>
          </div>
        </header>

        <!-- Objective Banner -->
        <div class="l4-objective-banner" id="l4-objective-banner">
          <div class="l4-obj-indicator">▶ CURRENT OBJECTIVE</div>
          <div class="l4-obj-text" id="l4-obj-text">
            CHOOSE YOUR LANE // EVADE ACTIVE HAZARDS AND REACH THE EXTRACTION GATE
          </div>
        </div>

        <!-- Canvas Viewport -->
        <div class="l4-viewport-wrap" id="l4-viewport-wrap">
          <canvas class="l4-canvas" id="l4-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
          <div id="l4-flash-overlay"></div>
        </div>

        <!-- Beginner Briefing Overlay (Variant 1 / First Launch) -->
        ${!this.briefingDismissed && this.variantIndex === 0 ? `
          <div class="l4-briefing-card" id="l4-briefing-modal">
            <div class="l4-briefing-title">PACKET CORRIDOR ONLINE // SECTOR 04</div>
            <div class="l4-briefing-list">
              <div class="l4-briefing-item">
                <span style="color: #ffaa00;">● AMBER:</span> HAZARD CHARGING (PREPARE / OBSERVE)
              </div>
              <div class="l4-briefing-item">
                <span style="color: #ff0055;">● RED:</span> HAZARD ACTIVE (LETHAL // DO NOT CROSS)
              </div>
              <div class="l4-briefing-item">
                <span style="color: #00ffcc;">● CYAN:</span> SAFE CONDUIT / CHECKPOINT (PROCEED)
              </div>
            </div>
            <p style="font-size: 0.76rem; color: #94a3b8; margin-bottom: 14px;">
              MISSION: Reposition vertically across lanes, time your crossing, and reach the extraction gate.
            </p>
            <button type="button" class="l4-briefing-btn" id="btn-l4-start-briefing">
              INITIALIZE EVASION PROTOCOL
            </button>
          </div>
        ` : ''}

        <!-- Mobile Touch D-Pad -->
        <div class="l4-mobile-dpad" id="l4-mobile-dpad" aria-label="Mobile Navigation D-Pad">
          <button type="button" class="l4-dpad-btn" id="l4-dpad-up" aria-label="Move Up">▲</button>
          <button type="button" class="l4-dpad-btn" id="l4-dpad-left" aria-label="Move Left">◀</button>
          <button type="button" class="l4-dpad-btn" id="l4-dpad-right" aria-label="Move Right">▶</button>
          <button type="button" class="l4-dpad-btn" id="l4-dpad-down" aria-label="Move Down">▼</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#l4-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  _bindEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);

    // Briefing button
    const startBtn = this.container.querySelector('#btn-l4-start-briefing');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        audio.playClick();
        this.dismissBriefing();
      });
    }

    // Mobile D-Pad Pointer Events
    this._bindDpadButton('l4-dpad-up', 'up');
    this._bindDpadButton('l4-dpad-down', 'down');
    this._bindDpadButton('l4-dpad-left', 'left');
    this._bindDpadButton('l4-dpad-right', 'right');
  }

  _bindDpadButton(btnId, direction) {
    if (!this.container) return;
    const btn = this.container.querySelector(`#${btnId}`);
    if (!btn) return;

    const handlePress = (e) => {
      e.preventDefault();
      if (e.pointerId && btn.setPointerCapture) {
        try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      }
      this.keys[direction] = true;
      btn.classList.add('active');
    };

    const handleRelease = (e) => {
      e.preventDefault();
      if (e.pointerId && btn.releasePointerCapture) {
        try { btn.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      this.keys[direction] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('pointerdown', handlePress);
    btn.addEventListener('pointerup', handleRelease);
    btn.addEventListener('pointercancel', handleRelease);
    btn.addEventListener('pointerleave', handleRelease);
  }

  _handleKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keys.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keys.down = true;
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keys.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keys.right = true;
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  _handleKeyUp(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keys.up = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keys.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keys.right = false;
        break;
      default:
        break;
    }
  }

  dismissBriefing() {
    this.briefingDismissed = true;
    const modal = this.container ? this.container.querySelector('#l4-briefing-modal') : null;
    if (modal) modal.remove();
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      this.rafId = window.requestAnimationFrame(this._boundLoop);
    }
  }

  pause() {
    this.isPaused = true;
    if (this.rafId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this._clearInput();
  }

  resume() {
    if (!this.isRunning || this.isCompleted) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      this.rafId = window.requestAnimationFrame(this._boundLoop);
    }
  }

  _clearInput() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
  }

  _gameLoop(timestamp) {
    if (!this.isRunning || this.isPaused || this.isCompleted) return;

    const dt = Math.min(0.1, Math.max(0.001, (timestamp - this.lastTimestamp) / 1000));
    this.lastTimestamp = timestamp;
    this.simTime += dt;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }

    this._update(dt);
    this._draw();

    if (this.isRunning && !this.isPaused && !this.isCompleted && typeof window !== 'undefined') {
      this.rafId = window.requestAnimationFrame(this._boundLoop);
    }
  }

  _update(dt) {
    // 1. Calculate Velocity with Diagonal Normalization
    let dx = 0;
    let dy = 0;

    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      const norm = 1 / Math.SQRT2;
      dx *= norm;
      dy *= norm;
    }

    this.player.x += dx * this.player.speed * dt;
    this.player.y += dy * this.player.speed * dt;

    // 2. Boundary Clamping
    const minX = 0;
    const maxX = CANVAS_WIDTH - this.player.width;
    const minY = 0;
    const maxY = CANVAS_HEIGHT - this.player.height;

    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));

    // 3. Checkpoint Trigger (Midpoint Safe Island)
    if (!this.checkpoint.isMidpointReached && this.player.x >= ZONE_BOUNDS.CHECKPOINT_MIN_X) {
      this.checkpoint.isMidpointReached = true;
      this.checkpoint.x = CHECKPOINT_POSITION.x;
      this.checkpoint.y = CHECKPOINT_POSITION.y;
      audio.playCheckpoint();
      this._updateStatusUI('CHECKPOINT: MIDPOINT SECURED', 'checkpoint');
    }

    // 4. Goal Extraction Check
    if (this.player.x >= ZONE_BOUNDS.GOAL_TRIGGER_X) {
      this._handleExtractionSuccess();
      return;
    }

    // 5. Hazard Evaluation & Collision Checks
    if (this.invulnerableTimer <= 0 && !this.isHandlingCollision) {
      const activeHazards = this._computeActiveHazards();
      for (const h of activeHazards) {
        if (h.isLethal && this._checkPlayerCollision(h)) {
          this._handleCollision(h);
          break;
        }
      }
    }
  }

  _computeActiveHazards() {
    const computed = [];
    const t = this.simTime;

    for (const h of this.variant.hazards) {
      if (h.type === 'barrier_pulse') {
        const cycleTotal = h.cycle.safe + h.cycle.warning + h.cycle.active + h.cycle.cooldown;
        const phaseTime = (t + (h.offset || 0)) % cycleTotal;

        let state = 'SAFE';
        let isLethal = false;

        if (phaseTime < h.cycle.safe) {
          state = 'SAFE';
        } else if (phaseTime < h.cycle.safe + h.cycle.warning) {
          state = 'WARNING';
        } else if (phaseTime < h.cycle.safe + h.cycle.warning + h.cycle.active) {
          state = 'ACTIVE';
          isLethal = true;
        } else {
          state = 'COOLDOWN';
        }

        computed.push({
          id: h.id,
          type: 'barrier_pulse',
          state,
          isLethal,
          x: h.x,
          y: h.y,
          width: h.width,
          height: h.height
        });
      } else if (h.type === 'drone_patrol') {
        const distance = Math.abs(h.yEnd - h.yStart);
        const cycleDuration = (distance / h.speed) * 2;
        const phaseTime = (t + (h.offset || 0)) % cycleDuration;
        const oneWay = distance / h.speed;

        let curY = 0;
        let movingDown = true;

        if (phaseTime < oneWay) {
          const frac = phaseTime / oneWay;
          curY = h.yStart + (h.yEnd - h.yStart) * frac;
          movingDown = (h.yEnd > h.yStart);
        } else {
          const frac = (phaseTime - oneWay) / oneWay;
          curY = h.yEnd + (h.yStart - h.yEnd) * frac;
          movingDown = (h.yStart > h.yEnd);
        }

        computed.push({
          id: h.id,
          type: 'drone_patrol',
          state: 'ACTIVE',
          isLethal: true,
          x: h.x,
          y: curY,
          radius: h.radius,
          movingDown
        });
      } else if (h.type === 'beam_vertical') {
        // Harmonic vertical oscillating laser sweep
        const yCenter = CANVAS_HEIGHT / 2;
        const yPos = yCenter + h.amplitude * Math.sin(2 * Math.PI * h.frequency * t + (h.offset || 0));
        const topY = yPos - h.height / 2;

        computed.push({
          id: h.id,
          type: 'beam_vertical',
          state: 'ACTIVE',
          isLethal: true,
          x: h.x - h.beamWidth / 2,
          y: topY,
          width: h.beamWidth,
          height: h.height
        });
      } else if (h.type === 'burst_stream') {
        const cycleTotal = h.cycle.warning + h.cycle.active + h.cycle.cooldown;
        const phaseTime = (t + (h.offset || 0)) % cycleTotal;

        let state = 'SAFE';
        let isLethal = false;
        const packets = [];

        if (phaseTime < h.cycle.warning) {
          state = 'WARNING';
        } else if (phaseTime < h.cycle.warning + h.cycle.active) {
          state = 'ACTIVE';
          isLethal = true;
          const activeElapsed = phaseTime - h.cycle.warning;
          const spacing = 80;

          for (let i = 0; i < h.packetCount; i++) {
            let pY = 0;
            if (h.direction === 'DOWN') {
              pY = -30 + (activeElapsed * h.speed) - (i * spacing);
            } else {
              pY = CANVAS_HEIGHT + 30 - (activeElapsed * h.speed) + (i * spacing);
            }
            if (pY >= -40 && pY <= CANVAS_HEIGHT + 40) {
              packets.push({ x: h.x, y: pY, size: h.packetSize });
            }
          }
        } else {
          state = 'COOLDOWN';
        }

        computed.push({
          id: h.id,
          type: 'burst_stream',
          state,
          isLethal,
          x: h.x,
          packets
        });
      }
    }

    return computed;
  }

  _checkPlayerCollision(hazard) {
    const px = this.player.x + (this.player.width - this.player.hitboxWidth) / 2;
    const py = this.player.y + (this.player.height - this.player.hitboxHeight) / 2;
    const pw = this.player.hitboxWidth;
    const ph = this.player.hitboxHeight;

    if (hazard.type === 'barrier_pulse' || hazard.type === 'beam_vertical') {
      return (
        px < hazard.x + hazard.width &&
        px + pw > hazard.x &&
        py < hazard.y + hazard.height &&
        py + ph > hazard.y
      );
    }

    if (hazard.type === 'drone_patrol') {
      const closestX = Math.max(px, Math.min(hazard.x, px + pw));
      const closestY = Math.max(py, Math.min(hazard.y, py + ph));
      const distX = hazard.x - closestX;
      const distY = hazard.y - closestY;
      return (distX * distX + distY * distY) < (hazard.radius * hazard.radius);
    }

    if (hazard.type === 'burst_stream') {
      for (const p of hazard.packets) {
        const closestX = Math.max(px, Math.min(p.x, px + pw));
        const closestY = Math.max(py, Math.min(p.y, py + ph));
        const distX = p.x - closestX;
        const distY = p.y - closestY;
        if ((distX * distX + distY * distY) < ((p.size / 2) * (p.size / 2))) {
          return true;
        }
      }
    }

    return false;
  }

  _handleCollision(hazard) {
    this.isHandlingCollision = true;
    this.mistakesCount++;
    audio.playError();

    // Trigger visual screen danger flash
    this._triggerDangerFlash();

    // Penalty callback (Single-shot -250 points)
    if (this.callbacks.onPenalty) {
      this.callbacks.onPenalty(this.penaltyPerMistake);
    }

    // Life loss callback (authoritative GameManager life deduction)
    if (this.callbacks.onLoseLife) {
      this.callbacks.onLoseLife();
    }

    // Safe Respawn to active Checkpoint / Spawn
    this.player.x = this.checkpoint.x;
    this.player.y = this.checkpoint.y;
    this.invulnerableTimer = 1.2; // 1.2s post-respawn invulnerability
    this._clearInput();

    setTimeout(() => {
      this.isHandlingCollision = false;
    }, 100);
  }

  _triggerDangerFlash() {
    const flashEl = this.container ? this.container.querySelector('#l4-flash-overlay') : null;
    if (flashEl) {
      flashEl.className = 'l4-danger-flash';
      setTimeout(() => {
        if (flashEl) flashEl.className = '';
      }, 240);
    }
  }

  _handleExtractionSuccess() {
    this.isCompleted = true;
    this.isRunning = false;
    audio.playSuccess();

    if (this.rafId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const timeRemaining = gameState.state.levelTimeRemaining || 0;
    const timeBonus = timeRemaining * this.timeMultiplier;
    const penaltyTotal = this.mistakesCount * this.penaltyPerMistake;
    const finalScore = Math.max(0, this.baseScore + timeBonus - penaltyTotal);

    this._renderVictoryOverlay(finalScore);

    setTimeout(() => {
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(finalScore);
      }
    }, 1800);
  }

  _renderVictoryOverlay(score) {
    if (typeof document === 'undefined') return;
    const wrap = this.container ? this.container.querySelector('#l4-viewport-wrap') : null;
    if (!wrap) return;

    const overlay = document.createElement('div');
    overlay.className = 'l4-victory-overlay';
    overlay.innerHTML = `
      <div class="l4-victory-card">
        <div class="l4-victory-title">PACKET CORRIDOR BYPASSED</div>
        <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0;">
          Deep packet inspection avoided. Emergency root connection unlocked.
        </p>
        <div class="l4-victory-score">+${score} PTS</div>
        <div style="font-size: 0.75rem; color: #00ffcc; letter-spacing: 0.1em;">
          ROUTING TO SECTOR 05 // ROOT KERNEL...
        </div>
      </div>
    `;
    wrap.appendChild(overlay);
  }

  _updateStatusUI(text, statusClass = 'active') {
    const badge = this.container ? this.container.querySelector('#l4-status-badge') : null;
    if (badge) {
      badge.textContent = text;
      badge.className = `l4-status-badge ${statusClass}`;
    }
  }

  _draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Deep Cyber Corridor Background
    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Ambient Perspective Conduit Lines & Moving Data Packets
    this._drawEnvironmentalDepth(ctx);

    // 3. Draw Zone Regions & Checkpoint / Extraction Gates
    this._drawZonesAndPortals(ctx);

    // 4. Draw Hazards with Rich Telegraphing & Glow Falloff
    this._drawHazards(ctx);

    // 5. Draw Player Avatar with Motion Trail, Directional Orientation & Core Glow
    this._drawPlayer(ctx);
  }

  _drawEnvironmentalDepth(ctx) {
    const t = this.simTime;

    // Subtle Perspective Rails converging to horizontal horizon
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.04)';
    const rails = [30, 90, 150, 210, 240, 300, 360, 420];
    for (const y of rails) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Moving Background Data Packets
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    for (let i = 0; i < 12; i++) {
      const px = ((i * 73 + t * 45) % (CANVAS_WIDTH + 40)) - 20;
      const py = (i * 37) % CANVAS_HEIGHT;
      ctx.fillRect(px, py, 14, 2);
    }

    // Subtle Conduit Grid Guideline Markers
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.08)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(80, 150);
    ctx.lineTo(720, 150);
    ctx.moveTo(80, 300);
    ctx.lineTo(720, 300);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawZonesAndPortals(ctx) {
    const t = this.simTime;

    // ── Start Buffer Zone (Safe Buffer: x = 0 -> 80px) ──
    const startGrad = ctx.createLinearGradient(0, 0, ZONE_BOUNDS.START_ZONE_MAX_X, 0);
    startGrad.addColorStop(0, 'rgba(0, 255, 204, 0.12)');
    startGrad.addColorStop(1, 'rgba(0, 255, 204, 0.02)');
    ctx.fillStyle = startGrad;
    ctx.fillRect(0, 0, ZONE_BOUNDS.START_ZONE_MAX_X, CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(0, 255, 204, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, ZONE_BOUNDS.START_ZONE_MAX_X, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(0, 255, 204, 0.7)';
    ctx.font = 'bold 9px monospace';
    ctx.letterSpacing = '0.08em';
    ctx.fillText('START BUFFER', 8, 22);

    // ── Midpoint Safe Island (x = 380 -> 420px) ──
    const isMid = this.checkpoint.isMidpointReached;
    const islandWidth = ZONE_BOUNDS.CHECKPOINT_MAX_X - ZONE_BOUNDS.CHECKPOINT_MIN_X;

    const islandGrad = ctx.createLinearGradient(ZONE_BOUNDS.CHECKPOINT_MIN_X, 0, ZONE_BOUNDS.CHECKPOINT_MAX_X, 0);
    if (isMid) {
      islandGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      islandGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
      islandGrad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
    } else {
      islandGrad.addColorStop(0, 'rgba(0, 255, 204, 0.08)');
      islandGrad.addColorStop(0.5, 'rgba(0, 255, 204, 0.15)');
      islandGrad.addColorStop(1, 'rgba(0, 255, 204, 0.08)');
    }
    ctx.fillStyle = islandGrad;
    ctx.fillRect(ZONE_BOUNDS.CHECKPOINT_MIN_X, 0, islandWidth, CANVAS_HEIGHT);

    ctx.strokeStyle = isMid ? '#38bdf8' : 'rgba(0, 255, 204, 0.5)';
    ctx.lineWidth = isMid ? 2 : 1;
    if (isMid) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
    }
    ctx.strokeRect(ZONE_BOUNDS.CHECKPOINT_MIN_X, 0, islandWidth, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;

    // Checkpoint Energy Pulse Emitters (Top and Bottom)
    const pulseAlpha = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.fillStyle = isMid ? `rgba(56, 189, 248, ${pulseAlpha})` : `rgba(0, 255, 204, ${pulseAlpha * 0.6})`;
    ctx.fillRect(ZONE_BOUNDS.CHECKPOINT_MIN_X, 0, islandWidth, 8);
    ctx.fillRect(ZONE_BOUNDS.CHECKPOINT_MIN_X, CANVAS_HEIGHT - 8, islandWidth, 8);

    ctx.save();
    ctx.translate(ZONE_BOUNDS.CHECKPOINT_MIN_X + 24, CANVAS_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = isMid ? '#38bdf8' : '#00ffcc';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isMid ? 'CHECKPOINT // ACTIVE' : 'SAFE ISLAND // CHECKPOINT', 0, 0);
    ctx.restore();

    // ── Extraction Goal Gate (x >= 720px) ──
    const gateWidth = CANVAS_WIDTH - ZONE_BOUNDS.GOAL_ZONE_MIN_X;
    const gateGrad = ctx.createLinearGradient(ZONE_BOUNDS.GOAL_ZONE_MIN_X, 0, CANVAS_WIDTH, 0);
    gateGrad.addColorStop(0, 'rgba(0, 255, 204, 0.15)');
    gateGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
    gateGrad.addColorStop(1, 'rgba(0, 255, 204, 0.45)');
    ctx.fillStyle = gateGrad;
    ctx.fillRect(ZONE_BOUNDS.GOAL_ZONE_MIN_X, 0, gateWidth, CANVAS_HEIGHT);

    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 12;
    ctx.strokeRect(ZONE_BOUNDS.GOAL_ZONE_MIN_X, 0, gateWidth, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;

    // Rotating Extraction Signal Reticle at Center Right
    const exX = ZONE_BOUNDS.GOAL_ZONE_MIN_X + gateWidth / 2;
    const exY = CANVAS_HEIGHT / 2;
    ctx.save();
    ctx.translate(exX, exY);
    ctx.rotate(t * 1.5);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.rotate(-t * 3.0);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXTRACTION', exX, exY + 45);
    ctx.fillText('GATE', exX, exY + 58);
  }

  _drawHazards(ctx) {
    const activeHazards = this._computeActiveHazards();
    const t = this.simTime;

    for (const h of activeHazards) {
      if (h.type === 'barrier_pulse') {
        if (h.state === 'SAFE') {
          // Translucent cyan wireframe
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.25)';
          ctx.lineWidth = 1;
          ctx.strokeRect(h.x, h.y, h.width, h.height);

          // Emitter brackets
          ctx.fillStyle = '#00ffcc';
          ctx.fillRect(h.x - 2, h.y, 4, 6);
          ctx.fillRect(h.x + h.width - 2, h.y, 4, 6);
          ctx.fillRect(h.x - 2, h.y + h.height - 6, 4, 6);
          ctx.fillRect(h.x + h.width - 2, h.y + h.height - 6, 4, 6);
        } else if (h.state === 'WARNING') {
          // Animated Amber Warning Chevrons
          const warnAlpha = 0.4 + 0.4 * Math.sin(t * 16);
          ctx.fillStyle = `rgba(255, 170, 0, ${warnAlpha})`;
          ctx.fillRect(h.x, h.y, h.width, h.height);
          ctx.strokeStyle = '#ffaa00';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = 10;
          ctx.strokeRect(h.x, h.y, h.width, h.height);
          ctx.shadowBlur = 0;

          // Warning Icon / Arrow Indicator
          ctx.fillStyle = '#ffaa00';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▲', h.x + h.width / 2, h.y + h.height / 2 - 4);
          ctx.fillText('▼', h.x + h.width / 2, h.y + h.height / 2 + 10);
        } else if (h.state === 'ACTIVE') {
          // Lethal Electric Red Laser Beam
          ctx.fillStyle = 'rgba(255, 0, 85, 0.9)';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 18;
          ctx.fillRect(h.x, h.y, h.width, h.height);
          ctx.shadowBlur = 0;

          // High-Intensity White Core Line
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(h.x + h.width / 2 - 1.5, h.y, 3, h.height);
        } else if (h.state === 'COOLDOWN') {
          // Dissipating Orange Energy Arcs
          ctx.fillStyle = 'rgba(255, 119, 0, 0.35)';
          ctx.fillRect(h.x, h.y, h.width, h.height);
          ctx.strokeStyle = 'rgba(255, 119, 0, 0.6)';
          ctx.strokeRect(h.x, h.y, h.width, h.height);
        }
      } else if (h.type === 'drone_patrol') {
        // Drone Outer Glow & Core
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Drone Inner Metal Sensor Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Directional Headlight Scanner Beam
        const beamLen = 32;
        const beamEnd = h.movingDown ? h.y + beamLen : h.y - beamLen;
        const beamGrad = ctx.createLinearGradient(h.x, h.y, h.x, beamEnd);
        beamGrad.addColorStop(0, 'rgba(255, 0, 85, 0.7)');
        beamGrad.addColorStop(1, 'rgba(255, 0, 85, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(h.x - 8, h.y);
        ctx.lineTo(h.x + 8, h.y);
        ctx.lineTo(h.x + 16, beamEnd);
        ctx.lineTo(h.x - 16, beamEnd);
        ctx.closePath();
        ctx.fill();
      } else if (h.type === 'beam_vertical') {
        // Continuous Harmonically Sweeping Laser
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        ctx.fillRect(h.x, h.y, h.width, h.height);
        ctx.shadowBlur = 0;

        // Bright Center Beam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(h.x + h.width / 2 - 1.5, h.y, 3, h.height);

        // Top & Bottom Emitter Nodes
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(h.x - 3, h.y - 4, h.width + 6, 6);
        ctx.fillRect(h.x - 3, h.y + h.height - 2, h.width + 6, 6);
      } else if (h.type === 'burst_stream') {
        if (h.state === 'WARNING') {
          // Warning Indicator Track
          const warnAlpha = 0.3 + 0.3 * Math.sin(t * 12);
          ctx.strokeStyle = `rgba(255, 170, 0, ${warnAlpha})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(h.x, 0);
          ctx.lineTo(h.x, CANVAS_HEIGHT);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (h.state === 'ACTIVE') {
          // High-Energy Moving Packets
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 14;
          for (const p of h.packets) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Core Light
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0055';
          }
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  _drawPlayer(ctx) {
    ctx.save();
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const t = this.simTime;

    // Post-respawn invulnerability blink
    if (this.invulnerableTimer > 0) {
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 24);
    }

    // Motion Trail (Historical tail in movement direction)
    let vx = 0;
    let vy = 0;
    if (this.keys.left) vx += 1;
    if (this.keys.right) vx -= 1;
    if (this.keys.up) vy += 1;
    if (this.keys.down) vy -= 1;

    if (vx !== 0 || vy !== 0) {
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = `rgba(0, 255, 204, ${0.35 / i})`;
        ctx.beginPath();
        ctx.arc(px + vx * (i * 5), py + vy * (i * 5), 8 - i * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Radiant Cyan Outer Aura
    const auraRadius = 14 + 1.5 * Math.sin(t * 8);
    const auraGrad = ctx.createRadialGradient(px, py, 2, px, py, auraRadius);
    auraGrad.addColorStop(0, 'rgba(0, 255, 204, 0.8)');
    auraGrad.addColorStop(0.6, 'rgba(0, 255, 204, 0.25)');
    auraGrad.addColorStop(1, 'rgba(0, 255, 204, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(px, py, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Diamond Avatar Outer Shell
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(px, py - 11);
    ctx.lineTo(px + 11, py);
    ctx.lineTo(px, py + 11);
    ctx.lineTo(px - 11, py);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Diamond Inner Core
    ctx.fillStyle = '#0a0f1d';
    ctx.beginPath();
    ctx.moveTo(px, py - 7);
    ctx.lineTo(px + 7, py);
    ctx.lineTo(px, py + 7);
    ctx.lineTo(px - 7, py);
    ctx.closePath();
    ctx.fill();

    // Center Quantum Light Node
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  cleanup() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyDown);
      window.removeEventListener('keyup', this._boundKeyUp);
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
