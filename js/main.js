/**
 * Main Application Bootstrap
 * Connects DOM event handlers, managers, and initiates the game lifecycle
 */

import { GameManager } from './core/GameManager.js';
import { ui } from './ui/UIManager.js';
import { input } from './systems/InputManager.js';
import { audio } from './systems/AudioManager.js';
import { storage } from './systems/StorageManager.js';
import { DEV_CONFIG } from './core/devConfig.js';

class App {
  constructor() {
    this.gameManager = null;
  }

  init() {
    // 1. Initialize input bindings
    input.initialize();

    // 2. Initialize Game Manager instance
    this.gameManager = new GameManager();

    // 3. Bind UI button and modal actions
    this._bindEvents();

    // 4. Load persisted player name if available
    const savedName = storage.get('player', '');
    if (savedName && ui.elements.playerNameInput) {
      ui.elements.playerNameInput.value = savedName;
    }

    // 5. Check persisted audio preference
    const savedSettings = storage.get('settings', { soundEnabled: false });
    if (savedSettings && savedSettings.soundEnabled) {
      audio.setEnabled(true);
      ui.updateAudioStatus(true);
    }

    // 6. Start lightweight ambient terminal log stream
    ui.startTerminalStream();

    // 7. Developer Mode: Direct Level Access (Development Only)
    if (DEV_CONFIG.DEV_MODE) {
      this._setupDevControls();
      this._checkDevUrlLaunch();
    }

    console.log('[CyberEscape] Phase 3 Core Game Engine & HUD Integration initialized.');
  }

