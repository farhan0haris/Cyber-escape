import { gameState } from '../core/state.js';
import { audio } from '../systems/AudioManager.js';
import { getLevelMetadata } from '../core/levelMetadata.js';
import { DEV_CONFIG } from '../core/devConfig.js';
import {
  LEVEL2_VARIANTS,
  GRID_COLS,
  GRID_ROWS,
  TILE_WIDTH,
  TILE_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from './level2Data.js';
import {
  generateMazeVariant,
  generateRunSeed,
  recordRun,
  isRecentRun,
  recordTemplate,
  isRecentTemplate,
  getLastGeneratedVariant,
  setLastGeneratedVariant,
  formatSeedHex,
  normalizeSeed
} from './mazeGenerator.js';

export class Level2 {
  /**
   * @param {HTMLElement} container
   * @param {Object} callbacks - { onComplete, onLoseLife, onPenalty, onScoreBonus }
   * @param {Object} [options] - optional config (e.g. forced variant or seed)
   */
  constructor(container, callbacks = {}, options = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.options = options;

    // Determine base template and seed
    if (options.variant) {
      // Direct reuse (e.g. retry or explicit test injection)
      this.variant = options.variant;
      this.seed = this.variant.seed || generateRunSeed();
      this.seedHex = this.variant.seedHex || (typeof this.seed === 'number' ? formatSeedHex(this.seed) : String(this.seed));
    } else {
      // Pick base template
      let templateIdx = 0;
      if (typeof options.variantIndex === 'number' && LEVEL2_VARIANTS[options.variantIndex]) {
        templateIdx = options.variantIndex;
      } else if (options.variantId) {
        const foundIdx = LEVEL2_VARIANTS.findIndex(v => v.id === options.variantId);
        templateIdx = foundIdx !== -1 ? foundIdx : 0;
      } else if (options.seed) {
        // Deterministic template derived from explicit developer seed
        const seedInt = normalizeSeed(options.seed);
        templateIdx = seedInt % LEVEL2_VARIANTS.length;
      } else {
        // Avoid immediate template repetition
        const availableTemplates = LEVEL2_VARIANTS.filter(v => !isRecentTemplate(v.id));
        const pool = availableTemplates.length > 0 ? availableTemplates : LEVEL2_VARIANTS;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        templateIdx = LEVEL2_VARIANTS.findIndex(v => v.id === chosen.id);
        if (templateIdx === -1) templateIdx = 0;
      }
      const baseTemplate = LEVEL2_VARIANTS[templateIdx];
      recordTemplate(baseTemplate.id);

      // Handle seed
      const prevVariant = getLastGeneratedVariant();
      let chosenSeed = options.seed;

      if (!chosenSeed) {
        // Generate run seed avoiding immediate repetition
        for (let i = 0; i < 5; i++) {
          const candidateSeed = generateRunSeed();
          if (!isRecentRun(baseTemplate.id, candidateSeed)) {
            chosenSeed = candidateSeed;
            break;
          }
        }
        if (!chosenSeed) chosenSeed = generateRunSeed();
      }

      this.seed = chosenSeed;
      this.seedHex = typeof chosenSeed === 'number' ? formatSeedHex(chosenSeed) : String(chosenSeed).toUpperCase();

      // Generate the deterministic procedural variant.
      // If an explicit seed is provided (e.g. developer seed override), do not reject matches against prevVariant.
      const diffCheckVariant = options.seed ? null : prevVariant;
      this.variant = generateMazeVariant(baseTemplate, this.seed, diffCheckVariant);
      this.seed = this.variant.seed;
      this.seedHex = this.variant.seedHex;
      recordRun(baseTemplate.id, this.seedHex);
      setLastGeneratedVariant(this.variant);
    }

    this.grid = this.variant.grid;

    // Player Avatar Definition
    const pWidth = 22;
    const pHeight = 22;
    const spawnTileX = this.variant.spawn.x;
    const spawnTileY = this.variant.spawn.y;
    this.player = {
      x: spawnTileX * TILE_WIDTH + (TILE_WIDTH - pWidth) / 2,
      y: spawnTileY * TILE_HEIGHT + (TILE_HEIGHT - pHeight) / 2,
      width: pWidth,
      height: pHeight,
      speed: 180, // px per second
      facingAngle: 0, // direction in radians
      trail: []
    };

    // Extraction Gateway Definition
    const exitTileX = this.variant.exit.x;
    const exitTileY = this.variant.exit.y;
    const eWidth = 26;
    const eHeight = 26;
    this.exit = {
      x: exitTileX * TILE_WIDTH + (TILE_WIDTH - eWidth) / 2,
      y: exitTileY * TILE_HEIGHT + (TILE_HEIGHT - eHeight) / 2,
      width: eWidth,
      height: eHeight,
      tileX: exitTileX,
      tileY: exitTileY,
      pulseTime: 0,
      rotation: 0
    };

    // Environmental state
    this.isNearExit = false;
    this.scanLineY = 0;
    this.ambientPackets = [
      { x: 60, y: 45, vx: 35, vy: 0, life: 0 },
      { x: 420, y: 225, vx: 0, vy: 30, life: 0 }
    ];

    // Initialize Hazards from variant
    this.hazards = this.initializeHazards(this.variant.hazards || []);

    // Input States
    this.keys = { up: false, down: false, left: false, right: false };
    this.dpad = { up: false, down: false, left: false, right: false };

    // Lifecycle Flags
    this.isPaused = false;
    this.isLocked = false;
    this.isCompleted = false;
    this.isFailing = false;
    this.rafId = null;
    this.lastFrameTime = null;
    this._cleanups = [];

    // Canvas references
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Deep clone and set up initial state for hazards
   */
  initializeHazards(hazardDefs) {
    return hazardDefs.map((def) => {
      const h = { ...def };
      if (h.type === 'SCAN_PACKET') {
        h.currentX = h.startX * TILE_WIDTH + TILE_WIDTH / 2;
        h.currentY = h.startY * TILE_HEIGHT + TILE_HEIGHT / 2;
        h.targetStartX = h.startX * TILE_WIDTH + TILE_WIDTH / 2;
        h.targetStartY = h.startY * TILE_HEIGHT + TILE_HEIGHT / 2;
        h.targetEndX = h.endX * TILE_WIDTH + TILE_WIDTH / 2;
        h.targetEndY = h.endY * TILE_HEIGHT + TILE_HEIGHT / 2;
        h.progress = 0;
        h.forward = true;
        h.trail = [];
      } else if (h.type === 'PULSE_BARRIER') {
        h.timer = 0;
        h.state = 'SAFE'; // 'SAFE' | 'WARN' | 'ACTIVE'
      } else if (h.type === 'CORRUPTED_NODE') {
        h.pixelX = h.x * TILE_WIDTH + TILE_WIDTH / 2;
        h.pixelY = h.y * TILE_HEIGHT + TILE_HEIGHT / 2;
        h.pulseAngle = Math.random() * Math.PI * 2;
      }
      return h;
    });
  }

  /**
   * Mount Level 2 UI and canvas
   */
  init() {
    if (typeof document === 'undefined') return;

    if (!this.container) {
      console.warn('[Level2] Container is not defined');
      return;
    }

    this.container.innerHTML = `
      <div class="level2-root" id="l2-root">
        <!-- Telemetry Header -->
        <div class="l2-telemetry-bar">
          <div class="l2-telemetry-item">
            <span class="l2-telemetry-label">SECTOR:</span>
            <span class="l2-telemetry-val text-cyan">${this.variant.sector}</span>
          </div>
          <div class="l2-telemetry-item">
            <span class="l2-telemetry-label">TOPOLOGY:</span>
            <span class="l2-telemetry-val text-emerald">${this.variant.name}</span>
          </div>
          <div class="l2-telemetry-item">
            <span class="l2-telemetry-label">CORE ROUTE:</span>
            <span class="l2-telemetry-val text-amber">${this.variant.mechanic}</span>
          </div>
          <div class="l2-telemetry-item">
            <span class="l2-telemetry-label">STATUS:</span>
            <span class="l2-telemetry-val text-cyan" id="l2-nav-status">ROUTING ACTIVE</span>
          </div>
          ${DEV_CONFIG.DEV_MODE ? `
          <div class="l2-telemetry-item l2-dev-telemetry font-mono" style="border-left: 1px solid rgba(255,170,0,0.4); padding-left: 8px;">
            <span class="l2-telemetry-label text-amber">DEV VARIANT:</span>
            <span class="l2-telemetry-val text-amber" style="font-weight: 700;">${this.variant.name}</span>
            <span class="l2-telemetry-label text-amber" style="margin-left: 6px;">SEED:</span>
            <span class="l2-telemetry-val text-emerald" style="font-weight: 700;">${this.seedHex}</span>
          </div>` : ''}
        </div>

        <!-- Canvas Container -->
        <div class="l2-canvas-container" id="l2-canvas-container">
          <canvas id="l2-canvas" class="l2-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
          <div id="l2-hazard-flash-layer"></div>
        </div>

        <!-- Mobile Virtual Pointer D-Pad -->
        <div class="l2-dpad-container" id="l2-dpad" aria-label="Mobile Navigation Controls">
          <div class="l2-dpad-grid">
            <div></div>
            <button type="button" class="l2-dpad-btn" data-dir="up" aria-label="Move Up">▲</button>
            <div></div>
            <button type="button" class="l2-dpad-btn" data-dir="left" aria-label="Move Left">◀</button>
            <div class="l2-dpad-btn center-hub font-mono" aria-hidden="true">●</div>
            <button type="button" class="l2-dpad-btn" data-dir="right" aria-label="Move Right">▶</button>
            <div></div>
            <button type="button" class="l2-dpad-btn" data-dir="down" aria-label="Move Down">▼</button>
            <div></div>
          </div>
          <div class="l2-dpad-label">TOUCH D-PAD // HOLD TO MOVE</div>
        </div>

        <!-- Sector Intro Overlay -->
        <div class="l2-intro-overlay" id="l2-intro-overlay">
          <div class="l2-intro-box">
            <div class="l2-intro-sequence font-mono">
              <div class="l2-seq-line text-muted">FIREWALL GATE // BREACH CONFIRMED</div>
              <div class="l2-seq-line text-cyan">ROUTING CORE DETECTED</div>
              <div class="l2-seq-line text-emerald">MOUNTING DIGITAL LABYRINTH...</div>
            </div>
            <h3 class="l2-intro-title">${this.variant.name}</h3>
            <p class="l2-intro-desc">${this.variant.description}</p>
            <div class="l2-intro-status">
              <span class="status-dot"></span>
              <span>OBJECTIVE: REACH EXTRACTION NODE // AVOID CORRUPTED CHANNELS</span>
            </div>
            <button type="button" class="l2-intro-btn" id="l2-intro-btn">INITIALIZE ROUTE [ENTER]</button>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('l2-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.bindEvents();
    this.render(); // Initial draw
  }

  /**
   * Bind Keyboard and Pointer D-Pad Events
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    // Intro dismiss
    const introOverlay = document.getElementById('l2-intro-overlay');
    const introBtn = document.getElementById('l2-intro-btn');
    const dismissIntro = () => {
      if (introOverlay) {
        introOverlay.style.display = 'none';
      }
      this.isLocked = false;
      this.lastFrameTime = performance.now();
    };

    if (introBtn) {
      introBtn.addEventListener('click', dismissIntro);
      this._cleanups.push(() => introBtn.removeEventListener('click', dismissIntro));
    }

    // Auto-dismiss intro after 1.4s if not clicked
    const introTimeout = setTimeout(dismissIntro, 1400);
    this._cleanups.push(() => clearTimeout(introTimeout));

    // Keyboard handlers
    const keydownHandler = (e) => {
      // Allow dismiss intro on Enter or Space
      if (introOverlay && introOverlay.style.display !== 'none') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dismissIntro();
          return;
        }
      }

      // Ignore input if user is typing in an input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      let handled = false;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.keys.up = true;
          handled = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          handled = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.keys.left = true;
          handled = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          handled = true;
          break;
        default:
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    };

    const keyupHandler = (e) => {
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
    };

    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);
    this._cleanups.push(() => window.removeEventListener('keydown', keydownHandler));
    this._cleanups.push(() => window.removeEventListener('keyup', keyupHandler));

    // Window blur: clear keys so player doesn't walk indefinitely
    const blurHandler = () => {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
      this.dpad.up = false;
      this.dpad.down = false;
      this.dpad.left = false;
      this.dpad.right = false;
    };
    window.addEventListener('blur', blurHandler);
    this._cleanups.push(() => window.removeEventListener('blur', blurHandler));

    // Pointer Virtual D-Pad handlers
    const dpadEl = document.getElementById('l2-dpad');
    if (dpadEl) {
      const dpadButtons = dpadEl.querySelectorAll('.l2-dpad-btn[data-dir]');

      dpadButtons.forEach((btn) => {
        const dir = btn.dataset.dir;

        const onPointerDown = (e) => {
          e.preventDefault();
          this.dpad[dir] = true;
          btn.classList.add('active');
          if (btn.setPointerCapture) {
            try {
              btn.setPointerCapture(e.pointerId);
            } catch (err) {
              // Ignore capture error if unsupported
            }
          }
        };

        const onPointerUp = (e) => {
          e.preventDefault();
          this.dpad[dir] = false;
          btn.classList.remove('active');
          if (btn.releasePointerCapture) {
            try {
              btn.releasePointerCapture(e.pointerId);
            } catch (err) {
              // Ignore
            }
          }
        };

        const onPointerCancel = (e) => {
          this.dpad[dir] = false;
          btn.classList.remove('active');
        };

        btn.addEventListener('pointerdown', onPointerDown);
        btn.addEventListener('pointerup', onPointerUp);
        btn.addEventListener('pointercancel', onPointerCancel);
        btn.addEventListener('pointerleave', onPointerCancel);

        this._cleanups.push(() => {
          btn.removeEventListener('pointerdown', onPointerDown);
          btn.removeEventListener('pointerup', onPointerUp);
          btn.removeEventListener('pointercancel', onPointerCancel);
          btn.removeEventListener('pointerleave', onPointerCancel);
        });
      });
    }
  }

  /**
   * Start the level loop
   */
  start() {
    this.isPaused = false;
    this.isFailing = false;
    this.lastFrameTime = performance.now();

    if (typeof requestAnimationFrame !== 'undefined') {
      const loop = (timestamp) => {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.05); // cap at 50ms to avoid tunneling
        this.lastFrameTime = timestamp;

        if (!this.isPaused && !this.isCompleted && !this.isFailing) {
          this.update(dt);
          this.render();
        }

        if (!this.isCompleted && !this.isFailing) {
          this.rafId = requestAnimationFrame(loop);
        }
      };

      this.rafId = requestAnimationFrame(loop);
    }
  }

  /**
   * Pause gameplay: halts loop, preserves coordinates and timers
   */
  pause() {
    this.isPaused = true;
    if (this.rafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // Clear key presses so player doesn't move while paused
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.dpad.up = false;
    this.dpad.down = false;
    this.dpad.left = false;
    this.dpad.right = false;
  }

  /**
   * Resume gameplay: restarts loop without resetting state
   */
  resume() {
    if (this.isCompleted || this.isFailing) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.start();
  }

  /**
   * Update Physics, Hazards, and Collisions
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    if (this.isLocked || this.isPaused || this.isCompleted || this.isFailing) return;

    // 1. Calculate Input Direction
    let dirX = (this.keys.right || this.dpad.right ? 1 : 0) - (this.keys.left || this.dpad.left ? 1 : 0);
    let dirY = (this.keys.down || this.dpad.down ? 1 : 0) - (this.keys.up || this.dpad.up ? 1 : 0);

    // Track player orientation angle when moving
    if (dirX !== 0 || dirY !== 0) {
      this.player.facingAngle = Math.atan2(dirY, dirX);
    }

    // Normalize diagonal movement speed
    if (dirX !== 0 && dirY !== 0) {
      dirX *= 0.70710678;
      dirY *= 0.70710678;
    }

    const vx = dirX * this.player.speed * dt;
    const vy = dirY * this.player.speed * dt;

    // 2. Independent Axis AABB Movement with Wall Sliding
    // --- X Axis ---
    if (vx !== 0) {
      let nextX = this.player.x + vx;
      nextX = Math.max(0, Math.min(CANVAS_WIDTH - this.player.width, nextX));

      const minCol = Math.floor(nextX / TILE_WIDTH);
      const maxCol = Math.floor((nextX + this.player.width - 0.01) / TILE_WIDTH);
      const minRow = Math.floor(this.player.y / TILE_HEIGHT);
      const maxRow = Math.floor((this.player.y + this.player.height - 0.01) / TILE_HEIGHT);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (this.grid[r] && this.grid[r][c] === 1) {
            if (vx > 0) {
              nextX = c * TILE_WIDTH - this.player.width;
            } else if (vx < 0) {
              nextX = (c + 1) * TILE_WIDTH;
            }
          }
        }
      }
      this.player.x = nextX;
    }

    // --- Y Axis ---
    if (vy !== 0) {
      let nextY = this.player.y + vy;
      nextY = Math.max(0, Math.min(CANVAS_HEIGHT - this.player.height, nextY));

      const minCol = Math.floor(this.player.x / TILE_WIDTH);
      const maxCol = Math.floor((this.player.x + this.player.width - 0.01) / TILE_WIDTH);
      const minRow = Math.floor(nextY / TILE_HEIGHT);
      const maxRow = Math.floor((nextY + this.player.height - 0.01) / TILE_HEIGHT);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (this.grid[r] && this.grid[r][c] === 1) {
            if (vy > 0) {
              nextY = r * TILE_HEIGHT - this.player.height;
            } else if (vy < 0) {
              nextY = (r + 1) * TILE_HEIGHT;
            }
          }
        }
      }
      this.player.y = nextY;
    }

    // Update player trailing coordinates
    if (vx !== 0 || vy !== 0) {
      this.player.trail.unshift({ x: this.player.x, y: this.player.y, angle: this.player.facingAngle });
      if (this.player.trail.length > 7) {
        this.player.trail.pop();
      }
    } else if (this.player.trail.length > 0) {
      this.player.trail.pop();
    }

    // Check proximity to extraction core
    const distToExit = Math.hypot(
      this.player.x + this.player.width / 2 - (this.exit.x + this.exit.width / 2),
      this.player.y + this.player.height / 2 - (this.exit.y + this.exit.height / 2)
    );
    const wasNear = this.isNearExit;
    this.isNearExit = distToExit < 130;

    if (this.isNearExit !== wasNear && typeof document !== 'undefined') {
      const navStatus = document.getElementById('l2-nav-status');
      if (navStatus && !this.isFailing && !this.isCompleted) {
        if (this.isNearExit) {
          navStatus.className = 'l2-telemetry-val text-emerald';
          navStatus.textContent = 'EXTRACTION SIGNAL ACQUIRED // PROCEED TO GATEWAY';
        } else {
          navStatus.className = 'l2-telemetry-val text-cyan';
          navStatus.textContent = 'ROUTING ACTIVE';
        }
      }
    }

    // Update environmental scanline
    this.scanLineY = (this.scanLineY + 55 * dt) % CANVAS_HEIGHT;

    // Update ambient decorative packet streams
    for (const ap of this.ambientPackets) {
      ap.x += ap.vx * dt;
      ap.y += ap.vy * dt;
      ap.life += dt;

      // Wrap or bounce inside bounds
      if (ap.x < 40) ap.x = CANVAS_WIDTH - 60;
      if (ap.x > CANVAS_WIDTH - 60) ap.x = 40;
      if (ap.y < 30) ap.y = CANVAS_HEIGHT - 45;
      if (ap.y > CANVAS_HEIGHT - 45) ap.y = 30;
    }

    // 3. Update Hazards
    this.updateHazards(dt);

    // 4. Test Exit Node Collision
    this.checkExitCollision();

    // 5. Test Hazard Collisions
    this.checkHazardCollisions();
  }

  /**
   * Deterministic Hazard Updates
   */
  updateHazards(dt) {
    this.exit.pulseTime += dt;
    this.exit.rotation += dt * (this.isNearExit ? 3.0 : 1.5);

    for (const h of this.hazards) {
      if (h.type === 'SCAN_PACKET') {
        const dx = h.targetEndX - h.targetStartX;
        const dy = h.targetEndY - h.targetStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speedRatio = dist > 0 ? (h.speed / dist) * dt : 0;

        if (h.forward) {
          h.progress += speedRatio;
          if (h.progress >= 1) {
            h.progress = 1;
            h.forward = false;
          }
        } else {
          h.progress -= speedRatio;
          if (h.progress <= 0) {
            h.progress = 0;
            h.forward = true;
          }
        }

        h.currentX = h.targetStartX + dx * h.progress;
        h.currentY = h.targetStartY + dy * h.progress;

        // Maintain scanner wake particles
        if (!h.trail) h.trail = [];
        h.trail.unshift({ x: h.currentX, y: h.currentY });
        if (h.trail.length > 5) h.trail.pop();
      } else if (h.type === 'PULSE_BARRIER') {
        h.timer += dt;
        const totalCycle = h.cycleSafe + h.cycleWarn + h.cycleActive;
        const cur = h.timer % totalCycle;

        if (cur < h.cycleSafe) {
          h.state = 'SAFE';
        } else if (cur < h.cycleSafe + h.cycleWarn) {
          h.state = 'WARN';
        } else {
          h.state = 'ACTIVE';
        }
      } else if (h.type === 'CORRUPTED_NODE') {
        h.pulseAngle = (h.pulseAngle || 0) + dt * 2.5;
      }
    }
  }

  /**
   * Check Exit Node Trigger
   */
  checkExitCollision() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    const ex = this.exit.x;
    const ey = this.exit.y;
    const ew = this.exit.width;
    const eh = this.exit.height;

    // AABB intersection
    if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
      this.handleExitReached();
    }
  }

  /**
   * Check Hazard Collisions
   */
  checkHazardCollisions() {
    if (this.isFailing || this.isCompleted) return;

    const pCenterX = this.player.x + this.player.width / 2;
    const pCenterY = this.player.y + this.player.height / 2;
    const playerRadius = 11;

    for (const h of this.hazards) {
      if (h.type === 'CORRUPTED_NODE') {
        const dx = pCenterX - h.pixelX;
        const dy = pCenterY - h.pixelY;
        const distSq = dx * dx + dy * dy;
        const hitDist = (playerRadius + h.radius) * 0.85; // slightly forgiving hit box
        if (distSq <= hitDist * hitDist) {
          this.handleHazardHit(h);
          return;
        }
      } else if (h.type === 'SCAN_PACKET') {
        const dx = pCenterX - h.currentX;
        const dy = pCenterY - h.currentY;
        const distSq = dx * dx + dy * dy;
        const hitDist = (playerRadius + h.radius) * 0.85;
        if (distSq <= hitDist * hitDist) {
          this.handleHazardHit(h);
          return;
        }
      } else if (h.type === 'PULSE_BARRIER') {
        if (h.state === 'ACTIVE') {
          const barrierX = h.tileX * TILE_WIDTH;
          const barrierY = h.tileY * TILE_HEIGHT;
          const px = this.player.x;
          const py = this.player.y;
          const pw = this.player.width;
          const ph = this.player.height;

          // AABB overlap check with 2px margin
          if (
            px < barrierX + TILE_WIDTH - 2 &&
            px + pw > barrierX + 2 &&
            py < barrierY + TILE_HEIGHT - 2 &&
            py + ph > barrierY + 2
          ) {
            this.handleHazardHit(h);
            return;
          }
        }
      }
    }
  }

  /**
   * Handle Hazard Collision
   * Canonical single-failure pathway via GameManager
   */
  handleHazardHit(hazard) {
    if (this.isFailing || this.isCompleted) return;
    this.isFailing = true;

    // Trigger visual screen glitch / red flash
    if (typeof document !== 'undefined') {
      const flashLayer = document.getElementById('l2-hazard-flash-layer');
      if (flashLayer) {
        flashLayer.className = 'l2-hazard-flash';
      }
      const navStatus = document.getElementById('l2-nav-status');
      if (navStatus) {
        navStatus.className = 'l2-telemetry-val text-red';
        navStatus.textContent = 'HAZARD IMPACT // INTEGRITY FAILURE';
      }
    }

    audio.playError();

    // Call canonical failure callback
    if (typeof this.callbacks.onLoseLife === 'function') {
      this.callbacks.onLoseLife();
    }
  }

  /**
   * Handle Exit Reached
   * Canonical single score calculation & completion trigger
   */
  handleExitReached() {
    if (this.isCompleted || this.isFailing) return;
    this.isCompleted = true;
    this.isLocked = true;

    audio.playSuccess();

    // Calculate score
    const meta = getLevelMetadata(2);
    const timeRemaining = gameState.state.levelTimeRemaining || 0;
    const timeBonus = Math.max(0, Math.round(timeRemaining * (meta.timeBonusMultiplier || 15)));
    const levelScore = Math.max(0, meta.baseScore + timeBonus);

    // Update status in header
    if (typeof document !== 'undefined') {
      const navStatus = document.getElementById('l2-nav-status');
      if (navStatus) {
        navStatus.className = 'l2-telemetry-val text-emerald';
        navStatus.textContent = 'ROUTE VERIFIED // EXTRACTION INITIATED';
      }

      // Show Victory Overlay
      const container = document.getElementById('l2-canvas-container');
      if (container) {
        const overlay = document.createElement('div');
        overlay.className = 'l2-success-overlay';
        overlay.innerHTML = `
          <div class="l2-success-box">
            <h3 class="l2-success-title">SECTOR 02 // EXTRACTION CONFIRMED</h3>
            <p class="l2-success-desc">Digital maze traversed successfully. Route integrity secured for Sector 03 transition.</p>
            <div class="l2-score-breakdown">
              <div class="l2-score-col">
                <span class="l2-score-label">BASE SCORE</span>
                <span class="l2-score-val text-cyan">${meta.baseScore} PTS</span>
              </div>
              <div class="l2-score-col">
                <span class="l2-score-label">TIME BONUS (${timeRemaining}s)</span>
                <span class="l2-score-val text-amber">+${timeBonus} PTS</span>
              </div>
              <div class="l2-score-col">
                <span class="l2-score-label">LEVEL TOTAL</span>
                <span class="l2-score-val text-emerald">${levelScore} PTS</span>
              </div>
            </div>
            <button type="button" class="l2-intro-btn" id="l2-advance-btn">PROCEED TO SECTOR 03 [NEXT]</button>
          </div>
        `;
        container.appendChild(overlay);

        const advanceBtn = overlay.querySelector('#l2-advance-btn');
        const advanceNext = () => {
          if (typeof this.callbacks.onComplete === 'function') {
            this.callbacks.onComplete(levelScore);
          }
        };

        if (advanceBtn) {
          advanceBtn.addEventListener('click', advanceNext);
        }

        // Auto-advance after 1.8s if not manually clicked
        setTimeout(advanceNext, 1800);
      }
    } else {
      // In headless test mode
      if (typeof this.callbacks.onComplete === 'function') {
        this.callbacks.onComplete(levelScore);
      }
    }
  }

  /**
   * Render Canvas Frame with Multi-Layer Environmental Depth
   */
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Deep Midnight Base Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Layer 1: Digital Infrastructure & Route States
    this.renderFloorInfrastructure(ctx);

    // 3. Layer 2: Maze Architecture (Walls with Depth & Circuits)
    this.renderWalls(ctx);

    // 4. Layer 3: Environmental Activity (Ambient Packets & Scanline)
    this.renderEnvironmentalActivity(ctx);

    // 5. Extraction Gateway (Exit Node)
    this.renderExtractionGateway(ctx);

    // 6. Hazards (Scan Packets, Pulse Barriers, Corrupted Nodes)
    this.renderHazards(ctx);

    // 7. Player Avatar
    this.renderPlayer(ctx);
  }

  /**
   * Layer 1: Digital Infrastructure & Route States
   * Visually distinguishes normal routes, corrupted corridors, scan paths, and extraction approaches
   */
  renderFloorInfrastructure(ctx) {
    // Subtle background grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE_WIDTH, 0);
      ctx.lineTo(c * TILE_WIDTH, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE_HEIGHT);
      ctx.lineTo(CANVAS_WIDTH, r * TILE_HEIGHT);
      ctx.stroke();
    }

    // Identify special route tiles for contextual visual cues
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 0) {
          const cx = c * TILE_WIDTH + TILE_WIDTH / 2;
          const cy = r * TILE_HEIGHT + TILE_HEIGHT / 2;

          // Check proximity to corrupted nodes (Corrupted Route)
          let nearCorrupted = false;
          for (const h of this.hazards) {
            if (h.type === 'CORRUPTED_NODE' && Math.hypot(c - h.x, r - h.y) <= 2.2) {
              nearCorrupted = true;
              break;
            }
          }

          // Check proximity to exit (Extraction Route)
          const distExit = Math.hypot(c - this.exit.tileX, r - this.exit.tileY);
          const nearExit = distExit <= 3.2;

          if (nearCorrupted) {
            // Faint corrupted chromatic route
            ctx.fillStyle = 'rgba(255, 0, 60, 0.08)';
            ctx.fillRect(c * TILE_WIDTH + 1, r * TILE_HEIGHT + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);
            ctx.fillStyle = 'rgba(255, 0, 60, 0.28)';
            ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
          } else if (nearExit) {
            // Pulsing emerald extraction resonance
            const pulse = (Math.sin(this.exit.pulseTime * 4 - distExit * 0.8) + 1) / 2;
            ctx.fillStyle = `rgba(0, 229, 153, ${0.04 + pulse * 0.08})`;
            ctx.fillRect(c * TILE_WIDTH + 1, r * TILE_HEIGHT + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);
            ctx.fillStyle = `rgba(0, 229, 153, ${0.2 + pulse * 0.3})`;
            ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
          } else {
            // Normal route intersection pip
            ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
          }
        }
      }
    }
  }

  /**
   * Layer 2: Maze Architecture
   * Walls with primary structural edge, beveled highlights, shadow depth, and circuit nodes
   */
  renderWalls(ctx) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === 1) {
          const x = c * TILE_WIDTH;
          const y = r * TILE_HEIGHT;

          // 1. Solid wall body fill with subtle depth gradient
          ctx.fillStyle = '#081220';
          ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

          // 2. Top and Left beveled highlights (gives genuine mechanical depth)
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + TILE_WIDTH, y + 0.5);
          ctx.lineTo(x + 0.5, y + 0.5);
          ctx.lineTo(x + 0.5, y + TILE_HEIGHT);
          ctx.stroke();

          // 3. Bottom and Right cast shadow lines
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.beginPath();
          ctx.moveTo(x + TILE_WIDTH - 0.5, y);
          ctx.lineTo(x + TILE_WIDTH - 0.5, y + TILE_HEIGHT - 0.5);
          ctx.lineTo(x, y + TILE_HEIGHT - 0.5);
          ctx.stroke();

          // 4. Circuit detail pins for walls bordering open corridors
          const hasAdjacentEmpty =
            (r > 0 && this.grid[r - 1][c] === 0) ||
            (r < GRID_ROWS - 1 && this.grid[r + 1][c] === 0) ||
            (c > 0 && this.grid[r][c - 1] === 0) ||
            (c < GRID_COLS - 1 && this.grid[r][c + 1] === 0);

          if (hasAdjacentEmpty) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
            ctx.fillRect(x + TILE_WIDTH / 2 - 1.5, y + TILE_HEIGHT / 2 - 1.5, 3, 3);
          }
        }
      }
    }
  }

  /**
   * Layer 3: Environmental Activity
   * Cosmetic scanline and drifting ambient data packets
   */
  renderEnvironmentalActivity(ctx) {
    // Subtle CRT / routing sweep line
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, this.scanLineY);
    ctx.lineTo(CANVAS_WIDTH, this.scanLineY);
    ctx.stroke();
    ctx.restore();

    // Ambient cosmetic packet streams (non-colliding)
    for (const ap of this.ambientPackets) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.28)';
      ctx.fillRect(ap.x - 2, ap.y - 2, 4, 4);
      ctx.restore();
    }
  }

  /**
   * Extraction Gateway (Exit Node)
   * Redesigned with concentric rotating radar rings, pulsing emerald core, and signal telemetry
   */
  renderExtractionGateway(ctx) {
    const pulse = (Math.sin(this.exit.pulseTime * (this.isNearExit ? 7 : 4)) + 1) / 2;
    const ex = this.exit.x;
    const ey = this.exit.y;
    const ew = this.exit.width;
    const eh = this.exit.height;
    const centerX = ex + ew / 2;
    const centerY = ey + eh / 2;

    ctx.save();

    // 1. Outer radar scanning ring
    ctx.strokeStyle = `rgba(0, 229, 153, ${0.3 + pulse * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Rotating bracket reticles
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.exit.rotation);
    ctx.strokeStyle = '#00e599';
    ctx.lineWidth = 1.5;

    // Draw 4 corner notches
    const notchR = 14;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, notchR, 0, Math.PI / 4);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Central Core Glowing Diamond
    ctx.shadowColor = 'rgba(0, 229, 153, 0.9)';
    ctx.shadowBlur = 10 + pulse * 10;
    ctx.fillStyle = `rgba(0, 229, 153, ${0.5 + pulse * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 8);
    ctx.lineTo(centerX + 8, centerY);
    ctx.lineTo(centerX, centerY + 8);
    ctx.lineTo(centerX - 8, centerY);
    ctx.closePath();
    ctx.fill();

    // 4. White-hot center extraction beacon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Hazards with Enhanced Behavior Communication
   */
  renderHazards(ctx) {
    for (const h of this.hazards) {
      if (h.type === 'CORRUPTED_NODE') {
        const pulse = (Math.sin(performance.now() * 0.006 + (h.pulseAngle || 0)) + 1) / 2;
        ctx.save();
        ctx.shadowColor = '#ff003c';
        ctx.shadowBlur = 12 + pulse * 8;

        // Unstable outer distortion ring
        ctx.strokeStyle = `rgba(255, 0, 60, ${0.2 + pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(h.pixelX, h.pixelY, h.radius + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsating crimson aura
        ctx.fillStyle = `rgba(255, 0, 60, ${0.22 + pulse * 0.28})`;
        ctx.beginPath();
        ctx.arc(h.pixelX, h.pixelY, h.radius + pulse * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner jagged diamond core
        ctx.fillStyle = '#ff003c';
        ctx.beginPath();
        ctx.moveTo(h.pixelX, h.pixelY - h.radius * 0.85);
        ctx.lineTo(h.pixelX + h.radius * 0.85, h.pixelY);
        ctx.lineTo(h.pixelX, h.pixelY + h.radius * 0.85);
        ctx.lineTo(h.pixelX - h.radius * 0.85, h.pixelY);
        ctx.closePath();
        ctx.fill();

        // Warning core glyph (!)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(h.pixelX - 1, h.pixelY - 4, 2, 5);
        ctx.fillRect(h.pixelX - 1, h.pixelY + 3, 2, 2);

        ctx.restore();
      } else if (h.type === 'SCAN_PACKET') {
        ctx.save();

        // 1. Dotted Patrol Track (communicates predictable trajectory)
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(h.targetStartX, h.targetStartY);
        ctx.lineTo(h.targetEndX, h.targetEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Fading motion wake particles
        if (h.trail) {
          for (let i = 0; i < h.trail.length; i++) {
            const tr = h.trail[i];
            const a = (1 - (i + 1) / (h.trail.length + 1)) * 0.3;
            ctx.fillStyle = `rgba(255, 170, 0, ${a})`;
            ctx.fillRect(tr.x - 3, tr.y - 3, 6, 6);
          }
        }

        // 3. Moving Diamond Core
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(h.currentX, h.currentY - h.radius);
        ctx.lineTo(h.currentX + h.radius, h.currentY);
        ctx.lineTo(h.currentX, h.currentY + h.radius);
        ctx.lineTo(h.currentX - h.radius, h.currentY);
        ctx.closePath();
        ctx.fill();

        // 4. White core sensor
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(h.currentX, h.currentY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (h.type === 'PULSE_BARRIER') {
        const bx = h.tileX * TILE_WIDTH;
        const by = h.tileY * TILE_HEIGHT;

        ctx.save();
        if (h.state === 'SAFE') {
          // SAFE: low visibility blue idle state
          ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
          ctx.fillRect(bx, by, TILE_WIDTH, TILE_HEIGHT);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 1, by + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);

          ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
          ctx.fillRect(bx + TILE_WIDTH / 2 - 2, by + TILE_HEIGHT / 2 - 2, 4, 4);
        } else if (h.state === 'WARN') {
          // CHARGING: amber flashing warning fence with diagonal stripes
          const flash = Math.floor(performance.now() / 120) % 2 === 0;
          ctx.fillStyle = flash ? 'rgba(255, 170, 0, 0.35)' : 'rgba(255, 170, 0, 0.15)';
          ctx.fillRect(bx, by, TILE_WIDTH, TILE_HEIGHT);
          ctx.strokeStyle = '#ffaa00';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);

          // Diagonal warning stripe
          ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + 8, by + 4);
          ctx.lineTo(bx + TILE_WIDTH - 8, by + TILE_HEIGHT - 4);
          ctx.stroke();
        } else if (h.state === 'ACTIVE') {
          // ACTIVE: bright crimson lethal laser wall
          ctx.shadowColor = '#ff003c';
          ctx.shadowBlur = 16;
          ctx.fillStyle = 'rgba(255, 0, 60, 0.7)';
          ctx.fillRect(bx, by, TILE_WIDTH, TILE_HEIGHT);

          // Intense horizontal plasma beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(bx, by + TILE_HEIGHT / 2);
          ctx.lineTo(bx + TILE_WIDTH, by + TILE_HEIGHT / 2);
          ctx.stroke();

          // Border containment brackets
          ctx.strokeStyle = '#ff003c';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);
        }
        ctx.restore();
      }
    }
  }

  /**
   * Draw Player Avatar with Directional Nose, Micro-Chamfer, and Motion Echoes
   */
  renderPlayer(ctx) {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;
    const centerX = px + pw / 2;
    const centerY = py + ph / 2;

    // 1. Motion trail clones fading behind movement
    for (let i = 0; i < this.player.trail.length; i++) {
      const t = this.player.trail[i];
      const alpha = (1 - (i + 1) / (this.player.trail.length + 1)) * 0.35;
      ctx.save();
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.fillRect(t.x + 2, t.y + 2, pw - 4, ph - 4);
      ctx.restore();
    }

    // 2. Main Player Avatar Core
    ctx.save();
    const idlePulse = Math.sin(performance.now() * 0.006) * 3 + 12;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = idlePulse;

    // Electric Cyan housing
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px, py, pw, ph);

    // Beveled dark cyber edge
    ctx.strokeStyle = '#05101e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    // Microprocessor white core chip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6);

    // Directional orientation pip/indicator
    const noseDist = 7;
    const noseX = centerX + Math.cos(this.player.facingAngle) * noseDist;
    const noseY = centerY + Math.sin(this.player.facingAngle) * noseDist;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(noseX, noseY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Complete level cleanup
   */
  cleanup() {
    this.isPaused = true;
    this.isCompleted = true;

    if (this.rafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Execute all registered cleanups
    while (this._cleanups.length > 0) {
      const fn = this._cleanups.pop();
      try {
        fn();
      } catch (err) {
        console.warn('[Level2] Cleanup error:', err);
      }
    }

    // Clear input state
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.dpad.up = false;
    this.dpad.down = false;
    this.dpad.left = false;
    this.dpad.right = false;

    if (this.container && typeof document !== 'undefined') {
      this.container.innerHTML = '';
    }
  }
}
