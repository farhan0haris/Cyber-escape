/**
 * UI Manager
 * Handles DOM views, screens, modals, HUD updates, and notifications
 */

import { getLevelMetadata } from '../core/levelMetadata.js';

export class UIManager {
  constructor() {
    const getEl = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);

    this.elements = {
      app: getEl('app'),
      mainMenu: getEl('screen-main-menu'),
      gameShell: getEl('screen-game-shell'),
      toastContainer: getEl('toast-container'),

      // HUD elements
      hudLevelVal: getEl('hud-level-val'),
      hudPlayerVal: getEl('hud-player-val'),
      hudLivesContainer: getEl('hud-lives-container'),
      hudTimerVal: getEl('hud-timer-val'),
      hudScoreVal: getEl('hud-score-val'),
      hudObjectiveVal: getEl('hud-objective-val'),
      hudTotalTimeVal: getEl('hud-total-time-val'),

      // Modals
      modalPlayerSetup: getEl('modal-player-setup'),
      modalHowToPlay: getEl('modal-how-to-play'),
      modalLeaderboard: getEl('modal-leaderboard'),
      modalAbout: getEl('modal-about'),
      modalPause: getEl('modal-pause'),
      modalGameOver: getEl('modal-game-over'),

      // Input & Error
      playerNameInput: getEl('player-name-input'),
      playerNameError: getEl('player-name-error'),

      // Audio label
      audioStatusLabel: getEl('audio-status-label'),

      // Game Over elements
      goCause: getEl('game-over-cause'),
      goScore: getEl('game-over-score'),
      goSectors: getEl('game-over-sectors'),
      goTime: getEl('game-over-time')
    };