  _bindEvents() {
    // Top Bar Audio Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        audio.initialize(); // AudioContext unlock
        const isEnabled = audio.toggle();
        ui.updateAudioStatus(isEnabled);
        storage.set('settings', { soundEnabled: isEnabled });
        if (isEnabled) audio.playClick();
      });
    }

    // Main Menu: Start Game (Open Setup Modal)
    const btnStartSetup = document.getElementById('btn-start-setup');
    if (btnStartSetup) {
      btnStartSetup.addEventListener('click', () => {
        audio.initialize();
        audio.playClick();
        ui.clearNameError();
        ui.showModal('modal-player-setup');
      });
    }

    // Main Menu: How to Play
    const btnHowToPlay = document.getElementById('btn-open-how-to-play');
    if (btnHowToPlay) {
      btnHowToPlay.addEventListener('click', () => {
        audio.playClick();
        ui.showModal('modal-how-to-play');
      });
    }

    // Main Menu: Leaderboard Shell
    const btnLeaderboard = document.getElementById('btn-open-leaderboard');
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', () => {
        audio.playClick();
        ui.showModal('modal-leaderboard');
      });
    }

    // Main Menu: About
    const btnAbout = document.getElementById('btn-open-about');
    if (btnAbout) {
      btnAbout.addEventListener('click', () => {
        audio.playClick();
        ui.showModal('modal-about');
      });
    }

    // Generic Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        audio.playClick();
        ui.hideAllModals();
      });
    });

    // Player Setup Form Submission
    const setupForm = document.getElementById('form-player-setup');
    if (setupForm) {
      setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handlePlayerSetupSubmit();
      });
    }

    // HUD: Pause Button
    const btnPause = document.getElementById('btn-pause-game');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.gameManager.pauseGame();
      });
    }

    // HUD: Restart Button
    const btnRestart = document.getElementById('btn-restart-game');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (confirm('RESTART MISSION? ALL PROGRESS IN ACTIVE SECTOR WILL BE RESET.')) {
          this.gameManager.restartGame();
        }
      });
    }

    // Pause Modal: Resume Button
    const btnResume = document.getElementById('btn-resume-game');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.gameManager.resumeGame();
      });
    }

    // Pause Modal: Restart Mission Button
    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        this.gameManager.restartGame();
      });
    }

    // Pause Modal: Quit to Menu Button
    const btnQuit = document.getElementById('btn-quit-menu');
    if (btnQuit) {
      btnQuit.addEventListener('click', () => {
        this.gameManager.quitToMenu();
      });
    }

    // Game Over Modal: Retry Button
    const btnGoRestart = document.getElementById('btn-game-over-restart');
    if (btnGoRestart) {
      btnGoRestart.addEventListener('click', () => {
        this.gameManager.restartGame();
      });
    }

    // Game Over Modal: Return to Menu Button
    const btnGoMenu = document.getElementById('btn-game-over-menu');
    if (btnGoMenu) {
      btnGoMenu.addEventListener('click', () => {
        this.gameManager.quitToMenu();
      });
    }

    // Global Key Commands from Input Manager
    input.on('PAUSE', () => {
      const pauseModal = document.getElementById('modal-pause');
      if (pauseModal && pauseModal.classList.contains('active')) {
        this.gameManager.resumeGame();
      } else {
        this.gameManager.pauseGame();
      }
    });

    // Window Blur Auto-Pause (Prevents unfair player timeout during tab switch)
    window.addEventListener('blur', () => {
      this.gameManager.pauseGame();
    });
  }

  _handlePlayerSetupSubmit() {
    const inputEl = ui.elements.playerNameInput;
    if (!inputEl) return;

    const rawValue = inputEl.value;
    const trimmed = rawValue.trim();

    // Validation pattern matching DATA_MODEL.md: /^[a-zA-Z0-9 _-]{2,20}$/
    const nameRegex = /^[a-zA-Z0-9 _-]{2,20}$/;

    if (!trimmed || trimmed.length < 2) {
      ui.showNameError('IDENTIFIER TOO SHORT: Minimum 2 characters required.');
      audio.playError();
      return;
    }

    if (trimmed.length > 20) {
      ui.showNameError('IDENTIFIER EXCEEDED: Maximum 20 characters allowed.');
      audio.playError();
      return;
    }

    if (!nameRegex.test(trimmed)) {
      ui.showNameError('INVALID FORMAT: Letters, numbers, spaces, - and _ only.');
      audio.playError();
      return;
    }

    // Validated
    ui.clearNameError();
    this.gameManager.startGame(trimmed);
  }

  /**
   * Set up Developer Mode level select UI
   * DEVELOPMENT ONLY: strictly controlled by DEV_CONFIG.DEV_MODE
   *
   * ROOT CAUSE FIX: The previous implementation used querySelector('#screen-menu .menu-content')
   * but the actual HTML uses id="screen-main-menu" with class="menu-card" inside "menu-layout-wrapper".
   * This caused the entire dev container to silently never mount.
   */
  _setupDevControls() {
    if (!DEV_CONFIG.DEV_MODE) return;
    if (typeof document === 'undefined') return;

    // ── 1. Inject trigger button into main menu ──
    const menuCard = document.querySelector('#screen-main-menu .menu-card');
    if (!menuCard) {
      console.error('[DevMode] FATAL: Could not find #screen-main-menu .menu-card to inject dev controls.');
      return;
    }

    if (document.getElementById('btn-dev-open-selector')) return;

    const devTrigger = document.createElement('div');
    devTrigger.id = 'dev-trigger-container';
    devTrigger.className = 'dev-level-select-container';
    devTrigger.innerHTML = `
      <div class="dev-header font-mono">
        <span class="dev-badge">[DEV MODE ACTIVE]</span>
        <button type="button" id="btn-dev-open-selector" class="btn-dev-toggle" aria-label="Open Developer Level Selector">
          DEBUG // LEVEL ACCESS
        </button>
      </div>
    `;
    menuCard.appendChild(devTrigger);

    const openBtn = document.getElementById('btn-dev-open-selector');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        audio.initialize();
        this._openDevSelector();
      });
    }

    // ── 2. Create the dev level selector modal ──
    if (document.getElementById('modal-dev-level-select')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-dev-level-select';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'dev-modal-title');

    modalOverlay.innerHTML = `
      <div class="modal-content cyber-corner-brackets" style="max-width: 440px; border-top-color: var(--warning);">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge font-mono text-amber">DEBUG ACCESS // DEVELOPMENT BUILD</span>
            <h2 id="dev-modal-title" class="modal-title" style="color: var(--warning);">SELECT SECTOR</h2>
          </div>
          <button type="button" class="modal-close-btn" id="btn-dev-close" data-close-modal aria-label="Close Developer Selector">&times;</button>
        </div>
        <div class="modal-body" style="padding: 16px 20px;">
          <div class="dev-buttons-grid">
            <button type="button" class="btn-dev-level" data-dev-level="1" title="Sector 01: Password Breach">
              <span class="dev-lvl-num">01</span>
              <span class="dev-lvl-title">FIREWALL GATE</span>
            </button>
            <button type="button" class="btn-dev-level" data-dev-level="2" title="Sector 02: Digital Labyrinth">
              <span class="dev-lvl-num">02</span>
              <span class="dev-lvl-title">DIGITAL LABYRINTH</span>
            </button>
            <button type="button" class="btn-dev-level" data-dev-level="3" title="Sector 03: Memory Dump">
              <span class="dev-lvl-num">03</span>
              <span class="dev-lvl-title">MEMORY DUMP</span>
            </button>
            <button type="button" class="btn-dev-level" data-dev-level="4" title="Sector 04: Packet Corridor">
              <span class="dev-lvl-num">04</span>
              <span class="dev-lvl-title">PACKET CORRIDOR</span>
            </button>
            <button type="button" class="btn-dev-level" data-dev-level="5" title="Sector 05: Root Kernel">
              <span class="dev-lvl-num">05</span>
              <span class="dev-lvl-title">ROOT KERNEL</span>
            </button>
          </div>
          <div class="dev-panel-sub font-mono" style="margin-top: 12px; text-align: center;">
            DIRECT SECTOR ACCESS // TESTING & QA ONLY<br>
            <span class="text-muted">Keyboard: Ctrl + Shift + L</span>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button type="button" id="btn-dev-close-footer" class="btn btn-secondary" data-close-modal>CLOSE</button>
        </div>
      </div>
    `;

    document.getElementById('app').appendChild(modalOverlay);

    // ── 3. Bind modal close buttons ──
    const closeBtn = document.getElementById('btn-dev-close');
    const closeFooterBtn = document.getElementById('btn-dev-close-footer');
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeDevSelector());
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => this._closeDevSelector());

    // Close on backdrop click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) this._closeDevSelector();
    });

    // ── 4. Bind level launch buttons ──
    modalOverlay.querySelectorAll('[data-dev-level]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const levelNum = parseInt(btn.getAttribute('data-dev-level'), 10);
        if (levelNum >= 1 && levelNum <= 5) {
          this._closeDevSelector();
          audio.initialize();
          this.gameManager.startDevLevel(levelNum);
        }
      });
    });

    // ── 5. Bind keyboard shortcut Ctrl+Shift+L ──
    this._bindDevKeyboard();

    console.log('[DevMode] Developer level selector mounted successfully.');
  }

  /**
   * Open the developer level selector modal
   */
  _openDevSelector() {
    if (!DEV_CONFIG.DEV_MODE) return;
    const modal = document.getElementById('modal-dev-level-select');
    if (modal) {
      modal.classList.add('active');
      const firstBtn = modal.querySelector('.btn-dev-level');
      if (firstBtn) firstBtn.focus();
    }
  }

  /**
   * Close the developer level selector modal
   */
  _closeDevSelector() {
    const modal = document.getElementById('modal-dev-level-select');
    if (modal) modal.classList.remove('active');
  }

  /**
   * Bind Ctrl+Shift+L keyboard shortcut to open dev selector
   */
  _bindDevKeyboard() {
    if (!DEV_CONFIG.DEV_MODE) return;
    window.addEventListener('keydown', (e) => {
      if (!DEV_CONFIG.DEV_MODE) return;
      if (e.ctrlKey && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        const modal = document.getElementById('modal-dev-level-select');
        if (modal && modal.classList.contains('active')) {
          this._closeDevSelector();
        } else {
          this._openDevSelector();
        }
      }
    });
  }

  /**
   * Check for URL parameters ?dev=1&level=N
   * DEVELOPMENT ONLY
   */
  _checkDevUrlLaunch() {
    if (!DEV_CONFIG.DEV_MODE || typeof window === 'undefined' || !window.location) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const devParam = params.get('dev');
      const levelParam = params.get('level');
      const seedParam = params.get('seed');

      if ((devParam === '1' || devParam === 'true') && levelParam) {
        const lvl = parseInt(levelParam, 10);
        if (lvl >= 1 && lvl <= 5) {
          const devOptions = {};
          if (seedParam) {
            devOptions.seed = seedParam;
          }
          setTimeout(() => {
            audio.initialize();
            this.gameManager.startDevLevel(lvl, devOptions);
          }, 200);
        }
      }
    } catch (e) {
      console.warn('[DevMode] URL parsing skipped:', e);
    }
  }
}

// Bootstrap once DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
