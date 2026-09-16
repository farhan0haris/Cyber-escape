import { getLevelMetadata } from '../core/levelMetadata.js';
import { storage } from '../systems/StorageManager.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
      modalQuitConfirm: getEl('modal-quit-confirm'),
      modalGameOver: getEl('modal-game-over'),
      modalVictory: getEl('modal-victory'),

      // Input & Error
      playerNameInput: getEl('player-name-input'),
      playerNameError: getEl('player-name-error'),

      // Audio label
      audioStatusLabel: getEl('audio-status-label'),

      // Game Over elements
      goCause: getEl('game-over-cause'),
      goScore: getEl('game-over-score'),
      goSectors: getEl('game-over-sectors'),
      goTime: getEl('game-over-time'),

      // Victory elements
      vicPlayerBadge: getEl('victory-player-badge'),
      vicScore: getEl('victory-score'),
      vicSectors: getEl('victory-sectors'),
      vicTime: getEl('victory-time'),
      vicLives: getEl('victory-lives'),
      vicRating: getEl('victory-rating')
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
    if (modalId === 'modal-leaderboard') {
      this.renderLeaderboard();
    }
    const modal = document.getElementById(modalId);
    if (modal) {
      if (document.activeElement && document.activeElement !== document.body) {
        this._lastActiveTrigger = document.activeElement;
      }
      modal.classList.add('active');
      // Accessible focus on first interactive element, fallback to close/action button
      const focusTarget = modal.querySelector('input, button:not([data-close-modal]), button[data-close-modal], [tabindex="0"]');
      if (focusTarget) focusTarget.focus();
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
      if (this._lastActiveTrigger && typeof this._lastActiveTrigger.focus === 'function') {
        this._lastActiveTrigger.focus();
        this._lastActiveTrigger = null;
      }
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
    if (this._lastActiveTrigger && typeof this._lastActiveTrigger.focus === 'function') {
      this._lastActiveTrigger.focus();
      this._lastActiveTrigger = null;
    }
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
   * Show Mission Victory modal with complete performance rating
   * @param {Object} state
   */
  showVictory(state) {
    const playerName = state.playerName || 'OPERATOR';
    const finalScore = state.score || 0;
    const lives = typeof state.lives === 'number' ? state.lives : 3;
    const totalTime = state.totalTimeElapsed || 0;

    if (this.elements.vicPlayerBadge) {
      this.elements.vicPlayerBadge.textContent = `AGENT ${playerName.toUpperCase()} // ROOT OVERRIDE GRANTED`;
    }
    if (this.elements.vicScore) {
      this.elements.vicScore.textContent = String(finalScore).padStart(5, '0');
    }
    if (this.elements.vicSectors) {
      this.elements.vicSectors.textContent = '5 / 5 SECTORS';
    }
    if (this.elements.vicTime) {
      const totalMins = Math.floor(totalTime / 60);
      const totalSecs = totalTime % 60;
      this.elements.vicTime.textContent = `${String(totalMins).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`;
    }
    if (this.elements.vicLives) {
      this.elements.vicLives.textContent = `${lives} ${lives === 1 ? 'NODE' : 'NODES'}`;
    }
    if (this.elements.vicRating) {
      if (lives === 3 && finalScore >= 5000) {
        this.elements.vicRating.textContent = 'CYBER SPECTRE (ELITE)';
        this.elements.vicRating.className = 'card-val text-emerald';
      } else if (lives >= 2) {
        this.elements.vicRating.textContent = 'NETWORK OPERATIVE';
        this.elements.vicRating.className = 'card-val text-cyan';
      } else {
        this.elements.vicRating.textContent = 'SURVIVOR';
        this.elements.vicRating.className = 'card-val text-amber';
      }
    }

    this.showModal('modal-victory');
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

  /**
   * Render dynamic leaderboard scores or empty state
   */
  renderLeaderboard() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    let rawBoard = [];
    try {
      rawBoard = storage.get('leaderboard', []);
    } catch (err) {
      console.warn('[UIManager] Failed to load leaderboard from storage:', err);
      rawBoard = [];
    }

    const entries = Array.isArray(rawBoard) ? rawBoard : [];
    const validEntries = entries
      .filter((e) => e && (typeof e.score === 'number' || !isNaN(parseInt(e.score, 10))))
      .sort((a, b) => {
        const scoreA = Number(a.score) || 0;
        const scoreB = Number(b.score) || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        const timeA = a.time != null ? Number(a.time) : (a.totalTime != null ? Number(a.totalTime) : Infinity);
        const timeB = b.time != null ? Number(b.time) : (b.totalTime != null ? Number(b.totalTime) : Infinity);
        if (timeA !== timeB) return timeA - timeB;
        const dateA = a.completedAt || a.date || a.timestamp || 0;
        const dateB = b.completedAt || b.date || b.timestamp || 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    if (validEntries.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-empty-state">
          <div class="empty-icon-shield" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 class="empty-title font-mono text-cyan">NO VERIFIED RUNS</h3>
          <p class="empty-desc">
            Complete an unbroken 5-sector mission to establish a verified record in the security archives.
          </p>
        </div>
      `;
      return;
    }

    const rowsHtml = validEntries.map((entry, index) => {
      const rank = index + 1;
      const rankStr = String(rank).padStart(2, '0');
      const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-standard';
      const rankTagClass = rank <= 3 ? `rank-tag-${rank}` : 'rank-tag-default';

      const playerName = (entry.player || entry.playerName || entry.name || 'OPERATOR').slice(0, 20);
      const scoreVal = (Number(entry.score) || 0).toLocaleString('en-US');

      let timeStr = '--:--';
      const timeSecs = entry.time != null ? entry.time : entry.totalTime;
      if (typeof timeSecs === 'number' && !isNaN(timeSecs)) {
        const mins = Math.floor(timeSecs / 60);
        const secs = Math.floor(timeSecs % 60);
        timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      let dateStr = '--';
      const timestamp = entry.completedAt || entry.date || entry.timestamp;
      if (timestamp) {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      }

      return `
        <div class="leaderboard-row ${rankClass}" role="row">
          <div class="col-rank" role="cell">
            <span class="rank-tag font-mono ${rankTagClass}">#${rankStr}</span>
          </div>
          <div class="col-player" role="cell">
            <span class="player-name font-mono">${escapeHtml(playerName)}</span>
          </div>
          <div class="col-score font-mono text-cyan" role="cell">
            ${scoreVal}
          </div>
          <div class="col-time font-mono" role="cell">
            ${timeStr}
          </div>
          <div class="col-date font-mono text-muted" role="cell">
            ${dateStr}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="leaderboard-table font-mono" role="table" aria-label="Top escape records">
        <div class="leaderboard-header-row" role="row">
          <span class="col-rank" role="columnheader">RANK</span>
          <span class="col-player" role="columnheader">OPERATOR</span>
          <span class="col-score" role="columnheader">SCORE</span>
          <span class="col-time" role="columnheader">TIME</span>
          <span class="col-date" role="columnheader">DATE</span>
        </div>
        <div class="leaderboard-rows" role="rowgroup">
          ${rowsHtml}
        </div>
      </div>
    `;
  }
}

export const ui = new UIManager();