    this._commandLogInterval = null;
  }

  /**
   * Switch active top-level screen view
   * @param {'MENU' | 'GAME'} screenId
   */
  showScreen(screenId) {
    if (screenId === 'MENU') {
      if (this.elements.gameShell) this.elements.gameShell.classList.remove('active');
      if (this.elements.mainMenu) this.elements.mainMenu.classList.add('active');
    } else if (screenId === 'GAME') {
      if (this.elements.mainMenu) this.elements.mainMenu.classList.remove('active');
      if (this.elements.gameShell) this.elements.gameShell.classList.add('active');
    }
  }

  /**
   * Show modal by element ID
   * @param {string} modalId
   */
  showModal(modalId) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      // Accessible focus on first interactive element
      const firstInput = modal.querySelector('input, button:not([data-close-modal])');
      if (firstInput) firstInput.focus();
    }
  }

  /**
   * Hide modal by element ID
   * @param {string} modalId
   */
  hideModal(modalId) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Hide all active modals
   */
  hideAllModals() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.modal-overlay.active').forEach((modal) => {
      modal.classList.remove('active');
    });
  }

  /**
   * Show a temporary toast notification
   * @param {string} message
   * @param {'info' | 'success' | 'warning' | 'danger'} type
   * @param {number} durationMs
   */
  showNotification(message, type = 'info', durationMs = 2800) {
    if (!this.elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '[INFO]';
    if (type === 'success') icon = '[OK]';
    if (type === 'warning') icon = '[WARN]';
    if (type === 'danger') icon = '[ALERT]';

    toast.textContent = `${icon} ${message}`;
    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, durationMs);
  }

  /**
   * Update HUD display with current game state
   * @param {Object} state
   */
  updateHUD(state) {
    if (!state) return;

    // Player name (defensive textContent)
    if (this.elements.hudPlayerVal) {
      this.elements.hudPlayerVal.textContent = state.playerName || 'OPERATOR';
    }

    // Level
    const meta = getLevelMetadata(state.currentLevel);
    if (this.elements.hudLevelVal) {
      const lvlStr = String(state.currentLevel).padStart(2, '0');
      this.elements.hudLevelVal.textContent = `${lvlStr} / 05`;
    }

    // Score
    if (this.elements.hudScoreVal) {
      this.elements.hudScoreVal.textContent = String(state.score).padStart(5, '0');
    }

    // Timer display (MM:SS)
    if (this.elements.hudTimerVal) {
      const mins = Math.floor(state.levelTimeRemaining / 60);
      const secs = state.levelTimeRemaining % 60;
      this.elements.hudTimerVal.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      // Warning/Danger classes
      this.elements.hudTimerVal.classList.remove('warning', 'danger');
      if (state.levelTimeRemaining <= 10) {
        this.elements.hudTimerVal.classList.add('danger');
      } else if (state.levelTimeRemaining <= 20) {
        this.elements.hudTimerVal.classList.add('warning');
      }
    }

    // Lives display
    if (this.elements.hudLivesContainer) {
      const nodes = this.elements.hudLivesContainer.querySelectorAll('.life-node');
      nodes.forEach((node, index) => {
        if (index < state.lives) {
          node.classList.remove('depleted');
        } else {
          node.classList.add('depleted');
        }
      });
    }

    // Total elapsed time
    if (this.elements.hudTotalTimeVal) {
      const totalMins = Math.floor(state.totalTimeElapsed / 60);
      const totalSecs = state.totalTimeElapsed % 60;
      this.elements.hudTotalTimeVal.textContent = `ELAPSED: ${String(totalMins).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`;
    }

    // Update Objective description
    if (this.elements.hudObjectiveVal) {
      this.elements.hudObjectiveVal.textContent = meta.objective || 'AWAITING SECTOR INITIALIZATION...';
    }
  }

  /**
   * Show Game Over modal with session statistics
   * @param {string} reason
   * @param {Object} state
   */
  showGameOver(reason, state) {
    if (this.elements.goCause) {
      this.elements.goCause.textContent = reason || 'INTEGRITY EXHAUSTED';
    }
    if (this.elements.goScore) {
      this.elements.goScore.textContent = String(state.score || 0).padStart(5, '0');
    }
    if (this.elements.goSectors) {
      const completedCount = Array.isArray(state.completedLevels) ? state.completedLevels.length : 0;
      this.elements.goSectors.textContent = `${completedCount} / 5 SECTORS`;
    }
    if (this.elements.goTime) {
      const totalMins = Math.floor((state.totalTimeElapsed || 0) / 60);
      const totalSecs = (state.totalTimeElapsed || 0) % 60;
      this.elements.goTime.textContent = `${String(totalMins).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`;
    }
    this.showModal('modal-game-over');
  }

  /**
   * Display player name validation error
   * @param {string} msg
   */
  showNameError(msg) {
    if (this.elements.playerNameError) {
      this.elements.playerNameError.textContent = msg;
    }
    if (this.elements.playerNameInput) {
      this.elements.playerNameInput.classList.add('input-error');
    }
  }

  /**
   * Clear player name validation error
   */
  clearNameError() {
    if (this.elements.playerNameError) {
      this.elements.playerNameError.textContent = '';
    }
    if (this.elements.playerNameInput) {
      this.elements.playerNameInput.classList.remove('input-error');
    }
  }

  /**
   * Update audio status button label
   * @param {boolean} isEnabled
   */
  updateAudioStatus(isEnabled) {
    if (this.elements.audioStatusLabel) {
      this.elements.audioStatusLabel.textContent = isEnabled ? 'ON' : 'OFF';
      this.elements.audioStatusLabel.className = isEnabled ? 'text-emerald' : 'text-muted';
    }
  }

  /**
   * Start lightweight atmospheric terminal command stream (Phase 2)
   */
  startTerminalStream() {
    if (typeof document === 'undefined') return;
    const logContainer = document.getElementById('terminal-command-log');
    if (!logContainer) return;

    const streamLines = [
      '> [FIREWALL] Port 22 listening on loopback interface.',
      '> [TELEMETRY] Cryptographic sandbox hash: 0x7F9B24DA.',
      '> [INTEGRITY] Core subsystems locked. Node watchdog heartbeat nominal.',
      '> [SECTOR_SCAN] Sector 01-05 routing channels initialized.'
    ];

    let lineIndex = 0;
    this._commandLogInterval = setInterval(() => {
      if (document.hidden) return;
      if (lineIndex < streamLines.length) {
        const newLine = document.createElement('div');
        newLine.className = 'log-line';
        newLine.textContent = streamLines[lineIndex];
        const cursorLine = logContainer.querySelector('.log-cursor-line');
        if (cursorLine) {
          logContainer.insertBefore(newLine, cursorLine);
        } else {
          logContainer.appendChild(newLine);
        }
        lineIndex++;
      } else {
        clearInterval(this._commandLogInterval);
      }
    }, 5000);
  }
}

export const ui = new UIManager();
